import { computed, onMounted, reactive, ref, toRefs, watch } from "vue"
import { langStrings, LangString } from '../langStrings';

const useLanguage = () => {
  let lang = ref("en")
  let langOpts = Object.keys(langStrings)
  let str = computed(() => {
    return langStrings[lang.value]
  })

  onMounted(() => {
    const browerLang = navigator.language.replaceAll('-', '')
    if(new Set(langOpts).has(browerLang)) {
      lang.value = browerLang
    }
    const settingLang = localStorage.getItem("lang")
    if(settingLang != null) {
      lang.value = settingLang
    }
  })

  watch(lang, (newVal, oldVal) => {
    lang.value = newVal
    localStorage.setItem("lang", newVal)
  })

  return {
    lang,
    langOpts,
    str,
  }
}

export { useLanguage }