<template>
  <div class="file-page">
    <Upload :str="str" :url_base="url_base" :uploadList="uploadList"></Upload>
    <FileList :deleteFileItem="deleteFileItem" :str="str" :fileList="fileList" :uploadList="uploadList" :url_base="url_base"></FileList>
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
    authed: {
      type: Boolean,
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
    const router = useRouter()

    onMounted(() => {
      // if(!props.authed) {
      //   router.push("/login")
      // }
    })

    return {
    }
  },
}
</script>

<style scoped>
.file-page {
  flex: 1;
  display: flex;
}
/* small */
@media (max-width: 40rem) {
  .file-page {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-y: auto;
  }
}
/* large */
@media (min-width: 40rem) {
  .file-page {
    /* border: 0.05em solid #888; */
    max-width: 44rem;
    justify-content: center;
    overflow-y:inherit;
  }
}
</style>
