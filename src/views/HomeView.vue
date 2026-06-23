<template>
  <section class="p-8 lg:p-12 relative  min-h-full">
    <!-- Orange Header Banner -->
    <div class="absolute w-full h-[200px] top-0 left-0 right-0 z-0 bg-brand-orange"></div>
    
    <!-- Welcome Header Texts -->
    <div class="relative z-10 text-white mb-8">
      <h1 class="font-bold m-0 text-white text-[48px] tracking-tight leading-none">Selamat Datang di,</h1>
      <p class="font-semibold text-black mt-1 text-base">Dashboard Kemahasiswaan Polban</p>
    </div>
    
    <!-- Card 1: Reusable Dynamic Quick Menu based on Permissions -->
    <div class="relative z-10 rounded-2xl bg-white p-6 shadow-sm flex flex-col gap-4">
      <p class="font-bold text-xs text-gray-400 uppercase tracking-wider m-0">Akses Cepat Layanan Anda</p>
      <div v-if="accessibleApps.length === 0" class="text-xs text-gray-500 font-semibold py-2">
        Anda tidak memiliki aplikasi yang dapat diakses langsung. Silakan hubungi admin.
      </div>
      <div class="flex flex-wrap gap-x-6 gap-y-4" v-else>
        <QuickMenuItem 
          v-for="app in accessibleApps" 
          :key="app.appSource"
          :href="app.deepLinkUrl" 
          :icon="getAppIcon(app.appSource)" 
          :color="getAppColor(app.appSource)" 
          :title="getAppDisplayName(app.appSource)" 
          :description="getAppDesc(app.appSource)" 
        />
      </div>
    </div>

    <!-- Responsive Split Layout (4/12 and 8/12 - Swapped Order) -->
    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      
      <!-- 4/12 Column: Opportunities & Notifications (On Left) -->
      <div class="lg:col-span-4 rounded-2xl bg-white p-6 shadow-sm flex flex-col">
        
        <!-- A. MAHASISWA VIEW: Opportunities (Lomba & Beasiswa) -->
        <template v-if="isMahasiswa">
          <p class="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">Peluang Aktif (Lomba & Beasiswa)</p>
          
          <div v-if="loadingOpps" class="flex-1 flex flex-col items-center justify-center py-12">
            <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
            <span class="text-[11px] text-gray-500 font-semibold">Memuat peluang baru...</span>
          </div>
          
          <div v-else-if="opportunities.length === 0" class="flex-1 flex items-center justify-center py-12 text-center text-gray-400 font-semibold text-xs">
            Tidak ada peluang aktif pendaftaran saat ini.
          </div>
          
          <div v-else class="space-y-3 overflow-y-auto max-h-[380px] pr-1">
            <div 
              v-for="opp in opportunities" 
              :key="opp.opportunityId"
              class="p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl transition-colors flex flex-col justify-between"
            >
              <div class="flex justify-between items-start gap-2">
                <span class="px-2 py-0.5 rounded font-bold text-[8px] uppercase tracking-wide" :class="opp.type === 'BEASISWA' ? 'bg-emerald-50 text-emerald-600' : 'bg-pink-50 text-pink-600'">
                  {{ opp.type }}
                </span>
                <span class="text-[9px] text-gray-400 font-bold uppercase">{{ getAppDisplayName(opp.appSource) }}</span>
              </div>
              <h4 class="font-bold text-gray-900 text-xs mt-2 mb-1 leading-normal line-clamp-2">{{ opp.name }}</h4>
              <p class="text-[10px] text-gray-500 m-0 line-clamp-2 leading-relaxed">{{ opp.description }}</p>
              
              <div class="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                <span class="text-[9px] text-red-500 font-bold flex items-center gap-1">
                  <i class="fa-regular fa-clock"></i> Tutup: {{ formatDate(opp.closeDate) }}
                </span>
                <a 
                  :href="opp.deepLinkUrl" 
                  target="_blank" 
                  class="text-[9px] font-bold text-brand-orange hover:underline no-underline flex items-center gap-0.5"
                >
                  Daftar <i class="fa-solid fa-chevron-right"></i>
                </a>
              </div>
            </div>
          </div>
        </template>

        <!-- B. STAFF / WD3 / KLI VIEW: Notifications (Swapped S2S status to dynamic app notifications) -->
        <template v-else>
          <p class="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">Notifikasi Aktivitas</p>
          
          <div class="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-400 font-semibold text-xs bg-gray-50/50 rounded-2xl">
            <i class="fa-regular fa-bell-slash text-2xl mb-2 text-gray-300"></i>
            <span>Belum ada notifikasi baru dari sub-aplikasi.</span>
          </div>
        </template>

      </div>

      <!-- 8/12 Column: Timeline Calendar (On Right) -->
      <div class="lg:col-span-8 rounded-2xl bg-white p-6 shadow-sm flex flex-col">
        <div class="flex justify-between items-center mb-4 flex-wrap gap-2 ">
          <div>
            <p class="font-bold text-xs text-gray-400 uppercase tracking-wider m-0">Kalender Agenda & Fase Kegiatan</p>
            <p class="text-[11px] text-gray-500 font-medium mt-0.5">Jadwal fase aktif yang diintegrasikan dari PKM, PMW, Proposal, dan Ormawa</p>
          </div>
          <!-- App warning indicator in timeline -->
          <div v-if="offlineAppsCount > 0" class="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
            {{ offlineAppsCount }} App Offline
          </div>
        </div>
        
        <TimelineCalendar />
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import QuickMenuCard from '../components/dashboard/QuickMenuCard.vue';
import QuickMenuItem from '../components/dashboard/QuickMenuItem.vue';
import TimelineCalendar from '../components/dashboard/TimelineCalendar.vue';

const authStore = ref(useAuthStore());

const isMahasiswa = computed(() => authStore.value.user?.role === 'MAHASISWA');
const accessibleApps = computed(() => authStore.value.user?.accessibleApps || []);

const offlineAppsCount = computed(() => {
  return accessibleApps.value.filter(app => !app.isAvailable).length;
});

// Opportunities logic (for Mahasiswa)
const opportunities = ref([]);
const loadingOpps = ref(false);

async function fetchOpportunities() {
  if (!isMahasiswa.value) return;
  loadingOpps.value = true;
  try {
    const response = await api.get('/dashboard/opportunities');
    opportunities.value = response.data?.data || [];
  } catch (err) {
    console.error('Failed to load opportunities:', err);
  } finally {
    loadingOpps.value = false;
  }
}

// Display Name Helper mapping
function getAppDisplayName(appSource) {
  switch (appSource) {
    case 'PKM': return 'PKM';
    case 'PMW': return 'PMW';
    case 'BEASISWA': return 'Proposal';
    case 'PRESTASI': return 'Lapor Kompetisi & Prestasi';
    case 'KA_ORMAWA': return 'Ka-Ormawa';
    case 'SARPRAS': return 'Sarpras';
    default: return appSource;
  }
}

// Icon Helper mapping
function getAppIcon(appSource) {
  switch (appSource) {
    case 'PKM': return 'fa-regular fa-lightbulb';
    case 'PMW': return 'fa-regular fa-briefcase';
    case 'BEASISWA': return 'fa-regular fa-file-signature';
    case 'PRESTASI': return 'fa-regular fa-trophy';
    case 'KA_ORMAWA': return 'fa-regular fa-users';
    case 'SARPRAS': return 'fa-regular fa-building';
    default: return 'fa-regular fa-globe';
  }
}

// Color Helper mapping
function getAppColor(appSource) {
  switch (appSource) {
    case 'PKM': return '#f59e0b';
    case 'PMW': return '#3b82f6';
    case 'BEASISWA': return '#10b981';
    case 'PRESTASI': return '#ec4899';
    case 'KA_ORMAWA': return '#8b5cf6';
    case 'SARPRAS': return '#2563eb';
    default: return '#6b7280';
  }
}

// Description Helper mapping
function getAppDesc(appSource) {
  switch (appSource) {
    case 'PKM': return 'Program Kreativitas Mahasiswa';
    case 'PMW': return 'Program Mahasiswa Wirausaha';
    case 'BEASISWA': return 'Pengajuan Proposal Beasiswa';
    case 'PRESTASI': return 'Lapor Kompetisi & Prestasi';
    case 'KA_ORMAWA': return 'Pemilihan Ketua Ormawa';
    case 'SARPRAS': return 'Peminjaman Sarana & Prasarana';
    default: return `Aplikasi ${appSource}`;
  }
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return isoStr;
  }
}

onMounted(() => {
  fetchOpportunities();
});
</script>
