<template>
  <div class="file-page">
    <!-- <Upload :str="str" :url_base="url_base" :uploadList="uploadList"></Upload>
    <UploadItem
      v-for="(item) in uploadList"
      :key="item.id"
      :uploadInfo="item"
      :str="str"
      :url_base="url_base"
    ></UploadItem> -->
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { LangString } from '../langStrings';
import Upload from '../components/Upload.vue'
import FileList from '../components/FileList.vue'
import { useRouter } from 'vue-router';

export default {
  name: "FilePage",
  components: {Upload, FileList},
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
    return {
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
    /* overflow-y: auto; */
    max-width: 44rem;
    display: flex;
    flex-direction: row;
    align-items:flex-start;
    justify-content: center;
  }
}
</style>
