<template>
  <router-view :langOpts="langOpts" :colorTheme="colorTheme" :toggleColorTheme="toggleColorTheme" :keyword="keyword" :addUpload="addUpload" :uploadList="uploadList" :fileList="fileList" :setFileList="setFileList" :deleteFileItem="deleteFileItem" :str="str" :lang="lang" :url_base="url_base"></router-view>
  <NavBar :str="str"></NavBar>
</template>

<script lang="ts">
import { onMounted, ref, reactive, computed, provide, watch } from 'vue';
import { langStrings, LangString } from './langStrings';
import Setting from './views/Setting.vue';
import NavBar from './components/NavBar.vue'
import FilePage from './views/FilePage.vue'
import { useRouter } from 'vue-router';
import { useFileInfoList } from './hooks/useFileInfoList';
import { useUploadList } from './hooks/useUploadList';
import { configs } from './configs';
import { useFontSize } from './hooks/useFontSize';
import { useLanguage } from './hooks/useLanguage';
import { useSelector } from './hooks/useSelector';

export default {
  name: 'App',
  components: { Setting, NavBar, FilePage},
  setup() {
    let url_base = ref(configs.url_base)
    let keyword = ref("")
    provide('keyword', keyword)

    let { lang, langOpts, str } = useLanguage()
    provide('lang', lang)
    provide('langOpts', langOpts)

    let { selectorActived, toggleSelector } = useSelector()
    provide('selectorActived', selectorActived)
    provide('toggleSelector', toggleSelector)

    let { clearSelected, deleteSelected, fileList, setFileList, deleteFileItem, listAllFiles, listFilesState, updateFileName } = useFileInfoList(url_base.value)
    provide('fileList', fileList)
    provide('clearSelected', clearSelected)
    provide('deleteSelected', deleteSelected)
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

    let { fontSizes, selectedFontSize, setFontSize } = useFontSize()
    provide('fontSizes', fontSizes)
    provide('selectedFontSize', selectedFontSize)
    provide('setFontSize', setFontSize)

    let selectedFiles = reactive([])
    provide('selectedFiles', selectedFiles)

    let colorTheme = ref("light")
    function toggleColorTheme() {
      colorTheme.value = colorTheme.value === "light" ? "dark" : "light"
      document.documentElement.setAttribute('color-theme', colorTheme.value)
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
    })

    return {
      colorTheme,
      toggleColorTheme,
      keyword,
      fileList,
      setFileList,
      deleteFileItem,
      uploadList,
      addUpload,
      removeUpload,
      lang,
      str,
      langOpts,
      url_base,
    }
  },
}
</script>

<style>
@media (max-width: 35rem) {
  #app {
    /* height: 100vh; */
    height: calc(var(--vh, 1vh) * 100);
    width: 100%;
    margin: 0em;
    padding: 0em;
  
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
/* large */
@media (min-width: 35rem) {
  #app {
    height: 100vh;
    width: 100%;
    margin: 0em;
    padding: 0em;

    display: flex;
    justify-content: center;
  }
}

:root {
  --loading-size: 2rem;
  --loading-color: rgb(233, 232, 232);

  --font-size: 1rem;

  --color-primary: #fff;
  --color-secondary: #eee;
  /* --color-secondary: #B79FF1; */
  --text-color-primary: #222;
}
[color-theme="dark"] {
  --color-primary: #555;
  --color-secondary: #777;
  --text-color-primary: #ddd;
}
input,
select,
span,
body {
  font: var(--font-size) "Arial";
}
select,
span {
  color: var(--text-color-primary);
}
input,
body {
  background-color: var(--color-primary);
  color: var(--text-color-primary);
}
input {
  border-radius: 0.3rem;
  border: 0.08rem solid #888;
}

.loading-plane {
  margin: 1em 0em 0.2em 0em;
  width: var(--loading-size);
  height: var(--loading-size);
  /* background-color: var(--loading-color); */
  background-color: var(--color-secondary);
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

.light-button {
  border: none;
  /* border: 0.08rem solid #888; */
  border-radius: 0.3em;
  background-color: var(--color-secondary);
  /* background-color: #fff; */
  height: calc(var(--font-size) * 2.2);
  width: fit-content;
  min-width: 5.2rem;
  padding: 0.4em 0.5em 0.4em 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.light-button:active {
  transform: scale(0.98);
  box-shadow: 0em 0.1em 0.3em rgba(0, 0, 0, 0.24);
}
.light-button span {
  font-size: calc(var(--font-size) * 0.9);
}
.light-button-content{
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.light-button-content img{
  max-width: var(--font-size);
}
.inactive {
  pointer-events: none;
  background:#dddddd;
  opacity: 0.5;
}

.primary-button {
  border: none;
  /* border: 0.08rem solid #888; */
  border-radius: 0.3em;
  background-color: var(--color-secondary);
  /* background-color: #fff; */
  height: calc(var(--font-size) * 2.2);
  width: fit-content;
  min-width: 5.2rem;
  padding: 0.4em 0.5em 0.4em 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.primary-button:active {
  transform: scale(0.98);
  box-shadow: 0em 0.1em 0.3em rgba(0, 0, 0, 0.24);
}
.primary-button span {
  font-size: calc(var(--font-size) * 0.9);
}
.primary-button-content{
  display: flex;
  align-items: center;
  gap: 0.3em;
}
.primary-button-content img{
  max-width: var(--font-size);
}
.primary-button {
  background-color: #1296db;
}
</style>
