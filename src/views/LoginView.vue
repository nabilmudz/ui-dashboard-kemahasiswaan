<template>
  <div class="w-screen h-screen flex justify-center items-center bg-[#ffd72f] font-sans p-4">
    <!-- Login Container -->
    <div class="flex border border-gray-150 rounded-[30px] p-3 bg-white shadow-lg box-area overflow-hidden w-[600px] h-[480px]">
      
      <!-- Left Box -->
      <div 
        class="hidden sm:flex col-md-5 rounded-[20px] flex-col justify-center items-center left-box w-[220px] h-full"
        :style="{ backgroundImage: 'url(' + loginImg + ')' }"
      ></div>
      
      <!-- Right Box -->
      <form 
        @submit.prevent="handleLogin" 
        class="flex-1 right-box flex items-center h-full pl-6"
      >
        <div class="w-full flex flex-col justify-between py-4 pr-3">
          <!-- Logo & Header -->
          <div class="flex items-center gap-3 mb-6">
            <img :src="logoImg" alt="logo" width="50" height="50">
            <div class="header-text text-left">
              <h2 class="font-semibold m-0 text-gray-900 leading-tight" style="font-size: 20px">Login</h2>
              <p class="font-semibold m-0 text-[13px] text-gray-800 leading-tight mt-0.5">Aplikasi Penjualan | POS Application</p>
            </div>
          </div>

          <!-- Error Feedback -->
          <div v-if="error" class="alert alert-danger bg-red-50 text-red-600 border border-red-100 rounded-lg p-2.5 text-xs text-left mb-3">
            {{ errorMessage }}
          </div>

          <!-- Input Fields -->
          <div class="text-left">
            <div class="mb-3">
              <label for="username" class="form-label text-[14px] text-gray-700 font-semibold mb-1 block must-filled">Nama Pengguna</label>
              <input 
                v-model="username" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-full text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" 
                id="username" 
                name="username" 
                autofocus
                required
              >
            </div>
            <div class="mb-5">
              <label for="password" class="form-label text-[14px] text-gray-700 font-semibold mb-1 block must-filled">Password</label>
              <input 
                v-model="password" 
                type="password" 
                class="w-full px-4 py-2 border border-gray-300 rounded-full text-[14px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium" 
                id="password" 
                name="password"
                required
              >
            </div>
          </div>

          <!-- Login Actions -->
          <div>
            <button 
              type="submit" 
              :disabled="loading" 
              class="w-full btn font-semibold text-white rounded-full py-2.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 select-none text-[14px] disabled:opacity-80" 
              style="background-color: #ffa857"
            >
              <span>Masuk</span>
              <i 
                class="fa-duotone fa-spinner-third fa-spin transition-all duration-300"
                :class="[loading ? 'opacity-100 w-fit' : 'opacity-0 w-0']"
              ></i>
            </button>
          </div>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import loginImg from '../assets/login.jpg';
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
  
  // Simulate network check delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Generate dummy JWT token (simulating bypass validation)
    const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZhcnJhcyBLdXkiLCJ1c2VybmFtZSI6ImZhcnJhc2t1eSIsInJvbGUiOiJTdXBlciBBZG1pbiIsImZvdG8iOiJkZWZhdWx0LnBuZyIsImV4cCI6MTgwNzkwMDYwMH0.signature';
    const mockRefreshToken = 'mock_refresh_token_xyz_12345';
    
    authStore.setTokens({
      access_token: mockAccessToken,
      refresh_token: mockRefreshToken
    });
    
    const redirect = route.query.redirect || '/';
    router.push(redirect);
  } catch (err) {
    error.value = true;
    errorMessage.value = 'Nama pengguna atau password salah.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* Scoped CSS replication matching login-style2.css */
.box-area {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.left-box {
  background-color: #ffd72f;
  filter: brightness(0.8);
  background-size: cover;
  background-position-x: center;
  animation: scrolling 150s infinite linear;
}

@keyframes scrolling {
  to {
    background-position-y: 100%;
  }
}

.must-filled::before {
  content: '* ';
  color: red;
  font-size: 14px;
}

/* Form input custom focusing to replicate form-control styles */
input:focus {
  box-shadow: 0 0 0 0.2rem rgba(255, 168, 87, 0.25);
}

@media only screen and (max-width: 768px) {
  .box-area {
    width: min(400px, calc(100vw - 32px)) !important;
    height: auto !important;
    flex-direction: column !important;
    border-radius: 20px !important;
  }
  .left-box {
    width: 100% !important;
    height: 120px !important;
    border-radius: 12px !important;
  }
  .right-box {
    padding-left: 0 !important;
    width: 100% !important;
  }
}
</style>
