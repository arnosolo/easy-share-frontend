import SparkMD5 from "spark-md5";
import { reactive, Ref, ref } from "vue"
import { asyncState } from "../types"
import { FileInfo } from "./useFileInfoList";

class UploadInfo {
  file: File;
  createTime: number;
  id: string;
  hashState: asyncState;
  hashProgress: number;
  md5: string;
  md5WithExten: string
  uploadState: asyncState;
  uploadProgress: number;
  mergeState: asyncState;
  controllers: Array<AbortController>;
  static cnt: number = 0;
  constructor(file: File) {
    this.file = file
    this.md5 = ""
    this.md5WithExten = ""
    this.createTime = Date.now()
    this.id = `${Date.now()}-${UploadInfo.cnt}`
    this.hashState = asyncState.beforeStart
    this.hashProgress = 0
    this.uploadState = asyncState.beforeStart
    this.uploadProgress = 0
    this.mergeState = asyncState.beforeStart
    this.controllers = new Array<AbortController>();
    UploadInfo.cnt++
  }
}

const useUploadList = (url_base: string, fileList: Array<FileInfo>) => {
  const chunkSize = 10 * 1024 * 1024 // 10MB

  let uploadList = reactive<Array<UploadInfo>>(new Array<UploadInfo>())

  function addUpload(ls: Array<File>) {
    for(let file of ls) {
      uploadList.unshift(new UploadInfo(file))
    }

    uploadList.forEach(async it => {
      if(it.uploadState == asyncState.beforeStart) {
        try {
          await upload(it, url_base)
        } catch (error) {
          it.uploadState = asyncState.failed
          console.error(error)
        }
      }
    })
  }

  function removeUpload(id: string) {
    const index = uploadList.findIndex(it => it.id == id)
    if(index != -1) {
      uploadList.splice(index, 1)
    }
  }

  async function upload(it: UploadInfo, url_base:string) {
    it.uploadState = asyncState.waitRes

    // 1. Slice file
    it.hashState = asyncState.waitRes
    let chunks = sliceFile(it.file, chunkSize).sort((a, b) => a.id - b.id)
    
    // 2. Compute MD5
    try {
      it.md5 = await getMD5(chunks, it)
      it.hashState = asyncState.success
    } catch (error) {
      it.hashState = asyncState.failed
      console.error(error)
    }

    console.log(it.file);
    
    // 3. Check if file already exist
    let fileExist = false
    const md5WithExten = `${it.md5}.${it.file.name.split('.').pop()}`
    it.md5WithExten = md5WithExten
    try {
      const msg = `?????????????????????${md5WithExten} ?????? ???????????????????????????`
        console.log(msg);
        const form = new FormData();
        form.append('md5', it.md5);
        form.append('md5WithExten', md5WithExten);
        form.append('filename', it.file.name);
        form.append('size', `${it.file.size}`);
        form.append('type', it.file.type);
        form.append('lastModified', `${it.file.lastModified}`);
        const url = `${url_base}/api/v1/file/exist`
        const res = await fetch(url, {
          method: 'post',
          body: form,
          headers: {
            'Authorization': ('Bearer ' + localStorage.getItem('token')) ?? ''
          },
          mode: 'cors',
        })
        const {existAndComplete} = await res.json()
        if (existAndComplete) {
          fileExist = true
          it.uploadState = asyncState.success
        }
    } catch (error) {
      it.uploadState = asyncState.failed
      console.log(error)
    }

    if(fileExist) {
      // 3.a File already exist
      setFileInfo(it)
    } else {
      // 3.b File not exist, upload slices
      console.log(`????????????${md5WithExten}????????????????????????,????????????`);
      let successCount = 0
      const uploadStatePromises = chunks.map(async (chunk) => {
        try {
          console.log(`???????????? ${chunk.id}`);
          const form = new FormData();
          form.append('chunkData', chunk.data);
          form.append('chunkId', `${chunk.id}-${md5WithExten}`);
          form.append('filename', it.file.name);
          form.append('md5', it.md5);
          form.append('md5WithExten', md5WithExten);
          const controller = new AbortController(); // ??????????????????fetch??????
          it.controllers.push(controller)
          const { signal } = controller; // ??????????????????fetch??????
          const url = `${url_base}/api/v1/file/upload`
          const res = await fetch(url, {
            method: 'post',
            headers: {
              'Authorization': ('Bearer ' + localStorage.getItem('token')) ?? ''
            },
            body: form,
            mode: 'cors',
            signal,
          })
          const resJson = await res.json()
          if (resJson.success) {
            successCount++
            it.uploadProgress = successCount / chunks.length * 100
            console.log(`Upload ${it.uploadProgress.toFixed(0)}%`);
          } else {
            console.error(`Upload failed: ${chunk.id}-${md5WithExten}`);
            it.uploadState = asyncState.failed
          }
        } catch (error) {
          console.error(error);
          it.uploadState = asyncState.failed
        }
      })

      // 3.b.1 Wait until all slices was uploaded
      let allUpoaded = false
      try {
        await Promise.all(uploadStatePromises)
        if(successCount === chunks.length) {
          allUpoaded = true
          console.log(`All slices uploaded`);
        } else {
          console.log(`Some slices failed to upload`);
        }
      } catch (error) {
        console.error(error)
        it.uploadState = asyncState.failed
      }

      // 3.6.2 Merge slices
      if (allUpoaded) {
        it.mergeState = asyncState.waitRes
        try {
          console.log(`Sending merge req: ${it.file.name}`);
          const form = new FormData();
          form.append('filename', it.file.name);
          form.append('chunkSize', `${chunkSize}`);
          form.append('md5', it.md5);
          form.append('md5WithExten', md5WithExten);
          form.append('size', `${it.file.size}`);
          form.append('type', it.file.type);
          form.append('lastModified', `${it.file.lastModified}`);
          const url = `${url_base}/api/v1/file/merge`
          const res = await fetch(url, {
            method: 'post',
            headers: {
              'Authorization': ('Bearer ' + localStorage.getItem('token')) ?? ''
            },
            body: form,
            mode: 'cors',
          })
          const resJson = await res.json()
          if (resJson.success) {
            console.log(`Server: ${resJson.msg}`);
            it.uploadState = asyncState.success
            it.mergeState = asyncState.success
            
            setFileInfo(it)
          } else {
            const msg = `Server: ${resJson.msg}`
            console.error(msg);
            it.uploadState = asyncState.failed
            it.mergeState = asyncState.failed
          }
        } catch (error) {
          console.error(error);
          it.mergeState = asyncState.failed
          it.uploadState = asyncState.failed
        }
      }
    }

  }

  function setFileInfo(it: UploadInfo) {
    if(it.file.type == "image/png" || it.file.type == "image/jpeg") {
      var reader = new FileReader();
      reader.readAsDataURL(it.file);
      reader.onloadend = (e) => {
        const imgDataUrl = e.target?.result
        fileList.unshift(new FileInfo({
          md5: it.md5,
          md5WithExten: it.md5WithExten,
          filename: it.file.name,
          lastModified: it.file.lastModified,
          type: it.file.type,
          size: it.file.size,
          hasThumbnail: true,
          thumbnail: typeof(imgDataUrl)=="string" ? imgDataUrl : "",
          createdByUpload: true
        }))
        removeUpload(it.id)
      };
    } else {
      fileList.unshift(new FileInfo({
        md5: it.md5,
        md5WithExten: it.md5WithExten,
        filename: it.file.name,
        lastModified: it.file.lastModified,
        type: it.file.type,
        size: it.file.size,
        createdByUpload: true
      }))
      removeUpload(it.id)
    }
  }

  function uploadById(id: string) {
    const index = uploadList.findIndex(it => it.id == id)
    if(index != -1) {
      upload(uploadList[index], url_base)
    }
  }

  function sliceFile(file: File, chunkSize: number) {
    const chunks = []
    let index = 0
    let cur = 0
    while (cur < file.size) {
      chunks.push({
        id: index,
        data: file.slice(cur, cur + chunkSize)
      })
      index++
      cur += chunkSize
    }
    return chunks
  }

  const getMD5 = (chunks:Array<{id:number, data:Blob}>, it:UploadInfo) => new Promise<string>((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    let count = 0
    const loadNext = (index: number) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(chunks[index].data);
      reader.onload = e => {
        count++;
        // const msg = `${str.hash_calculation_progress} ${Number(count / chunks.length * 100).toFixed(0)}%`
        // this.uploadStatus = msg
        const progress = count / chunks.length * 100
        console.log(`Hash progress: ${progress.toFixed(0)}%`);
        it.hashProgress = progress
        if(e.target != null) {
          // @ts-ignore
          spark.append(e.target.result)
        }
        if (count === chunks.length) {
          resolve(spark.end())
          return
        }
        loadNext(count);
      }
    };
    loadNext(0);
  })
 
  function updateUploadState(id:string, state: asyncState) {
    const index = uploadList.findIndex(it => it.id == id)
    if(index != -1) {
      const it = uploadList[index]
      it.uploadState = state
      abortReq(it)
    }
  }

  function abortReq(it: UploadInfo) {
    it.controllers.forEach(c => c.abort())
  }

  return {
    uploadList,
    addUpload,
    removeUpload,
    updateUploadState,
    uploadById,
  }
}

export { useUploadList, UploadInfo }