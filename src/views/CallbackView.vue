<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white border border-gray-150 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center">
      <!-- Loading Spinner -->
      <div v-if="loading" class="flex flex-col items-center">
        <i class="fa-solid fa-spinner-third fa-spin text-4xl text-indigo-600 mb-6"></i>
        <h3 class="text-sm font-bold text-gray-800">Menghubungkan Sesi...</h3>
        <p class="text-xs text-gray-400 font-medium mt-1">Menukar authorization code dengan token JWT...</p>
      </div>

      <!-- Error Message -->
      <div v-else-if="error" class="flex flex-col items-center">
        <div class="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl mb-4 shadow-sm">
          <i class="fa-regular fa-triangle-exclamation"></i>
        </div>
        <h3 class="text-sm font-bold text-gray-800">Gagal Menghubungkan Sesi</h3>
        <p class="text-xs text-red-500 font-medium mt-1 bg-red-50/50 p-2.5 rounded-lg border border-red-100 max-w-xs">{{ errorMessage }}</p>
        
        <button 
          type="button" 
          class="mt-6 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
          @click="retryLogin"
        >
          Kembali ke Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');

async function processCallback() {
  const code = route.query.code;
  if (!code) {
    error.value = true;
    errorMessage.value = 'Tidak ada authorization code yang diterima dari SSO server.';
    loading.value = false;
    return;
  }

  try {
    await authStore.handleSSOCallback(code);
    // Successful exchange, redirect to home
    router.push('/');
  } catch (err) {
    console.error('SSO Callback error:', err);
    error.value = true;
    errorMessage.value = err.message || 'Gagal menukar code dengan token JWT. Silakan coba lagi.';
  } finally {
    loading.value = false;
  }
}

function retryLogin() {
  router.push('/login');
}

onMounted(() => {
  processCallback();
});
</script>

<style scoped>
</style>
