<template>
  <button class="icon-btn">
    <img src="../assets/cancel.svg" alt="btn-img">
    <span></span>
  </button>
</template>

<script lang="ts">
import { LangString } from '../langStrings';
import { asyncState } from '../types'
export default {
  name: "IconButton",
  props: {
    str: {
      type: LangString,
      required: true,
    },
    state: {
      type: Number,
      required: true,
    }
  },
  // @ts-ignore
  setup(props, context) {

    return {
    }
  }
}
</script>

<style scoped>
.icon-btn {
  padding: 0rem 0.5rem 0rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.icon-btn img {
  max-width: var(--font-size);
}
</style>