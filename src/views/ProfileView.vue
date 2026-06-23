<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 leading-tight">SSO Profil Sesi</h2>
      <p class="text-xs text-gray-400 font-medium mt-0.5">Detail informasi login terpadu Anda</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile Summary Card -->
      <div class="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6 text-center flex flex-col items-center">
        <img 
          class="rounded-full object-cover mb-4 border-2 border-indigo-100 shadow-sm" 
          height="90" 
          width="90" 
          :src="avatarUrl" 
          alt="Avatar"
        />
        <h3 class="text-base font-bold text-gray-900 leading-snug">{{ authStore.user?.nama }}</h3>
        <p class="text-xs text-gray-400 font-medium mt-0.5">@{{ authStore.user?.username }}</p>
        
        <span class="inline-block mt-3 px-3 py-1 bg-brand-accent text-brand-orange text-[10px] font-bold rounded-full uppercase tracking-wider">
          {{ authStore.user?.role }}
        </span>

        <hr class="w-full my-5 border-gray-100" />

        <div class="w-full flex flex-col gap-2 text-left text-xs">
          <div class="flex justify-between" v-if="authStore.user?.nim">
            <span class="text-gray-400 font-medium">NIM</span>
            <span class="text-gray-800 font-semibold font-mono">{{ authStore.user?.nim }}</span>
          </div>
          <div class="flex justify-between" v-if="authStore.user?.npa">
            <span class="text-gray-400 font-medium">NPA</span>
            <span class="text-gray-800 font-semibold font-mono">{{ authStore.user?.npa }}</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const avatarUrl = computed(() => {
  const foto = authStore.user?.foto || 'default.png';
  if (foto === 'default.png' || foto.includes('default')) {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authStore.user?.nama || 'User') + '&background=dbeafe&color=2563eb&bold=true';
  }
  return foto;
});
</script>

<style scoped>
</style>
