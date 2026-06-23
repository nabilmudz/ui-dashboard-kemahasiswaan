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
          SSO Dashboard
        </span>
      </router-link>
    </div>

    <!-- Navigation Links -->
    <ul class="nav-links flex-1 py-0 px-0 pb-[115px] overflow-y-auto overflow-x-visible no-scrollbar list-none" style="padding-bottom: 115px;">
      <!-- Home -->
      <SidebarItem 
        to="/" 
        icon="fa-regular fa-house" 
        label="Home" 
        :is-collapsed="isCollapsed" 
      />

      <!-- Analytical Dashboard (With role-based dropdown child submenus) -->
      <SidebarItem 
        to="/analytics" 
        icon="fa-regular fa-chart-column" 
        label="Dashboard" 
        :is-collapsed="isCollapsed" 
        :children="dashboardChildren"
      />

      <!-- Dynamic Integrated Apps Dropdown -->
      <SidebarItem 
        v-if="appChildren.length > 0"
        icon="fa-regular fa-grid-2" 
        label="Aplikasi Layanan" 
        :is-collapsed="isCollapsed"
        :children="appChildren"
      />

      <!-- SSO Profile -->
      <SidebarItem 
        to="/sso-profile" 
        icon="fa-regular fa-user" 
        label="Profil SSO" 
        :is-collapsed="isCollapsed" 
      />
    </ul>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import SidebarItem from './SidebarItem.vue';

const authStore = useAuthStore();

defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

const isMahasiswa = computed(() => authStore.user?.role === 'MAHASISWA');
const isKajur = computed(() => authStore.user?.role === 'KAJUR');
const isAdmin = computed(() => ['STAFF', 'WD3', 'KLI'].includes(authStore.user?.role));

const allowedAppSources = computed(() => {
  return (authStore.user?.accessibleApps || []).map(app => {
    return typeof app === 'string' ? app : app.appSource;
  });
});

const dashboardChildren = computed(() => {
  if (isMahasiswa.value) return [];
  
  const children = [
    { to: '/analytics?tab=overview', label: 'Ringkasan Statistik', icon: 'fa-regular fa-chart-pie' },
    { to: '/analytics?tab=proposals', label: 'Antrean Pending', icon: 'fa-regular fa-list-check' }
  ];

  if (allowedAppSources.value.includes('PKM') && isAdmin.value) {
    children.push({ to: '/analytics?tab=pkm', label: 'PKM', icon: 'fa-regular fa-lightbulb' });
  }
  if (allowedAppSources.value.includes('PMW') && isAdmin.value) {
    children.push({ to: '/analytics?tab=pmw', label: 'PMW', icon: 'fa-regular fa-briefcase' });
  }
  if (allowedAppSources.value.includes('BEASISWA') && (isAdmin.value || isKajur.value)) {
    children.push({ to: '/analytics?tab=beasiswa', label: 'Proposal', icon: 'fa-regular fa-file-signature' });
  }
  if (allowedAppSources.value.includes('PRESTASI') && isAdmin.value) {
    children.push({ to: '/analytics?tab=prestasi', label: 'Kompetisi & Prestasi', icon: 'fa-regular fa-trophy' });
  }
  if (allowedAppSources.value.includes('SARPRAS') && isAdmin.value) {
    children.push({ to: '/analytics?tab=recap', label: 'Rekap Ormawa', icon: 'fa-regular fa-chart-column' });
    children.push({ to: '/analytics?tab=venues', label: 'Okupansi Venue', icon: 'fa-regular fa-door-open' });
  }

  return children;
});

const appChildren = computed(() => {
  return (authStore.user?.accessibleApps || []).map(app => {
    const source = typeof app === 'string' ? app : app.appSource;
    const isAvailable = typeof app === 'string' ? true : app.isAvailable;
    const deepLinkUrl = typeof app === 'string' ? '#' : app.deepLinkUrl;

    let icon = 'fa-regular fa-globe';
    let label = source;
    if (source === 'PKM') {
      icon = 'fa-regular fa-lightbulb';
      label = 'PKM';
    } else if (source === 'PMW') {
      icon = 'fa-regular fa-briefcase';
      label = 'PMW';
    } else if (source === 'BEASISWA') {
      icon = 'fa-regular fa-file-signature';
      label = 'Proposal';
    } else if (source === 'PRESTASI') {
      icon = 'fa-regular fa-trophy';
      label = 'Lapor Kompetisi & Prestasi';
    } else if (source === 'KA_ORMAWA') {
      icon = 'fa-regular fa-users';
      label = 'Ka-Ormawa';
    } else if (source === 'SARPRAS') {
      icon = 'fa-regular fa-building';
      label = 'Sarpras';
    }
    
    return {
      href: deepLinkUrl,
      icon: icon,
      label: label
    };
  });
});

function onImgError(e) {
  e.target.src = 'https://ui-avatars.com/api/?name=FK&background=ff6b35&color=fff&bold=true';
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
