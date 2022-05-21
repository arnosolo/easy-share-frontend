<template>
  <div class="setting">
    <h1 class="setting-title">{{str.setting}}</h1>
    <div class="setting-form">
      <div class="setting-form-item">
        <div class="setting-form-item-lable">
          <img src="../assets/language.svg" alt="language-img">
          <div><span>{{str.lang}}</span></div>
        </div>
        <!-- <select v-model="selectedLang" v-on:change="$emit('update_lang', selectedLang)" class="light-button"> -->
        <select v-model="lang" class="light-button">
          <option
            v-for="opt in langOpts"
            :value="opt"
            :key="opt"
          >{{langStrings[opt].option}}</option>
        </select>
      </div>
      <div class="setting-form-item">
        <div class="setting-form-item-lable">
          <img src="../assets/font.svg" alt="font_size-img">
          <div><span>{{str.font_size}}</span></div>
        </div>
        <select v-model="selectedFontSize" class="light-button">
          <option
            v-for="val in fontSizes"
            :value=val
            :key="val"
          >{{val}}</option>
        </select>
      </div>
      <div class="setting-form-item">
        <div class="setting-form-item-lable">
          <img src="../assets/server.svg" alt="font_size-img">
          <div><span>{{str.server}}</span></div>
        </div>
        <input v-model="curUrlBase" @change="handleServerChange" type="text" class="setting-input">
      </div>
      <!-- <div class="setting-form-item">
        <div class="setting-form-item-lable">
          <img v-if="colorTheme == `dark`" src="../assets/moon.svg" alt="colorTheme-img">
          <img v-else src="../assets/sun.svg" alt="colorTheme-img">
          <div><span>{{str.color_mode}}</span></div>
        </div>
        <button @click="toggleColorTheme" class="light-button">
          <span v-if="colorTheme == `dark`">{{str.dark_mode}}</span>
          <span v-else>{{str.light_mode}}</span>
        </button>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, onMounted, computed, inject, toRefs, watch } from 'vue'
import { langStrings, LangString } from '../langStrings';

export default {
  name: "Setting",
  emits: ['update_lang'],
  props: {
    // lang: {
    //   type: String,
    //   required: true
    // },
    // langOpts: {
    //   type: Array,
    //   required: true,
    // },
    url_base: {
      type: String,
      required: true,
    },
    str: {
      type: LangString,
      required: true,
    },
    toggleColorTheme: {
      type: Function,
      required: true,
    },
    colorTheme: {
      type: String,
      required: true,
    },
    // fontSizes: {
    //   type: Array,
    //   required: true,
    // },
  },
  // @ts-ignore
  setup(props) {
    const fontSizes = inject("fontSizes") as Array<string>
    const selectedFontSize = inject("selectedFontSize")
    const lang = inject("lang")
    const langOpts = inject("langOpts") as Array<string>

    const setUrlBase = inject("setUrlBase") as Function
    let curUrlBase = ref("")
    onMounted(() => {
      curUrlBase.value = props.url_base
    })
    function handleServerChange() {
      setUrlBase(curUrlBase.value)
    }
    return {
      curUrlBase,
      handleServerChange,
      lang,
      langOpts,
      langStrings,
      fontSizes,
      selectedFontSize,
    }
  },
}

</script>

<style scoped>
.setting {
  /* background-color: antiquewhite; */
  flex: 1;
  max-width: 44rem;
  padding: 1rem 0rem 1rem 0rem;
  /* animation-name: fade-in; */
  /* animation-duration: 0.5s; */

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
@keyframes fade-in {
  from {opacity: 0;}
  to {opacity: 1;}
}
.setting-title {
  padding: 0;
  font-size: 1.5em;
  color: #469AEE;
}
.setting-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.setting-form-item {
  /* border: 1px solid rgba(230, 165, 24, 0.813); */
  display: flex;
  justify-content:space-between;
  align-items: center;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
}
.setting-form-item select {
  /* padding: 0em 0.5em 0em 1em; */
  outline: none;
  -webkit-appearance: button;
}
.setting-form-item-lable {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.setting-form-item-lable img{
  width: 1.3em;
}
.setting-input {
  background-color: var(--color-secondary);
  outline: none;
  border: none;
  height: calc(var(--font-size) * 2.2);
  width: 7em;
  padding: 0 0.4em;
}
</style>