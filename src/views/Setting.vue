<template>
  <div class="setting">
    <h1>{{str.setting}}</h1>
    <div class="setting-form">
      <div class="setting-form-item">
        <div class="setting-form-item-lable">
          <img src="../assets/language.svg" alt="language-img">
          <div><span>{{str.lang}}</span></div>
        </div>
        <select v-model="selectedLang" v-on:change="$emit('update_lang', selectedLang)" class="light-button">
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
          <option value=1>1.0</option>
          <option value=1.2>1.2</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, reactive, onMounted, computed, inject, toRefs } from 'vue'
import { langStrings, LangString } from '../langStrings';

export default {
  name: "Setting",
  emits: ['update_lang'],
  props: {
    str: {
      type: LangString,
      required: true
    },
    lang: {
      type: String,
    },
  },
  // @ts-ignore
  setup(props) {
    let selectedLang = ref("")
    let selectedFontSize = ref(1.0)
    const langOpts = Object.keys(langStrings)

    onMounted(() => {
      selectedLang.value = props.lang ?? ""
    })

    return {
      selectedLang, selectedFontSize, langOpts, langStrings
    }
  },
}

</script>

<style scoped>
.setting {
  /* background-color: antiquewhite; */
  flex: 1;
  max-width: 40em;
  padding: 1rem 0rem 1rem 0rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
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
  padding: 0em 0.5em 0em 1em;
  outline: none;
  -webkit-appearance: button;
}
.setting-form-item-lable {
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.setting-form-item-lable img{
  width: 1.5rem;
}
.light-button {
  height: 2.5em;
  width: fit-content;
  min-width: 5em;
  margin: 0.2em 0.3em 0.2em 0.3em;
  border-radius: 0.3em;
  background-color: rgba(238, 238, 238, 0.5);
  /* background-color: #fff; */
  border: 0.08em solid #888;
}

.light-button:active {
  transform: scale(0.98);
  box-shadow: 0em 0.1em 0.3em rgba(0, 0, 0, 0.24);
}
</style>

// @ts-check
