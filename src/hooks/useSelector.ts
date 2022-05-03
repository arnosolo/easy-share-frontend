import { onMounted, ref, watch } from "vue"
import { asyncState } from "../types";

const useSelector = () => {
  let selectorActived = ref(false)

  function toggleSelector() {
    selectorActived.value = !selectorActived.value
  }

  return {
    toggleSelector,
    selectorActived,
  }
}

export { useSelector }