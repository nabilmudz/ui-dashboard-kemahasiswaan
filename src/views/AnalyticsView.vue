<template>
  <section class="p-8 lg:p-12 relative select-none min-h-full">
    <!-- Header Banner -->
    <div class="absolute w-full h-[200px] top-0 left-0 right-0 z-0 bg-brand-orange"></div>

    <!-- Page Title -->
    <div class="relative z-10 text-white mb-8">
      <h1 class="font-bold m-0 text-white text-[42px] tracking-tight leading-none">Dashboard</h1>
      <p class="font-semibold text-black mt-1 text-base">
        {{ subviewDescription }}
      </p>
    </div>

    <!-- Nested view rendering -->
    <div class="relative z-10">
      <router-view v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const isMahasiswa = computed(() => authStore.user?.role === 'MAHASISWA');

const subviewDescription = computed(() => {
  if (isMahasiswa.value) {
    return 'Statistik pengajuan kegiatan dan status dokumen pribadi';
  }
  return `Dasbor terpadu, ${authStore.user?.role || ''}`;
});
</script>

<style scoped>
h1 {
  font-family: Poppins, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: -1.2px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
