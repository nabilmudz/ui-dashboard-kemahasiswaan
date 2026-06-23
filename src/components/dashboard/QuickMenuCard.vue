<template>
  <div class="flex-grow">
    <p class="font-semibold mb-1 text-[14px] text-gray-900 ">{{ title }}</p>
    <div class="flex gap-3 mb-3 py-2 bg-[#f8f9fa] rounded-lg flex-wrap w-full" style="width: fit-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
</style>
