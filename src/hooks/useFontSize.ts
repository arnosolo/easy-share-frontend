import { onMounted, ref, watch } from "vue"

const useFontSize = () => {
  const fontSizes = [0.8, 0.9, 1.0, 1.1, 1.2]
  const settingSize = Number(localStorage.getItem('font_size'))
  let selectedFontSize = ref((settingSize == 0) ? 1 : settingSize)
  function setFontSize(size: number) {
    localStorage.setItem("font_size", `${size}`)
    document.documentElement.style.setProperty("--font-size", `${size}rem`);
  }

  watch(selectedFontSize, (newVal, oldVal) => {
    setFontSize(newVal)
  }, {immediate: true})

  return {
    fontSizes,
    selectedFontSize,
    setFontSize,
  }
}

export { useFontSize }