<template>
  <!-- <div class="loading-plane"></div> -->
  <router-view @update_lang="setLang" :keyword="keyword" :checkAuth="checkAuth" :addUpload="addUpload" :uploadList="uploadList" :fileList="fileList" :setFileList="setFileList" :deleteFileItem="deleteFileItem" :str="str" :lang="lang" :url_base="url_base" :authed="authed"></router-view>
  <NavBar :str="str"></NavBar>
  <!-- <div class="big-img">
    <button>Close</button>
    <img src="./assets/copy.svg" alt="">
  </div> -->
</template>

<script lang="ts">
import { onMounted, ref, reactive, computed, provide } from 'vue';
import { langStrings, LangString } from './langStrings';
import Setting from './views/Setting.vue';
import NavBar from './components/NavBar.vue'
import FilePage from './views/FilePage.vue'
import { useRouter } from 'vue-router';
import { useFileInfoList } from './hooks/useFileInfoList';
import { useUploadList } from './hooks/useUploadList';
import { configs } from './configs';

export default {
  name: 'App',
  components: { Setting, NavBar, FilePage},
  setup() {
    const router = useRouter()
    let url_base = ref(configs.url_base)
    let keyword = ref("")
    provide('keyword', keyword)

    let { fileList, setFileList, deleteFileItem, listAllFiles, listFilesState, updateFileName } = useFileInfoList(url_base.value)
    provide('fileList', fileList)
    provide('deleteFileItem', deleteFileItem)
    provide('updateFileName', updateFileName)
    provide('listAllFiles', listAllFiles)
    provide('listFilesState', listFilesState)

    let { uploadList, addUpload, removeUpload, updateUploadState, uploadById } = useUploadList(url_base.value, fileList)
    provide('uploadList', uploadList)
    provide('addUpload', addUpload)
    provide('removeUpload', removeUpload)
    provide('updateUploadState', updateUploadState)
    provide('uploadById', uploadById)

    let authed = ref(false)
    let lang = ref("en")
    let langOpts = Object.keys(langStrings)
    const browerLang = navigator.language.replaceAll('-', '')

    if(new Set(langOpts).has(browerLang)) {
      lang.value = browerLang
    }

    provide('checkAuth', checkAuth)
    async function checkAuth() {
      authed.value = false
      try {
        const url = `${url_base.value}/api/v1/check_auth`
        const res = await fetch(url, {
          method: 'post',
          mode: 'cors',
          headers: {
            'Authorization': ('Bearer ' + localStorage.getItem('token')) ?? ''
          },
        })
        if(res.status == 401) {
          router.push('/login')
          return
        } else {
          const { success } = await res.json()
          if(success) {
            authed.value = true
            router.push('/')
            console.log("Auth success");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    function setLang(val: string) {
      lang.value = val
      localStorage.setItem("lang", val)
    }

    function safariHacks() {
      // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
      let vh = window.innerHeight * 0.01
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`)

      // We listen to the resize event
      window.addEventListener('resize', () => {
        // We execute the same script as before
        let vh = window.innerHeight * 0.01
        // console.log(vh);
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      })
    }

    onMounted(() => {
      safariHacks()

      const langSetting = localStorage.getItem("lang")
      if(langSetting != null) {
        lang.value = langSetting
      }
    })

    let str = computed(() => {
      return langStrings[lang.value]
    })

    return {
      keyword,
      fileList,
      setFileList,
      deleteFileItem,
      uploadList,
      addUpload,
      removeUpload,
      lang, str, setLang, url_base, checkAuth, authed
    }
  },
}
</script>

<style>
input,
select,
span {
  font: 1.0em "Arial";
}
#app {
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  margin: 0rem;
  padding: 0rem;
  display: flex;
  justify-content: center;
}
/* small */
@media (max-width: 40rem) {
  #app {
    flex-direction: column;
  }
}
/* large */
@media (min-width: 40rem) {
  #app {
    flex-direction: row;
  }
}

:root {
  --loading-size: 2em;
  --loading-color: rgb(233, 232, 232);
}

.loading-plane {
  margin: 1em 0em 0.2em 0em;
  width: var(--loading-size);
  height: var(--loading-size);
  background-color: var(--loading-color);
  animation: loading-plane 1.2s infinite ease-in-out; 
}

@keyframes loading-plane {
  0% {
    transform: perspective(120px) rotateX(0deg) rotateY(0deg); 
  } 50% {
    transform: perspective(120px) rotateX(-180.1deg) rotateY(0deg); 
  } 100% {
    transform: perspective(120px) rotateX(-180deg) rotateY(-179.9deg); 
  } 
}

.big-img {
  background-color: rgb(100, 100, 100, 0.8);
  position: absolute;
  width: 100vw;
  height: 100vh;
  left: 50%;
  top: 50%;
  transform:translate(-50%,-50%);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
}
</style>
