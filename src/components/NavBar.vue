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

    function toSetting() {
      router.push('/setting')
    }

    watch(() => route.path, (newVal, oldVal) => {
      // console.log("actived bar changed", oldVal, "->", newVal);
      switch (newVal) {
        case '/setting':
          actived.value = "setting"
          break;
        case '/':
          actived.value = "home"
          break;
        default:
          break;
      }
    })

    return {
      actived, toHome, toSetting
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
    <img @click="toSetting" src="../assets/setting-active.svg" alt="setting-pic" class="nav-btn navbar-setting-img" :class="{'active': actived == `setting`}">
  </div>
</template>

<style scoped>
.navbar {
  background-color:whitesmoke;
  height: fit-content;
  display: flex;
}
/* small */
@media (max-width: 40rem) {
  .navbar {
    /* box-shadow:0em 0em 0.2em #999; */
    /* position: sticky;
    bottom: 0; */
    justify-content: space-evenly;
    flex-wrap: wrap;
    align-items: center;
  }
}
/* large */
@media (min-width: 40rem) {
  .navbar {
    padding: 2em 0em 2em 0em;
    justify-content: center;
    flex-direction: column;
    gap: 1em;
    order: -1;
  }
}
.navbar-home-img {
  /* border: 1px solid rgba(230, 165, 24, 0.813); */
  margin: 0em 1em 0em 1em;
  height: 2.2em;
  opacity: 0.5;
}
.navbar-setting-img {
  margin: 0em 1em 0em 1em;
  height: 3em;
  opacity: 0.5;
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
