<template>
  <aside 
    class="sidebar bg-white py-2 fixed top-0 left-0 h-full border-r border-black/5 z-[90] transition-all duration-500 ease-in-out select-none flex flex-col shadow-none"
    :class="[isCollapsed ? 'w-[78px]' : 'w-[15rem]']"
  >
    <!-- Logo & Store Details (Exact CSS match) -->
    <div class="logo">
      <router-link to="/" class="logo-details">
        <div class="img">
          <img 
            src="/src/assets/logo.png" 
            alt="Logo" 
            width="35" 
            height="35" 
            class="d-inline-block align-text-top object-contain"
            @error="onImgError"
          />
        </div>
        <span 
          class="logo_name text-[16px] font-semibold truncate text-black transition-opacity duration-300 ml-1"
          :class="[isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100']"
        >
          Farraskuy Shop
        </span>
      </router-link>
    </div>

    <!-- Navigation Links -->
    <ul class="nav-links flex-1 py-0 px-0 pb-[115px] overflow-y-auto overflow-x-visible no-scrollbar list-none" style="padding-bottom: 115px;">
      <!-- Single Menu Item Example (Home) -->
      <SidebarItem 
        to="/" 
        icon="fa-regular fa-house" 
        label="Home" 
        :is-collapsed="isCollapsed" 
      />

      <!-- Dropdown / Multi-Level Item Example (Data Barang with 1 sub-item) -->
      <SidebarItem 
        icon="fa-light fa-box" 
        label="Data Barang" 
        :is-collapsed="isCollapsed"
        :children="[
          { to: '/barang', icon: 'fa-regular fa-book', label: 'Daftar Barang' }
        ]"
      />
    </ul>
  </aside>
</template>

<script setup>
import SidebarItem from './SidebarItem.vue';

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

function onImgError(e) {
  e.target.src = 'https://ui-avatars.com/api/?name=FK&background=f9d428&color=000&bold=true';
}
</script>

<style scoped>
/* Scoped css matching style.css */
.sidebar .logo {
  padding: 0 10px;
  height: 60px;
  width: 100%;
  display: flex;
  align-items: center;
}

.sidebar .logo-details {
  text-decoration: none;
  padding-bottom: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.sidebar .logo .img {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 60px;
}

.sidebar .logo .logo_name {
  text-decoration: none;
  color: black;
  transition: 0.3s ease;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
