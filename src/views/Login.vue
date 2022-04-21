<template>
  <div class="login">
    <h1>{{str.get_start}}</h1>
    <div class="login-form">
      <div class="login-form-item">
        <div class="login-form-item-lable">
          <img src="../assets/username.svg" alt="username-img">
          <label for="username"><span>{{str.username}}</span></label>
        </div>
        <input type="text" v-model="username" id="username">
      </div>
      <div class="login-form-item">
        <div class="login-form-item-lable">
          <img src="../assets/password.svg" alt="username-img">
          <label for="password"><span>{{str.password}}</span></label>
        </div>
        <input type="password" v-model="password" id="password">
      </div>
    </div>
    <button @click="signUpOrLogin" class="light-button" :class="{ inactive: loginState == asyncState.waitRes }">
      <span v-if="loginState == asyncState.waitRes">{{str.waitting}}</span>
      <div v-else-if="loginState == asyncState.failed" class="file-item-msg">
        <img src="../assets/failed.svg" alt="failed-img">
        <span >{{str.login_failed}}</span>
      </div>
      <span v-else>{{str.login_or_signup}}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { inject, onMounted, reactive, ref} from 'vue'
import { LangString } from '../langStrings';
import SparkMD5 from 'spark-md5'
import { useRouter } from 'vue-router';
import { asyncState } from '../types';

export default {
  name: "Login",
  props: {
    str: {
      type: LangString,
      required: true,
    },
    url_base: {
      type: String,
      required: true,
    }
  },
  // @ts-ignore
  setup(props) {
    let username = ref("")
    let password = ref("")
    let loginState = ref(asyncState.beforeStart)
    const router = useRouter()

    const checkAuth = inject("checkAuth") as Function

    async function signUpOrLogin() {
      loginState.value = asyncState.waitRes
      await checkAuth()
      try {
        const url = `${props.url_base}/api/v1/user/login`
        const form = new FormData()
        form.append('username', SparkMD5.hash(username.value));
        form.append('password', SparkMD5.hash(password.value));
        const res = await fetch(url, {
          method: 'post',
          mode: 'cors',
          body: form
        })
        const { success, data } = await res.json()
        if(success) {
          localStorage.setItem("token", data.token)
          router.push('/')
          loginState.value = asyncState.success
        } else {
          loginState.value = asyncState.failed
        }
      } catch (error) {
        console.error(error);
        loginState.value = asyncState.failed
      }
    }

    return {
      username,
      password,
      signUpOrLogin,
      loginState,
      asyncState
    }
  }
}
</script>

<style scoped>
.login {
  /* background-color:rgba(238, 238, 238, 0.4); */
  flex:1;
  max-width: 44rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.login h1 {
  padding: 2rem 1rem 1rem 1rem;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.login-form-item {
  /* border: 1px solid rgba(230, 165, 24, 0.813); */
  display: flex;
  justify-content:space-between;
  align-items: center;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}
.login-form-item-lable {
  display: flex;
  align-items: center;
  gap: 0.2em;
}
.login-form-item-lable img{
  width: 1.5em;
}
.login-form-item input {
  height: 2rem;
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
  gap: 0.3rem;
}
.file-item-msg img{
  max-width: var(--font-size);
}
</style>