<script lang="ts">
import { ref, watch } from 'vue'
import { LangString } from '../langStrings';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: "NavBar",
  setup() {
    const router = useRouter()
    const route = useRoute()
    let actived = ref("home")

    function toHome() {
      router.push('/')
    }

    function toUpload() {
      router.push('/upload')
    }

    function toSetting() {
      router.push('/setting')
    }

    watch(() => route.path, (newVal, oldVal) => {
      switch (newVal) {
        case '/setting':
          actived.value = "setting"
          break;
        case '/upload':
          actived.value = "upload"
          break;
        case '/':
          actived.value = "home"
          break;
        default:
          break;
      }
    })

    return {
      actived, toHome, toSetting, toUpload
    }
  },
  props: {
    str: {
      type: LangString
    }
  },
}
</script>

<template>
  <div class="navbar">
    <img @click="toHome" src="../assets/list.svg" alt="home-pic" class="nav-btn navbar-home-img" :class="{'active': actived == `home`}">
    <img @click="toUpload" src="../assets/upload.svg" alt="upload-pic" class="nav-btn navbar-home-img" :class="{'active': actived == `upload`}">
    <img @click="toSetting" src="../assets/setting-active.svg" alt="setting-pic" class="nav-btn navbar-setting-img" :class="{'active': actived == `setting`}">
  </div>
</template>

<style scoped>
.navbar {
  /* background-color: var(--color-secondary); */
  height: fit-content;
  /* position: sticky; */
  /* bottom: 0; */
  display: flex;
  border-top: 0.08rem solid #eee;
  /* box-shadow:0em 0em 0.2em #999; */
  justify-content: space-evenly;
  flex-wrap: wrap;
  align-items: center;
}
/* large */
@media (min-width: 35rem) {
  .navbar {
    order: -1;
    padding: 2em 0em 5em 0em;
    flex-direction: column;
    justify-content: center;
    gap: 1em;

    /* -webkit-clip-path: polygon(100% 0, 100% 100%, 50% 80%, 0 100%, 0 0);
    clip-path: polygon(100% 0, 100% 100%, 50% 80%, 0 100%, 0 0); */
  }
}
.navbar-home-img {
  margin: 0em 1em 0em 1em;
  height: 2.2em;
  opacity: 0.6;
}
.navbar-setting-img {
  margin: 0em 1em 0em 1em;
  height: 3em;
  opacity: 0.6;
}
.nav-btn:active {
  transform: scale(0.98);
}
.active {
  opacity: 1;
}
.navbar h1 {
  /* border: 3px solid rgba(230, 165, 24, 0.813); */
  margin: 0.2em 1em 0.2em 1em;
}
</style>
