<template>
  <nav class="sticky top-0 z-[80] bg-white border-b border-black/5 p-0 flex items-center h-[60px]">
    <div class="w-full bg-white flex justify-between items-center py-2 px-4">
      
      <!-- Toggle Hamburger Button -->
      <button 
        class="p-2 hover:bg-gray-100/50 rounded transition-colors cursor-pointer border-0" 
        type="button" 
        @click="$emit('toggle-sidebar')"
      >
        <i class="fa-solid fa-bars fa-lg"></i>
      </button>

      <!-- Profile Section Dropdown -->
      <div class="relative" ref="dropdownRef">
        <a 
          class="block no-underline select-none" 
          style="cursor: pointer" 
          @click="isOpen = !isOpen"
        >
          <div style="height: 45px; width: 170px;" class="flex items-center gap-1.5 text-left">
            <!-- Left Texts -->
            <div class="text-black col-9 flex flex-col justify-center flex-1 min-w-0 pr-1">
              <small class="p-0 m-0 font-semibold text-[13px] leading-tight truncate block">{{ authStore.user?.nama || 'Guest' }}</small>
              <small class="p-0 m-0 text-[12px] text-gray-500 leading-tight w-[75%] truncate block">{{ authStore.user?.role || 'Guest' }}</small>
            </div>
            <!-- Right Avatar -->
            <div class="h-[40px] w-[40px] shrink-0 text-center flex items-center justify-center">
              <img 
                style="object-fit: cover;" 
                class="rounded-full border border-gray-150" 
                height="40" 
                width="40" 
                :src="avatarUrl" 
                alt="Avatar"
              />
            </div>
          </div>
        </a>

        <!-- Dropdown Menu Profil -->
        <div 
          v-if="isOpen" 
          style="min-width: 300px;" 
          class="absolute right-0 top-[50px] bg-white border border-black/10 p-3 rounded shadow-lg z-50 text-center flex flex-col items-center dropdown-menu-profil show"
        >
          <div class="flex items-center flex-col w-full text-center">
            <img 
              style="object-fit: cover;" 
              class="rounded-full mb-3 border border-gray-150" 
              height="70" 
              width="70" 
              :src="avatarUrl" 
              alt="Avatar"
            />
            <p class="text-wrap font-semibold text-[14px] mb-0 text-black leading-tight">{{ authStore.user?.nama || 'Guest User' }}</p>
            <p class="text-wrap text-gray-500 font-semibold text-[13px] mb-0 leading-normal mt-1">@{{ authStore.user?.username || 'guest' }}</p>
            <p class="text-wrap text-[13px] text-black mb-0 leading-normal mt-0.5">{{ authStore.user?.role || 'Guest' }}</p>
          </div>
          
          <hr class="my-3 mb-2 border-black/5 w-full">
          
          <!-- Logout Button -->
          <button 
            type="button" 
            class="w-full text-left px-3 py-2 text-xs font-semibold text-gray-800 hover:bg-black/5 rounded transition-colors flex items-center gap-3 border-0 bg-transparent cursor-pointer"
            @click="triggerLogout"
          >
            <i class="fa-regular fa-right-from-bracket text-sm shrink-0"></i>
            <span class="m-0">Logout</span>
          </button>
        </div>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';

defineEmits(['toggle-sidebar']);

const authStore = useAuthStore();
const isOpen = ref(false);
const dropdownRef = ref(null);

const avatarUrl = computed(() => {
  const foto = authStore.user?.foto || 'default.png';
  if (foto === 'default.png' || foto.includes('default')) {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authStore.user?.nama || 'Guest') + '&background=2563eb&color=fff&bold=true';
  }
  return foto;
});

function triggerLogout() {
  isOpen.value = false;
  window.dispatchEvent(new CustomEvent('show-logout-modal'));
}

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Exact styling matching original layout.css profiling */
.dropdown-menu-profil {
  transition: opacity 0.3s ease, top 0.3s ease;
}
</style>
