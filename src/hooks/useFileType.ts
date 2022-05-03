import { onMounted, ref, watch } from "vue"
import { asyncState } from "../types";

const useFileType = (filename:string) => {
  const extendToType = {
    "svg": "image",
    "jpg": "image",
    "jpeg": "image",
    "gif": "image",
    "png": "image",
    "bmp": "image",
    "mov": "video",
    "avi": "video",
    "webm": "video",
    "mp4": "video",
    "mp3": "audio",
    "m4a": "audio",
    "wav": "audio",
    "md": "text",
    "txt": "text",
    "doc": "text",
    "epub": "text",
  }
  const extend = filename.split('.').pop()
  let fileType = "unknown"
  if(extend) {
    if(extendToType[extend.toLowerCase()]) {
      fileType = extendToType[extend.toLowerCase()]
    }
  }
    const fileTypeIconSrc = new URL(`../assets/file-type-${fileType}.svg`, import.meta.url).href
  return {
    fileType,
    fileTypeIconSrc,
  }
}

export { useFileType }