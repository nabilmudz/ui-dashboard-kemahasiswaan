<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
      <div class="w-full max-w-md transform rounded-lg bg-white p-6 shadow-2xl transition-all scale-100">
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>

        <!-- Body -->
        <div class="mb-6">
          <p class="text-sm text-gray-500">{{ message }}</p>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2">
          <button 
            type="button" 
            class="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            @click="$emit('close')"
          >
            Batal
          </button>
          <button 
            type="button" 
            class="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            @click="$emit('confirm')"
          >
            <i class="fa-regular fa-right-from-bracket"></i> Ya Keluar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Konfirmasi'
  },
  message: {
    type: String,
    default: 'Apakah anda yakin?'
  }
});

defineEmits(['close', 'confirm']);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
