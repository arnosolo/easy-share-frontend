<template>
  <div class="notfound">
    <img src="../assets/browser_404.svg" alt="404-img">
    <div><span>{{str.not_found_please}}</span></div>
    <button @click="goHome" class="light-button file-item-msg">
      <img src="../assets/return.svg" alt="return_img">
      <span>{{str.return_home}}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { reactive, ref} from 'vue'
import { LangString } from '../langStrings';
import SparkMD5 from 'spark-md5'
import { useRouter } from 'vue-router';

export default {
  name: "NotFound",
  props: {
    str: {
      type: LangString,
      required: true,
    },
  },
  // @ts-ignore
  setup(props) {
    const router = useRouter()

    function goHome() {
      router.push('/')
    }

    return {
      goHome,
    }
  }
}
</script>

<style scoped>
.notfound {
  background-color: #fff;
  flex:1;
  max-width: 44rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1em;
}


.file-item-msg {
  padding: 0rem 0.5rem 0rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.file-item-msg img{
  max-width: var(--font-size);
}
</style>