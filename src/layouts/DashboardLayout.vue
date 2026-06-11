<template>
  <div class="min-h-screen bg-gray-50 flex overflow-hidden">
    <!-- Collapsible Sidebar -->
    <Sidebar :is-collapsed="isCollapsed" />

    <!-- Main Content Area -->
    <div 
      class="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-500 ease-in-out"
      :class="[isCollapsed ? 'pl-[78px]' : 'pl-[15rem]']"
    >
      <!-- Top Navbar -->
      <Navbar 
        @toggle-sidebar="toggleSidebar" 
      />

      <!-- Content Scroll Wrapper -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden relative h-[calc(100vh-60px)]">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>

    <!-- Reusable Logout Confirmation Modal -->
    <Modal 
      :show="showLogoutModal" 
      title="Konfirmasi Logout"
      message="Apakah anda yakin ingin logout dari aplikasi?"
      @close="showLogoutModal = false"
      @confirm="confirmLogout"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import Sidebar from '../components/layout/Sidebar.vue';
import Navbar from '../components/layout/Navbar.vue';
import Modal from '../components/ui/Modal.vue';

const authStore = useAuthStore();
const isCollapsed = ref(sessionStorage.getItem('sidebar_state') === 'true');
const showLogoutModal = ref(false);

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
  sessionStorage.setItem('sidebar_state', isCollapsed.value.toString());
}

function handleShowLogout() {
  showLogoutModal.value = true;
}

function confirmLogout() {
  showLogoutModal.value = false;
  authStore.logout();
}

onMounted(() => {
  window.addEventListener('show-logout-modal', handleShowLogout);
});

onUnmounted(() => {
  window.removeEventListener('show-logout-modal', handleShowLogout);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
