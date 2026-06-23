<template>
  <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
    <!-- Loader -->
    <div v-if="loading" class="p-12 text-center flex flex-col items-center justify-center">
      <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs text-gray-400 font-medium">Memuat data antrean pending...</p>
    </div>

    <!-- Error Alert -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-4">
      <div class="flex justify-between items-center flex-wrap gap-3 mb-2">
        <div>
          <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Antrean Pending Proposal</h3>
          <p class="text-xs text-gray-500 mt-0.5">Daftar seluruh berkas pending yang memerlukan tindakan persetujuan Anda.</p>
        </div>
        
        <!-- App Source Filter Buttons (Only show accessible apps) -->
        <div class="flex items-center gap-1">
          <button 
            type="button"
            class="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer border-0"
            :class="selectedAppFilter === 'ALL' ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="selectedAppFilter = 'ALL'"
          >
            ALL
          </button>
          <button 
            v-for="app in allowedAppSources" 
            :key="app"
            type="button"
            class="px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors cursor-pointer border-0"
            :class="selectedAppFilter === app ? 'bg-brand-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="selectedAppFilter = app"
          >
            {{ app }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="py-3 px-4 font-bold text-gray-700">Aplikasi</th>
              <th class="py-3 px-4 font-bold text-gray-700">NIM/NPA Pengaju</th>
              <th class="py-3 px-4 font-bold text-gray-700">Nama Pengaju</th>
              <th class="py-3 px-4 font-bold text-gray-700">Judul Pengajuan</th>
              <th class="py-3 px-4 font-bold text-gray-700">Tgl Masuk</th>
              <th class="py-3 px-4 font-bold text-gray-700">Tahap Verifikasi</th>
              <th class="py-3 px-4 font-bold text-gray-700 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="filteredPendingProposals.length === 0">
              <td colspan="7" class="py-6 text-center text-gray-400 font-semibold">Tidak ada antrean proposal pending untuk kriteria ini.</td>
            </tr>
            <tr v-for="prop in filteredPendingProposals" :key="prop.submissionId" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded font-bold text-[9px] bg-slate-100 text-slate-700 uppercase tracking-wide">{{ prop.appSource }}</span>
              </td>
              <td class="py-3 px-4 font-mono font-semibold text-gray-700">{{ prop.submitterNim || prop.submitterNpa || '-' }}</td>
              <td class="py-3 px-4 font-semibold text-gray-900">{{ prop.submitterName }}</td>
              <td class="py-3 px-4 font-semibold text-gray-955 truncate max-w-[200px]" :title="prop.title">{{ prop.title }}</td>
              <td class="py-3 px-4 text-gray-500 font-medium">{{ formatDate(prop.submittedAt) }}</td>
              <td class="py-3 px-4 font-semibold text-gray-600">
                {{ prop.currentStage || 'Pemeriksaan Awal' }}
              </td>
              <td class="py-3 px-4 text-center">
                <a :href="prop.deepLinkUrl" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-white bg-brand-orange rounded hover:bg-brand-orange/90 transition-colors no-underline">
                  <i class="fa-solid fa-pen-to-square"></i> Review Berkas
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';

const authStore = useAuthStore();

const loading = ref(true);
const errorMsg = ref('');
const pendingProposals = ref([]);
const selectedAppFilter = ref('ALL');

// List of allowed AppSources based on user token response
const allowedAppSources = computed(() => {
  return (authStore.user?.accessibleApps || []).map(app => {
    return typeof app === 'string' ? app : app.appSource;
  });
});

const filteredPendingProposals = computed(() => {
  let list = pendingProposals.value;
  // Step 1: Filter by overall user accessible apps
  list = list.filter(p => allowedAppSources.value.includes(p.appSource));

  // Step 2: Filter by selected tab button filter
  if (selectedAppFilter.value !== 'ALL') {
    list = list.filter(p => p.appSource === selectedAppFilter.value);
  }
  return list;
});

function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return isoStr;
  }
}

async function loadPendingProposals() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.get('/api/v1/dashboard/proposals/pending');
    pendingProposals.value = res.data?.data || [];
  } catch (err) {
    console.error('Error fetching proposals:', err);
    errorMsg.value = 'Gagal memuat antrean pending.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPendingProposals();
});
</script>
