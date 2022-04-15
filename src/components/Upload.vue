<template>
  <div class="upload">
    <div class="control-item">
      <div class="file-item-msg">
        <img src="../assets/upload.svg" alt="upload-img">
        <span>{{str.selectFile}}</span>
      </div>
      <input @change="uploadFile" ref="filepicker" type="file" multiple="true" class="hide">
      <button @click="selectFile" class="light-button file-item-msg">
        <img src="../assets/add.svg" alt="add-img">
        <span>{{str.chooseFile}}</span>
      </button>
      <button
        @click="handleListAllFiles"
        class="light-button"
        :class="{inactive: listFilesState == asyncState.waitRes}"
      >
        <span v-if="listFilesState == asyncState.waitRes">{{str.loading}}</span>
        <div v-else-if="listFilesState == asyncState.success" class="file-item-msg">
          <img src="../assets/success.svg" alt="add-img">
          <span>{{str.files_listed}}</span>
        </div>
        <div v-else-if="listFilesState == asyncState.failed" class="file-item-msg">
          <img src="../assets/failed.svg" alt="add-img">
          <span>{{str.list_files_failed}}</span>
        </div>
        <div class="file-item-msg" v-else>
          <img src="../assets/list.svg" alt="listFiles-img">
          <span>{{str.listFiles}}</span>
        </div>
      </button>
    </div>
    <div class="control-item">
      <div class="file-item-msg">
        <img src="../assets/search.svg" alt="search-img">
        <span>{{str.search_items}}</span>
      </div>
      <input type="text" v-model="keyword">
      <button v-if="keyword?.length != 0" @click="clearInput" class="light-button file-item-msg">
        <img src="../assets/clear.svg" alt="clear-img">
        <span>{{str.clear_input}}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, getCurrentInstance, inject, reactive, Ref } from 'vue'
import { LangString } from '../langStrings';
import { useRouter } from 'vue-router';
import SparkMD5 from 'spark-md5';
import { useUploadList } from '../hooks/useUploadList';
import { FileInfo } from '../hooks/useFileInfoList';
import { asyncState } from "../types"

export default {
  name: "Upload",
  props: {
    str: {
      type: LangString,
      required: true,
    },
    url_base: {
      type: String,
      required: true,
    },
  },
  // @ts-ignore
  setup(props, context) {
    let keyword = inject<Ref<string>>("keyword")
    
    const fileList = inject("fileList") as Array<FileInfo>
    const listAllFiles = inject("listAllFiles") as Function
    const listFilesState = inject("listFilesState")

    onMounted(() => {
      if(fileList.length == 0) {
        listAllFiles()
      }
    })
    
    function clearInput() {
      if(keyword) keyword.value = ""
    }

    function handleListAllFiles() {
      listAllFiles()
    }

    // Upload File
    const filepicker = ref()
    function selectFile() {
      filepicker.value.click()
    }

    let addUpload = inject("addUpload") as Function

    async function uploadFile() {
      const files = filepicker.value.files

      // context.emit('new_upload', files)
      console.log(files);
      
      addUpload(files)
    }

    return {
      clearInput,
      keyword,
      uploadFile,
      filepicker,
      selectFile,
      listFilesState,
      handleListAllFiles,
      asyncState,
    }
  }
}
</script>

<style scoped>
.upload {
  /* border: 0.05rem solid blueviolet; */
  display: flex;
  flex-flow: wrap;
}
/* small */
@media (max-width: 40rem) {
  .upload {
    padding: 1rem 1rem 0.5rem 1rem;
    width: inherit;
    /* box-shadow: 0em 0.05em 0.2em #999; */
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
}
/* large */
@media (min-width: 40rem) {
  .upload {
    /* flex: 0 0 10rem; */
    padding: 2rem 1rem 2rem 1.5rem;
    /* max-width: 10em; */

    flex-direction: column;
    flex-wrap:wrap;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
    overflow-y:unset;
  }
}
.control-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
}
@media (min-width: 40rem) {
.control-item {
  max-width: 10em;
  gap: 0.6rem;
}
}
.control-item input {
  height: 2rem;
  width: 8rem;
  font-size: 1rem;
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
.hide {
  display: none;
}
.file-item-msg {
  padding: 0rem 0.5rem 0rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.file-item-msg img{
  max-width: 1rem;
}
</style>
