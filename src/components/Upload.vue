<template>
  <div class="upload">
    <div class="control-item" v-show="!searching">
      <div class="img-text">
        <img src="../assets/upload.svg" alt="upload-img">
        <span>{{str.selectFile}}</span>
      </div>
      <input @change="uploadFile" ref="filepicker" type="file" multiple="true" class="hide">
      <button @click="selectFile" class="light-button light-button-content">
        <img src="../assets/add.svg" alt="add-img">
        <span>{{str.chooseFile}}</span>
      </button>
      <button
        @click="handleListAllFiles"
        class="light-button"
        :class="{inactive: listFilesState == asyncState.waitRes}"
      >
        <span v-if="listFilesState == asyncState.waitRes">{{str.loading}}</span>
        <div v-else-if="listFilesState == asyncState.success" class="light-button-content">
          <img src="../assets/success.svg" alt="add-img">
          <span>{{str.files_listed}}</span>
        </div>
        <div v-else-if="listFilesState == asyncState.failed" class="light-button-content">
          <img src="../assets/failed.svg" alt="add-img">
          <span>{{str.list_files_failed}}</span>
        </div>
        <div class="light-button-content" v-else>
          <img src="../assets/list.svg" alt="listFiles-img">
          <span>{{str.listFiles}}</span>
        </div>
      </button>
    </div>
    <div class="control-item">
      <div class="img-text">
        <img src="../assets/search.svg" alt="search-img">
        <span>{{str.search_items}}</span>
      </div>
      <input type="text" v-model="keyword" :placeholder="str.search_items">
      <button v-if="searching" @click="clearInput" class="light-button light-button-content">
        <img src="../assets/clear.svg" alt="clear-img">
        <span>{{str.clear_input}}</span>
      </button>
    </div>
    <div class="control-item">
      <div class="img-text">
        <img src="../assets/edit.svg" alt="edit-img">
        <span>{{str.edit}}</span>
      </div>
      <button @click="handleToggleSelector" class="light-button light-button-content">
        <img src="../assets/list2.svg" alt="multiple-select-img">
        <span v-if="selectorActived">{{str.hide}}</span>
        <span v-else>{{str.select}}</span>
      </button>
      <button @click="handleDeleteSelected" v-show="hasSelected" class="light-button light-button-content">
        <img src="../assets/delete.svg" alt="delete">
        <span>{{selectedFileNum}} {{str.items}}</span>
      </button>
      <button @click="handleClearSelected" v-show="hasSelected" class="light-button light-button-content">
        <img src="../assets/clear.svg" alt="clear">
        <span>{{selectedFileNum}} {{str.items}}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, getCurrentInstance, inject, reactive, Ref, computed } from 'vue'
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


    let searching = computed(() => {
      return keyword?.value.length != 0
    })

    let selectedFileNum = computed(() => {
      return fileList.filter(it => it.selected).length
    })

    let hasSelected = computed(() => {
      return selectedFileNum.value != 0
    })

    let selectorActived = inject("selectorActived")
    let toggleSelector = inject("toggleSelector") as Function
    function handleToggleSelector() {
      toggleSelector()
    }
    let deleteSelected = inject("deleteSelected") as Function
    function handleDeleteSelected() {
      if (confirm(`${props.str.comfirm_delete} ${selectedFileNum.value} ${props.str.items}?`)) {
        deleteSelected()
      }
    }
    let clearSelected = inject("clearSelected") as Function
    function handleClearSelected() {
      clearSelected()
    }

    return {
      selectorActived,
      handleClearSelected,
      handleDeleteSelected,
      hasSelected,
      selectedFileNum,
      handleToggleSelector,
      searching,
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
@media (max-width: 35rem) {
  .upload {
    /* border: 0.05rem solid blueviolet; */
    display: flex;
    flex-flow: wrap;
    padding: 1em 1em 0.5em 1em;
    width: inherit;
    /* box-shadow: 0em 0.05em 0.2em #999; */
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1em;
  }
  .control-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
  .img-text span {
    display: none;
  }
  .edit-section {
    display: none;
  }
}
/* large */
@media (min-width: 35rem) {
  .upload {
    padding: 2em 0.8em 2em 0.8em;

    display: flex;
    flex-direction: column;
    flex-wrap:wrap;
    gap: 1em;
  }
  .control-item {
    max-width: 10em;
    display: flex;
    gap: 0.6em;
    flex-direction: column;
    align-items: flex-start;
  }
}
.control-item input {
  background-color: #fff;
  height: 2em;
  width: 4.5em;
  padding: 0em 0.3em 0em 0.4em;
  outline: none;
  /* font-size: 1rem; */
}
.img-text {
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.img-text img {
  max-width: 1em;
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
  max-width: var(--font-size);
}

</style>
