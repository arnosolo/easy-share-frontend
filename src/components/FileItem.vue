<template>
  <div class="file-item">
    <div class="file-item-title">
      <span @click="needNewName = true" v-show="!needNewName">{{fileInfo.filename}}</span>
      <input v-if="needNewName" type="text" v-model="newName">
      <button v-if="needNewName" @click="rename" class="light-button" :class="{inactive: renameState == asyncState.waitRes}">
        <span v-if="renameState == asyncState.waitRes">{{str.renaming}}</span>
        <div v-else-if="renameState == asyncState.failed" class="file-item-msg">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{`${str.rename}${str.failed}`}}</span>
        </div>
        <div v-else-if="renameState == asyncState.success" class="file-item-msg">
          <img src="../assets/success.svg" alt="success-img">
          <span>{{`${str.rename}${str.success}`}}</span>
        </div>
        <div v-else class="file-item-msg">
          <img src="../assets/check.svg" alt="cancel-img">
          <span>{{str.rename}}</span>
        </div>
      </button>
      <button v-if="needNewName" @click="cancelRename" class="light-button file-item-msg">
        <img src="../assets/cancel.svg" alt="cancel-img">
        <span>{{str.cancel}}</span>
      </button>
    </div>
    <div class="file-item-control">
      <button @click="deleteItem" class="light-button" :class="{inactive: deleteState == asyncState.waitRes}">
        <span v-if="deleteState == asyncState.waitRes">{{str.deleting}}</span>
        <div v-else-if="deleteState == asyncState.failed" class="file-item-msg">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{str.deleteAgain}}</span>
        </div>
        <div class="file-item-msg" v-else>
          <img src="../assets/delete.svg" alt="delete-img">
          <span>{{str.delete}}</span>
        </div>
      </button>
      <button @click="copyLink" class="light-button">
        <div class="file-item-msg" v-if="linkCopyState == asyncState.success">
          <img src="../assets/success.svg" alt="success-img">
          <span>{{str.copied}}</span>
        </div>
        <div class="file-item-msg" v-else-if="linkCopyState == asyncState.failed">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{str.copyFailed}}</span>
        </div>
        <div class="file-item-msg" v-else>
          <img src="../assets/copy.svg" alt="copy-img">
          <span>{{str.copyLink}}</span>
        </div>
      </button>
      <button @click="ToggleShowDetail" class="light-button">
        <div v-if="!showDetail" class="file-item-msg">
          <span>{{str.more}}</span>
          <img src="../assets/fold_arrow_down.svg" alt="fold_arrow_down-img">
        </div>
        <div v-else class="file-item-msg">
          <span>{{str.less}}</span>
          <img src="../assets/fold_arrow_up.svg" alt="fold_arrow_up-img">
        </div>
      </button>
    </div>
    <div class="file-item-detail" v-if="showDetail">
      <div class="file-item-detail-qrcode">
        <img :src="qrCodeUrl" alt="preview_img">
        <span>{{str.scan_to_download}}</span>
      </div>
      <div v-if="isImg">
        <img v-show="imgLoaded" :src="thumbnailUrl" @load="handleImgLoaded" alt="preview_img">
        <div v-if="!imgLoaded" class="loading-plane"></div>
      </div>
      <button @click="downloadFile" class="light-button" :class="{inactive: downloadState == asyncState.waitRes}">
        <span v-if="downloadState == asyncState.waitRes">{{str.downloading}} {{downloadProgress.toFixed(0)}}%</span>
        <div v-else-if="downloadState == asyncState.failed" class="file-item-msg">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{str.download_failed}}</span>
        </div>
        <div v-else-if="downloadState == asyncState.success" class="file-item-msg">
          <img src="../assets/success.svg" alt="failed-img">
          <span>{{str.download_success}}</span>
        </div>
        <div v-else class="file-item-msg">
          <img src="../assets/download.svg" alt="download-img">
          <span>{{str.download}}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { inject, onMounted, reactive, ref} from 'vue'
import { LangString } from '../langStrings';
import { asyncState } from '../types'
import { FileInfo } from '../hooks/useFileInfoList'
import QRCode from 'qrcode'

export default {
  name: "FileItem",
  props: {
    str: {
      type: LangString,
      required: true,
    },
    fileInfo: {
      type: FileInfo,
      required: true,
    },
    url_base: {
      type: String
    },
  },
  // @ts-ignore
  setup(props, context) {
    let linkCopyState = ref(asyncState.beforeStart)
    let deleteState = ref(asyncState.beforeStart)
    let downloadState = ref(asyncState.beforeStart)
    let showDetail = ref(false)
    let qrCreated = ref(false)
    let qrCodeUrl = ref("")
    const fileUrl = `${props.url_base}/api/v1/file/${props.fileInfo.md5WithExten}`
    let thumbnailUrl = ""
    if(props.fileInfo.hasThumbnail) {
      if(props.fileInfo.createdByUpload) {
        thumbnailUrl = props.fileInfo.thumbnail
      } else {
        thumbnailUrl = `${props.url_base}/api/v1/file/${props.fileInfo.thumbnail}`
      }
    } else {
      thumbnailUrl = fileUrl
    }
    
    let isImg = ref(false)
    let imgLoaded = ref(false)
    let downloadProgress = ref(0)
    
    async function ToggleShowDetail() {
      showDetail.value = !showDetail.value

      // Create qrcode
      if(!qrCreated.value) {
        for(let t of new Array("svg", "PNG", "png", "jpg", "jpeg", "JPG", "JPEG", "gif")) {
          if(props.fileInfo.filename.split('.').pop() == t) {
            isImg.value = true
            break;
          }
          console.log(isImg.value);
        }
        try {
          qrCodeUrl.value = await QRCode.toDataURL(fileUrl)
          qrCreated.value = true
        } catch (err) {
          console.error(err)
        }
      }
    }

    async function downloadFile() {
      downloadState.value = asyncState.waitRes
      try {
        // 1.Send req
        const res = await fetch(fileUrl, {
          method: 'get',
          mode: 'cors',
        })

        if(res.body != null) {
          // 2.Get readable stream
          const reader = res.body.getReader();
          const contentLength = Number(res.headers.get('Content-Length'));

          // 3.readable stream -> Uint8Array
          let receivedLength = 0;
          let chunks = [];
          while(true) {
            const {done, value} = await reader.read();
            if (done) {
              break;
            }
            chunks.push(value);
            if(value != undefined) receivedLength += value.length;
            downloadProgress.value = 100 * receivedLength / contentLength
            console.log(`Received ${receivedLength} of ${contentLength}`)
          }

          
          let chunksAll = new Uint8Array(receivedLength); // (4.1)
          let position = 0;
          for(let chunk of chunks) {
            if(chunk != undefined) {
              chunksAll.set(chunk, position); // (4.2)
              position += chunk.length;
            }
          }

          // 4.Uint8Array -> blob
          let blob = new Blob([chunksAll])

          // 5.Download blob
          if(blob != undefined) {
            const blobUrl = window.URL.createObjectURL(blob)
            let a = document.createElement('a');
            a.href = blobUrl;
            a.style.display = "none"
            a.download = `${props.fileInfo.filename}`;
            document.body.appendChild(a)
            a.click();
            downloadState.value = asyncState.success
            // a.remove()
            // window.URL.revokeObjectURL(blobUrl)
          } else {
            downloadState.value = asyncState.failed
          }

        }
      } catch (error) {
        downloadState.value = asyncState.failed
        console.error(error)
      }
    }

    async function copyLink() {
      if(navigator.clipboard == undefined) {
        console.log("Brower doesn't support clipboard");
        linkCopyState.value = asyncState.failed
      } else {
        try {
          await navigator.clipboard.writeText(fileUrl)
          console.log("Link copied");
          linkCopyState.value = asyncState.success
          setTimeout(() => {
            linkCopyState.value = asyncState.beforeStart
          }, 2000)
        } catch (error) {
          console.error(error)
          linkCopyState.value = asyncState.failed
        }
      }
    }

    const deleteFileItem = inject("deleteFileItem") as Function

    async function deleteItem() {
      if (confirm(`${props.str.comfirm_delete} ${props.fileInfo.filename}`)) {
        deleteState.value = asyncState.waitRes
        const form = new FormData()
        const url = `${props.url_base}/api/v1/file/${props.fileInfo.md5WithExten}`
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
            deleteState.value = asyncState.success
            console.log(`服务器: ${msg}`);
            // context.emit('delete-item', props.fileInfo!.md5)
            if(props.fileInfo != undefined) {
              deleteFileItem(props.fileInfo.md5)
            }
          } else {
            deleteState.value = asyncState.failed
            console.error(`服务器: ${msg}`);
          }
        } catch (error) {
          deleteState.value = asyncState.failed
          console.error(error)
        }
      }
    }

    function handleImgLoaded() {
      imgLoaded.value = true
    }

    const updateFileName = inject("updateFileName") as Function
    let newName = ref(props.fileInfo.filename.split(".")[0])
    let needNewName = ref(false)
    let renameState = ref(asyncState.beforeStart)
    async function rename() {
      renameState.value = asyncState.waitRes
      const form = new FormData()
      form.append("newName", `${newName.value}.${props.fileInfo.exten}`)
      form.append("md5", props.fileInfo.md5)
      const url = `${props.url_base}/api/v1/file/rename`
      try {
        const res = await fetch(url, {
          method: 'post',
          headers: {
            'Authorization': ('Bearer ' + localStorage.getItem('token')) ?? ''
          },
          mode: 'cors',
          body: form
        })
        const { success } = await res.json()
        if (success) {
          renameState.value = asyncState.success
          updateFileName(props.fileInfo.md5, `${newName.value}.${props.fileInfo.exten}`)
          needNewName.value = false
          console.log("Rename success");
        } else {
          renameState.value = asyncState.failed
          console.log("Rename failed");
        }
      } catch (error) {
        renameState.value = asyncState.failed
        console.error(error)
      }
      
    }
    function cancelRename() {
      needNewName.value = false
    }

    return {
      thumbnailUrl,
      renameState,
      rename,
      cancelRename,
      newName,
      needNewName,
      imgLoaded,
      handleImgLoaded,
      fileUrl,
      showDetail,
      ToggleShowDetail,
      deleteItem,
      deleteState,
      asyncState,
      qrCodeUrl,
      downloadFile,
      copyLink,
      linkCopyState,
      downloadState,
      isImg,
      downloadProgress,
    }
  }
}
</script>

<style scoped>
.file-item {
  /* border: 0.05em solid #888; */
  /* flex: 1; */
  /* max-width: 30em; */
  padding: 0.5em 0.5em 0.5em 0.5em;
  margin: 0.6em 0.6em 0.6em 0.6em;
  box-shadow:0em 0.05em 0.2em #999;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.file-item-title {
  /* 文字自动换行 */
  word-break: break-all;
  display: flex;
  gap:0.4em;
}
.file-item-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}
.file-item-detail {
  /* background-color:antiquewhite; */
  padding: 0.2em 0em 0.4em 0em;
  display: flex;
  flex-wrap:wrap;
  /* justify-content: center; */
  justify-content: space-evenly;
  align-items: center;
  gap:0.5em;
}
.file-item-detail-qrcode {
  /* border: 0.05em solid #888; */
  /* max-width: 8em; */
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
}
.file-item-detail-qrcode img {
  width: 9em;
}
.file-item-detail img {
  max-width: 12em;
}
.file-item-msg {
  padding: 0rem 0.5rem 0rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.file-item-msg img{
  max-width: 1rem;
}
.light-button {
  height: 2.5rem;
  width: fit-content;
  min-width: 5rem;
  /* margin: 0.2rem 0.4rem 0.2rem 0.4rem; */
  border-radius: 0.3rem;
  background-color: rgba(238, 238, 238, 0.3);
  /* background-color: #fff; */
  border: 0.08rem solid #888;
  font-size: 0.9rem;
}
.light-button:active {
  transform: scale(0.98);
  box-shadow: 0rem 0.1rem 0.3rem rgba(0, 0, 0, 0.24);
}
.inactive {
  pointer-events: none;
  background:#dddddd;
  opacity: 0.5;
}
</style>
