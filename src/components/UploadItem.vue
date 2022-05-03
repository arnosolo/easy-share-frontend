<template>
  <div class="file-item">
    <div class="title">
      <img :src="fileTypeIconSrc" alt="file-type-icon" class="file-type-icon">
      <span>{{uploadInfo.file.name}}</span>
    </div>
    <div class="file-item-control">
      <div><span>{{(uploadInfo.file.size < 1048576 ? (uploadInfo.file.size / 1024).toFixed(1).concat("KB") : (uploadInfo.file.size / 1048576).toFixed(2).concat("MB"))}}</span></div>
      <button @click="cancelUpload" class="light-button light-button-content">
        <img src="../assets/cancel.svg" alt="cancel-img">
        <span>{{str.cancel}}</span>
      </button>
      <button @click="deleteItem" class="light-button light-button-content">
        <img src="../assets/delete.svg" alt="delete-img">
        <span>{{str.delete}}</span>
      </button>
    </div>
    <div class="file-item-control">
      <div>
        <div v-if="uploadInfo.uploadState == asyncState.success" class="light-button-content">
          <img src="../assets/success.svg" alt="success-img">
          <span>{{str.uploadSuccess}}</span>
        </div>
        <div v-else-if="uploadInfo.uploadState == asyncState.failed" class="light-button-content">
          <img src="../assets/failed.svg" alt="failed-img">
          <span>{{str.uploadFailed}}</span>
          <button @click="uploadItem" class="light-button light-button-content">
            <img src="../assets/upload.svg" alt="failed-img">
            <span>{{str.uploadAgain}}</span>
          </button>
        </div>
        <div v-else-if="uploadInfo.uploadState == asyncState.waitRes" class="status-msg">
          <div class="loading-plane"></div>
          <span v-if="uploadInfo.hashState == asyncState.failed">{{str.slice_failed}}</span>
          <span v-else-if="uploadInfo.hashState == asyncState.waitRes" >{{str.slice_progress}}: {{uploadInfo.hashProgress.toFixed(0)}}%</span>
          <span v-else-if="uploadInfo.mergeState == asyncState.waitRes" >{{str.merging_slices}}</span>
          <span v-else-if="uploadInfo.hashState == asyncState.success" >{{str.upload_progress}}: {{uploadInfo.uploadProgress.toFixed(0)}}%</span>
          <span v-else>{{str.uploading}}</span>
        </div>
        <span v-else>{{str.prepare_phase}}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { inject, onMounted, reactive, ref} from 'vue'
import { LangString } from '../langStrings';
import { asyncState } from '../types'
import SparkMD5 from 'spark-md5'
import { UploadInfo } from '../hooks/useUploadList';
import { useFileType } from '../hooks/useFileType';

export default {
  name: "UploadItem",
  props: {
    str: {
      type: LangString,
      required: true,
    },
    uploadInfo: {
      type: UploadInfo,
      required: true,
    },
    url_base: {
      type: String
    },
  },
  // @ts-ignore
  setup(props, context) {
    
    const updateUploadState = inject("updateUploadState") as Function
    const removeUpload = inject("removeUpload") as Function
    const uploadById = inject("uploadById") as Function

    function cancelUpload() {
      if(props.uploadInfo != undefined) {
        updateUploadState(props.uploadInfo.id, asyncState.failed)
        console.log("Cancel complete", props.uploadInfo.file.name);
      }
    }

    function deleteItem() {
      if(confirm(`${props.str.cancel_upload}`)) {
        cancelUpload()
        removeUpload(props.uploadInfo.id)
      }
    }

    function uploadItem() {
      uploadById(props.uploadInfo.id)
    }

    const { fileType, fileTypeIconSrc } = useFileType(props.uploadInfo.file.name)

    return {
      fileType,
      fileTypeIconSrc,
      cancelUpload,
      asyncState,
      deleteItem,
      uploadItem,
    }
  }
}
</script>

<style scoped>
.file-item {
  /* border: 0.05em solid #888; */
  /* flex: 1; */
  /* max-width: 30em; */
  padding: 0.5em 1em 0.8em 1em;
  margin: 0.6em 0.6em 0.6em 0.6em;
  box-shadow:0em 0.05em 0.2em #999;
  border-radius: 0.4em;
  /* 文字超出部分采用... */
  word-wrap: break-word;

  display: flex;
  flex-direction: column;
  gap: 0.6rem;
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
.file-item-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}
.file-item-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.file-item-msg img{
  max-width: var(--font-size);
}
.file-item-detail {
  /* background-color:antiquewhite; */
  padding: 0.2em 0.5em 0.4em 0.5em;
  display: flex;
  flex-wrap:wrap;
  /* justify-content: center; */
  justify-content: space-evenly;
  gap:0.5em;
}
.file-item-detail-qrcode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
}
.file-item-detail-qrcode canvas {
  border: 0.05em solid #888;
  max-width: 10em;
}
.file-item-detail img {
  max-width: 12em;
}
.status-msg {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
</style>
