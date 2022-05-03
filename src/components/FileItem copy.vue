<template>
  <div class="file-item">
    <div class="title">
      <img :src="fileTypeIconSrc" alt="file-type-icon" class="file-type-icon">
      <span @click="needNewName = true" v-show="!needNewName">{{fileInfo.filename}}</span>
      <input v-if="needNewName" type="text" v-model="newName">
      <div v-if="needNewName" class="name-input-editor">
        <button @click="rename" class="light-button" :class="{inactive: renameState == asyncState.waitRes}">
          <span v-if="renameState == asyncState.waitRes">{{str.renaming}}</span>
          <div v-else-if="renameState == asyncState.failed" class="light-button-content">
            <img src="../assets/failed.svg" alt="failed-img">
            <span>{{`${str.rename}${str.failed}`}}</span>
          </div>
          <div v-else-if="renameState == asyncState.success" class="light-button-content">
            <img src="../assets/success.svg" alt="success-img">
            <span>{{`${str.rename}${str.success}`}}</span>
          </div>
          <div v-else class="light-button-content">
            <img src="../assets/check.svg" alt="cancel-img">
            <span>{{str.rename}}</span>
          </div>
        </button>
        <button @click="cancelRename" class="light-button light-button-content">
          <img src="../assets/cancel.svg" alt="cancel-img">
          <span>{{str.cancel}}</span>
        </button>
        <button @click="cleanNameInput" class="light-button light-button-content">
          <img src="../assets/clear.svg" alt="clear-img">
          <span>{{str.clear_input}}</span>
        </button>
      </div>
    </div>
    <div class="control">
      <button @click="deleteItem" class="light-button" :class="{inactive: deleteState == asyncState.waitRes}">
        <span v-if="deleteState == asyncState.waitRes">{{str.deleting}}</span>
        <div v-else-if="deleteState == asyncState.failed" class="light-button-content">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{str.deleteAgain}}</span>
        </div>
        <div class="light-button-content" v-else>
          <img src="../assets/delete.svg" alt="delete-img">
          <span>{{str.delete}}</span>
        </div>
      </button>
      <button @click="copyLink" class="light-button">
        <div class="light-button-content" v-if="linkCopyState == asyncState.success">
          <img src="../assets/success.svg" alt="success-img">
          <span>{{str.copied}}</span>
        </div>
        <div class="light-button-content" v-else-if="linkCopyState == asyncState.failed">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{str.copyFailed}}</span>
        </div>
        <div class="light-button-content" v-else>
          <img src="../assets/copy.svg" alt="copy-img">
          <span>{{str.copyLink}}</span>
        </div>
      </button>
      <button @click="ToggleShowDetail" class="light-button">
        <div v-if="!showDetail" class="light-button-content">
          <span>{{str.more}}</span>
          <img src="../assets/fold_arrow_down.svg" alt="fold_arrow_down-img">
        </div>
        <div v-else class="light-button-content">
          <span>{{str.less}}</span>
          <img src="../assets/fold_arrow_up.svg" alt="fold_arrow_up-img">
        </div>
      </button>
    </div>
    <div class="detail" v-if="showDetail">
      <div class="qrcode">
        <img :src="qrCodeUrl" alt="preview_img">
        <span>{{str.scan_to_download}}</span>
      </div>
      <div v-if="fileType == 'image'">
        <img v-show="imgLoaded" class="file-item-detail-img" :src="thumbnailUrl" @click="toggleShowBigImg" @load="handleImgLoaded" alt="preview_img">
        <div v-if="!imgLoaded" class="loading-plane"></div>
      </div>
      <button @click="downloadFile" class="light-button" :class="{inactive: downloadState == asyncState.waitRes}">
        <span v-if="downloadState == asyncState.waitRes">{{str.downloading}} {{downloadProgress.toFixed(0)}}%</span>
        <div v-else-if="downloadState == asyncState.failed" class="light-button-content">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{str.download_failed}}</span>
        </div>
        <div v-else-if="downloadState == asyncState.success" class="light-button-content">
          <img src="../assets/success.svg" alt="failed-img">
          <span>{{str.download_success}}</span>
        </div>
        <div v-else class="light-button-content">
          <img src="../assets/download.svg" alt="download-img">
          <span>{{`${str.download} ${(fileInfo.size < 1048576 ? (fileInfo.size / 1024).toFixed(0).concat(" KB") : (fileInfo.size / 1048576).toFixed(0).concat(" MB"))}`}}</span>
        </div>
      </button>
    </div>

    <div v-if="showBigImg" class="big-img">
      <img v-if="!showOriginImg" :src="thumbnailUrl" @click="toggleShowBigImg" alt="thumbnail" class="big-img-preview">
      <img v-else :src="fileUrl" @click="toggleShowBigImg" @load="handleOriginImgLoaded" alt="origin-img" class="big-img-preview">
      <button v-if="thumbnailUrl!=fileUrl" @click="switchToOriginImg" class="light-button" :class="{inactive: !originImgLoaded && showOriginImg}">
        <div v-if="originImgLoaded" class="light-button-content">
          <img src="../assets/success.svg" alt="success-img">
          <span>{{str.download_success}}</span>
        </div>
        <div v-else-if="!originImgLoaded && showOriginImg">
          <span>{{str.loading}}</span>
        </div>
        <div v-else class="light-button-content">
          <img src="../assets/download.svg" alt="download-img">
          <span>{{str.show_origin}}</span>
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
import { useFileType } from '../hooks/useFileType';

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
    let thumbnailUrl = ref("")
    if(props.fileInfo.hasThumbnail) {
      if(props.fileInfo.createdByUpload) {
        thumbnailUrl.value = props.fileInfo.thumbnail
      } else {
        thumbnailUrl.value = `${props.url_base}/api/v1/file/${props.fileInfo.thumbnail}`
      }
    } else {
      thumbnailUrl.value = fileUrl
    }
    
    const { fileType, fileTypeIconSrc } = useFileType(props.fileInfo.filename)
    // const extendToType = {
    //   "svg": "image",
    //   "jpg": "image",
    //   "jpeg": "image",
    //   "gif": "image",
    //   "png": "image",
    //   "bmp": "image",
    //   "mov": "video",
    //   "avi": "video",
    //   "webm": "video",
    //   "mp4": "video",
    //   "mp3": "audio",
    //   "m4a": "audio",
    //   "wav": "audio",
    //   "md": "text",
    //   "txt": "text",
    //   "doc": "text",
    //   "epub": "text",
    // }
    // const extend = props.fileInfo.filename.split('.').pop()
    // let fileType = "unknown"
    // if(extend) {
    //   if(extendToType[extend.toLowerCase()]) {
    //     fileType = extendToType[extend.toLowerCase()]
    //   }
    // }
    // const fileTypeIconSrc = new URL(`../assets/file-type-${fileType}.svg`, import.meta.url).href
    
    let imgLoaded = ref(false)
    let downloadProgress = ref(0)

    async function ToggleShowDetail() {
      showDetail.value = !showDetail.value

      // Create qrcode
      if(!qrCreated.value) {
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
            setTimeout(() => {
              downloadState.value = asyncState.beforeStart
            }, 5000)
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
    const oldName = props.fileInfo.filename.split(".")[0]
    let newName = ref(oldName)
    let needNewName = ref(false)
    let renameState = ref(asyncState.beforeStart)
    async function rename() {
      if(newName.value != oldName) {
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
            updateFileName(props.fileInfo.md5, `${newName.value}.${props.fileInfo.exten}`)
            console.log("Rename success");
            needNewName.value = false
            renameState.value = asyncState.success
            setTimeout(() => {
              renameState.value = asyncState.beforeStart
            }, 3000);
          } else {
            renameState.value = asyncState.failed
            console.log("Rename failed");
          }
        } catch (error) {
          renameState.value = asyncState.failed
          console.error(error)
        }
      } else {
        renameState.value = asyncState.success
        needNewName.value = false
      }
    }

    function cancelRename() {
      needNewName.value = false
    }

    function cleanNameInput() {
      newName.value = ""
    }

    let showBigImg = ref(false)
    let showOriginImg = ref(false)
    let originImgLoaded = ref(false)
    function toggleShowBigImg() {
      showBigImg.value = !showBigImg.value
    }
    function switchToOriginImg() {
      showOriginImg.value = true
    }
    function handleOriginImgLoaded() {
      originImgLoaded.value = true
    }

    return {
      fileType,
      fileTypeIconSrc,
      handleOriginImgLoaded,
      originImgLoaded,
      showOriginImg,
      switchToOriginImg,
      toggleShowBigImg,
      showBigImg,
      cleanNameInput,
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
      downloadProgress,
    }
  }
}
</script>

<style scoped>
.file-item {
  border-radius: 0.4em;
  /* border: 0.08rem solid #888; */
  box-shadow: 0.05em 0.05em 0.2em #999;
  padding: 0.5em 0.5em 0.7em 0.5em;
  margin: 0.3em 0.6em 0.4em 0.6em;

  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.file-item .title {
  /* 文字自动换行 */
  word-break: break-all;
  display: flex;
  /* flex-wrap: wrap; */
  align-items: center;
  gap:0.4em;
}
.file-item .title .file-type-icon{
  max-width: calc(var(--font-size));
}
.file-item .title input {
  padding: 0 0.5em 0 0.5em;
  height: calc(var(--font-size) * 2);
}
.file-item .control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.file-item .detail {
  /* background-color:antiquewhite; */
  padding: 0.2em 0em 0.4em 0em;
  display: flex;
  flex-wrap:wrap;
  /* justify-content: center; */
  justify-content: space-evenly;
  align-items: center;
  gap:0.5em;
}
.file-item .detail .qrcode {
  /* border: 0.05em solid #888; */
  /* max-width: 8em; */
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
}
.file-item .detail .qrcode img {
  width: 9em;
}
.file-item-detail-img {
  max-width: 12rem;
  max-height: 22rem;
}
.file-item-msg {
  padding: 0rem 0.5rem 0rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.file-item-msg img{
  max-width: var(--font-size);
}
.name-input-editor {
  display: flex;
  gap: 0.4rem;
}
.big-img {
  background-color: rgb(100, 100, 100, 1);
  position: absolute;
  width: 100vw;
  height: 100vh;
  left: 50%;
  top: 50%;
  transform:translate(-50%,-50%);
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
.big-img-preview {
  max-width: 21rem;
}
.big-img button {
  background: #ddd;
}

</style>
