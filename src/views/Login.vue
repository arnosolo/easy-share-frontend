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
      <div v-else class="file-item-msg">
        <img src="../assets/login-blue.svg" alt="login-img">
        <span>{{str.login}}</span>
      </div>
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
    
    let authed = ref(false)
    async function checkAuth() {
      console.log("checkAuth...");
      
      authed.value = false
      try {
        const url = `${props.url_base}/api/v1/check_auth`
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
    // provide('checkAuth', checkAuth)
    // const checkAuth = inject("checkAuth") as Function

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
  gap: 0.8em;
}
.login-form-item {
  /* border: 1px solid rgba(230, 165, 24, 0.813); */
  display: flex;
  flex-direction: column;
  /* justify-content:space-between; */
  align-items:first-start;
  /* flex-wrap: wrap; */
  gap: 0.2em;
}
.login-form-item-lable {
  display: flex;
  align-items: center;
  gap: 0.2em;
}
.login-form-item-lable img{
  width: var(--font-size);
}
.login-form-item input {
  height: 2em;
  width: 8em;
  padding: 0 0.4em;
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