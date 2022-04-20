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

.light-button {
  height: 2.5rem;
  width: fit-content;
  padding: 0.2rem 0.2rem 0.2rem 0.2rem;
  min-width: 5rem;
  border-radius: 0.3rem;
  background-color: rgba(238, 238, 238, 0.5);
  /* background-color: #fff; */
  border: 0.08rem solid #888;
  font-size: 0.9rem;
}
.light-button:active {
  transform: scale(0.98);
  box-shadow: 0rem 0.1rem 0.3rem rgba(0, 0, 0, 0.24);
}

.inactive {
  pointer-events: none;
  background:#dddddd;
  opacity: 0.5;
}
.file-item-msg {
  padding: 0rem 0.5rem 0rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.file-item-msg img{
  max-width: 1rem;
}
</style>