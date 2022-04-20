<template>
  <div class="file-list">
    <UploadItem
      v-for="(item) in uploadList"
      :key="item.id"
      :uploadInfo="item"
      :str="str"
      :url_base="url_base"
    ></UploadItem>

    <div v-if="listFilesState == asyncState.waitRes" class="loading-block">
      <div class="loading-plane"></div>
    </div>
    <div v-if="listFilesState == asyncState.success && fileListIsEmpty" class="loading-block">
      <span>{{str.loaded_but_empty}}</span>
    </div>

    <FileItem
      v-for="item in filtedFileList"
      :key="item.md5"
      :fileInfo="item"
      :str="str"
      :url_base="url_base"
    ></FileItem>
  </div>
</template>

<script lang="ts">
import { computed, inject, Ref, ref } from 'vue'
import { LangString } from '../langStrings';
import FileItem from './FileItem.vue'
import UploadItem from './UploadItem.vue'
import { FileInfo } from '../hooks/useFileInfoList';
import { UploadInfo } from '../hooks/useUploadList';
import { asyncState } from '../types';

export default {
  name: "FileList",
  components: { FileItem, UploadItem },
  props: {
    str: {
      required: true,
      type: LangString,
    },
    deleteFileItem: {
      required: true,
      type: Function
    },
    url_base: {
      required: true,
      type: String
    }
  },
  setup() {
    let fileList = inject<Array<FileInfo>>("fileList")
    let uploadList = inject<Array<UploadInfo>>("uploadList")
    const removeUpload = inject("removeUpload") as Function
    const updateUploadState = inject("updateUploadState") as Function
    new Array<FileInfo>()
    let keyword = inject<Ref<string>>("keyword") ?? ref("")
    let keywordsRegStr = computed(() => {
      if(keyword.value.length == 0){
        return ""
      } else {
        let regStr = `(${keyword.value.replaceAll(' ', '|')})`
        return regStr
      }
    })

    let filtedFileList = computed(() => {
      if(fileList != undefined) {
        let arr = fileList.filter(it => {
          return (it.filename.match(new RegExp(keywordsRegStr.value, "i")) == null) ? false : true
        })
        arr.sort((a, b) => b.createTime - a.createTime)
        return arr
      } else {
        return []
      }
    })

    let fileListIsEmpty = computed(() => {
      return fileList?.length == 0
    })

    const listFilesState = inject("listFilesState")
    return {
      keywordsRegStr,
      fileListIsEmpty,
      filtedFileList,
      uploadList,
      removeUpload,
      updateUploadState,
      keyword,
      listFilesState,
      asyncState,
    }
  },
}
</script>

<style scoped>
.file-list {
  /* border: 0.05em solid #888; */
  flex: 1;
  width: 100%;
  max-width: 40rem;
  padding: 0.5rem 0rem 2rem 0rem;

  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.loading-block {
  width: inherit;
  display: flex;
  justify-content: center;
}
</style>
