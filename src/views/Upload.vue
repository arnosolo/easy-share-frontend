<template>
  <div class="file-page">
    <Upload :str="str" :url_base="url_base" :uploadList="uploadList"></Upload>
    <div v-show="!uploadListIsEmpty">
      <UploadItem
        v-for="(item) in uploadList"
        :key="item.id"
        :uploadInfo="item"
        :str="str"
        :url_base="url_base"
      ></UploadItem>
    </div>
    <div v-show="uploadListIsEmpty">
      List is Empty
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { LangString } from '../langStrings';
import Upload from '../components/Upload.vue'
import FileList from '../components/FileList.vue'
import UploadItem from '../components/UploadItem.vue'

export default {
  name: "FilePage",
  components: {Upload, FileList, UploadItem},
  props: {
    str: {
      type: LangString,
      required: true,
    },
    url_base: {
      type: String,
      required: true,
    },
    deleteFileItem: {
      type: Function,
      required: true,
    },
    setFileList: {
      type: Function,
      required: true,
    },
    fileList: {
      type: Array,
      required: true,
    },
    uploadList: {
      type: Array,
      required: true,
    },
    addUpload: {
      type: Function,
      required: true,
    }
  },
  // @ts-ignore
  setup(props) {
    let uploadListIsEmpty = computed(() => props.uploadList.length == 0)
    return {
      uploadListIsEmpty,
    }
  },
}
</script>

<style scoped>
@media (max-width: 35rem) {
.file-page {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
}
/* large */
@media (min-width: 35rem) {
  .file-page {
    flex: 1;
    width: 0;
    max-width: 44em;

    display: flex;
  }
}
</style>
