import { ref, reactive } from "vue"
import { useRouter } from "vue-router"
import { asyncState } from "../types"

export class FileInfo {
  md5: string
  filename: string
  md5WithExten: string
  createTime: number
  lastModified: number
  exten: string
  type: string
  size: number
  hasThumbnail: boolean
  thumbnail: string
  createdByUpload: boolean
  selected: boolean
  deleteState: asyncState
  constructor({md5="", filename="", md5WithExten="", lastModified=0, createTime=Date.now(), type="", size=0, hasThumbnail=false, thumbnail="", createdByUpload=false}) {
    this.md5 = md5
    this.filename = filename
    this.md5WithExten = md5WithExten
    this.exten = filename.split('.').pop() ?? "unknow"
    this.createTime = createTime
    this.lastModified = lastModified
    this.type = type
    this.size = size
    this.hasThumbnail = hasThumbnail
    this.thumbnail = thumbnail
    this.createdByUpload = createdByUpload
    this.selected = false
    this.deleteState = asyncState.beforeStart
  }

  async deleteItem(url_base: string, deleteFileItem: (md5:string) => void) {
    this.deleteState = asyncState.waitRes
    const form = new FormData()
    const url = `${url_base}/api/v1/file/${this.md5WithExten}`
    try {
      const res = await fetch(url, {
        method: 'delete',
        headers: {
          'Authorization': ('Bearer ' + localStorage.getItem('token')) ?? ''
        },
        mode: 'cors',
        body: form
      })
      const { success, msg } = await res.json()
      if (success) {
        this.deleteState = asyncState.success
        console.log(`Server: ${msg}`);
        deleteFileItem(this.md5)
      } else {
        this.deleteState = asyncState.failed
        console.error(`Server: ${msg}`);
      }
    } catch (error) {
      this.deleteState = asyncState.failed
      console.error(error)
    }
  }
}

const useFileInfoList = (url_base: string) => {
  const router = useRouter()
  // File list
  let fileList = reactive<Array<FileInfo>>(new Array<FileInfo>())

  function setFileList(ls: Array<FileInfo>) {
    if(fileList.length > 0) {
      fileList.splice(0, fileList.length)
    }
    
    ls.forEach(it => {
      fileList.push(new FileInfo({
        ...it
      }))
    })
    console.log("Got fileList:", ls);
    console.log("Got Ref<fileList>:", fileList);
  }

  function deleteFileItem(md5: string) {
    const i = fileList.findIndex(file => file.md5 === md5)
    fileList.splice(i, 1)
  }

  function clearSelected() {
    fileList.forEach(it => it.selected = false)
  }

  function deleteSelected() {
    fileList.forEach(it => {
      if(it.selected) {
        console.log("deleteSelected");
        it.deleteItem(url_base, deleteFileItem)
      }
    })
  }

  function updateFileName(md5: string, newName: string): boolean {
    const res = fileList.find(it => it.md5 == md5)
    if(res) {
      res.filename = newName
      return true
    } else {
      return false
    }
  }

  // List Files
  let listFilesState = ref(asyncState.beforeStart)
  async function listAllFiles() {
    listFilesState.value = asyncState.waitRes
    const form = new FormData()
    const url = `${url_base}/api/v1/file/list-all`
    try {
      const res = await fetch(url, {
        method: 'post',
        mode: 'cors',
        headers: {
          'Authorization': ('Bearer ' + localStorage.getItem('token')) ?? ''
        },
        body: form
      })
      if(res.status == 401) {
        router.push('/login')
        listFilesState.value = asyncState.failed
        return
      }
      const resObj = await res.json()
      const {success, msg} = resObj
      if (!success) {
        listFilesState.value = asyncState.failed
        console.warn(`服务器: ${msg}`);
      } else {
        setFileList(resObj.fileList.reverse())
        listFilesState.value = asyncState.success
        // console.log("Got fileList", fileList);
        setTimeout(() => {
          listFilesState.value = asyncState.beforeStart
        }, 5000);
      }
    } catch (error) {
      listFilesState.value = asyncState.failed
      console.error(error)
    }
  }

  return {
    clearSelected,
    deleteSelected,
    fileList,
    setFileList,
    deleteFileItem,
    updateFileName,
    listAllFiles,
    listFilesState,
  }
}

export { useFileInfoList }