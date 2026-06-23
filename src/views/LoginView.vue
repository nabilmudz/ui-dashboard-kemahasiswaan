<template>
  <div class="min-h-screen w-screen flex flex-col justify-center items-center bg-[#f8f9fa] font-sans p-4 relative">
    <!-- Top-left Brand Logo -->
    <!-- <div class="sm:absolute sm:top-8 sm:left-8 flex items-center gap-2 mb-8 sm:mb-0 ">
      <img :src="logoImg" alt="logo" class="w-8 h-8 object-contain">
      <span class="font-bold text-slate-800 text-lg">SSO Gateway</span>
    </div> -->

    <!-- Login Card -->
    <form 
      @submit.prevent="handleLogin" 
      class="w-full max-w-[440px] bg-white border border-slate-200/60 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.015)]"
    >
      <!-- Header -->
      <div class="text-left mb-8">
        <p class="text-slate-500 text-sm font-medium mb-1">Silakan masukkan detail akun Anda</p>
        <h2 class="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Selamat datang kembali</h2>
      </div>

      <!-- Error Feedback -->
      <div v-if="error" class="bg-rose-50/50 text-rose-600 border border-rose-100 rounded-xl p-3 text-xs text-left mb-5 font-semibold">
        {{ errorMessage }}
      </div>

      <!-- Input Fields -->
      <div class="text-left mb-8">
        <div class="mb-5">
          <label for="username" class="form-label text-[13px] text-slate-600 font-semibold mb-1.5 block must-filled">NIM / NPA</label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none transition-all font-medium bg-white text-slate-800 placeholder:text-slate-400" 
            id="username" 
            name="username" 
            placeholder="Masukkan NIM atau NPA"
            autofocus
            required
          >
        </div>
        <div>
          <label for="password" class="form-label text-[13px] text-slate-600 font-semibold mb-1.5 block must-filled">Password</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none transition-all font-medium bg-white text-slate-800 placeholder:text-slate-400" 
            id="password" 
            name="password"
            placeholder="Masukkan password SSO"
            required
          >
        </div>
      </div>

      <!-- Login Actions -->
      <div>
        <button 
          type="submit" 
          :disabled="loading" 
          class="w-full font-semibold text-white rounded-xl py-3 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0  text-sm disabled:opacity-80 bg-brand-orange hover:bg-[#1d4ed8] active:bg-[#1e40af] shadow-sm shadow-blue-500/10"
        >
          <span>Masuk</span>
          <i 
            class="fa-solid fa-spinner fa-spin transition-all duration-300"
            :class="[loading ? 'opacity-100 w-fit' : 'opacity-0 w-0']"
          ></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import logoImg from '../assets/logo.png';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = false;
  
  try {
    // Call the integrated store login API
    await authStore.login({
      identifier: username.value,
      password: password.value
    });
    
    // Redirect to requested page or home
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (err) {
    error.value = true;
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage.value = err.response.data.message;
    } else if (err.response && err.response.data && err.response.data.error) {
      // Map common backend error codes to user-friendly messages
      const errCode = err.response.data.error;
      if (errCode === 'INVALID_CREDENTIAL') {
        errorMessage.value = 'NIM/NPA atau password salah.';
      } else {
        errorMessage.value = errCode;
      }
    } else if (err.response && err.response.status === 401) {
      errorMessage.value = 'NIM/NPA atau password salah.';
    } else {
      errorMessage.value = 'Gagal terhubung ke SSO. Cek koneksi Anda.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.must-filled::before {
  content: '* ';
  color: #ef4444;
  font-size: 14px;
}

input:focus {
  box-shadow: 0 0 0 4px rgba(241, 245, 249, 1);
  border-color: #cbd5e1;
}
</style>
