<template>
  <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
    <!-- Loader -->
    <div v-if="loading" class="p-12 text-center flex flex-col items-center justify-center">
      <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs text-gray-400 font-medium">Memuat data rekap Ormawa...</p>
    </div>

    <!-- Main Error Alert -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-4">
      <div class="flex justify-between items-center flex-wrap gap-3 mb-2">
        <div>
          <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Rekap Status Per Ormawa (Data Sarpras)</h3>
          <p class="text-xs text-gray-500 mt-0.5">Ringkasan status pengajuan fasilitas dan kegiatan per unit organisasi mahasiswa.</p>
        </div>
        <!-- Search bar -->
        <div class="flex items-center gap-2">
          <input 
            v-model="recapSearch" 
            type="text" 
            placeholder="Cari nama Ormawa..." 
            class="px-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-brand-orange w-48 font-semibold"
          />
          <select 
            v-model="recapPeriod" 
            class="px-3 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none font-semibold text-gray-700"
          >
            <option value="">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="py-3 px-4 font-bold text-gray-700">Nama Ormawa</th>
              <th class="py-3 px-4 font-bold text-gray-700">NPA</th>
              <th class="py-3 px-4 font-bold text-gray-700 text-center">Total Pengajuan</th>
              <th class="py-3 px-4 font-bold text-gray-700 text-center">Pending (%)</th>
              <th class="py-3 px-4 font-bold text-gray-700 text-center">Revisi (%)</th>
              <th class="py-3 px-4 font-bold text-gray-700 text-center">Ditolak (%)</th>
              <th class="py-3 px-4 font-bold text-gray-700 text-center">Disetujui (%)</th>
              <th class="py-3 px-4 font-bold text-gray-700 text-center">Approval Rate</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="paginatedRecap.length === 0">
              <td colspan="8" class="py-6 text-center text-gray-400 font-semibold">Tidak ada data rekap Ormawa yang sesuai.</td>
            </tr>
            <tr v-for="item in paginatedRecap" :key="item.ormawaNpa" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-3 px-4 font-semibold text-gray-955">
                <a :href="item.deepLinkUrl" target="_blank" class="hover:underline text-gray-955">{{ item.ormawaNama }}</a>
              </td>
              <td class="py-3 px-4 font-mono font-semibold text-gray-500">{{ item.ormawaNpa }}</td>
              <td class="py-3 px-4 text-center font-bold text-gray-900">{{ item.totalPengajuan }}</td>
              <td class="py-3 px-4 text-center font-medium text-amber-600 bg-amber-50/20">
                {{ item.breakdown.PENDING }} <span class="text-[9px] text-gray-400">({{ item.breakdown.percentPending }}%)</span>
              </td>
              <td class="py-3 px-4 text-center font-medium text-brand-orange bg-brand-accent/50">
                {{ item.breakdown.REVISION }} <span class="text-[9px] text-gray-400">({{ item.breakdown.percentRevision }}%)</span>
              </td>
              <td class="py-3 px-4 text-center font-medium text-red-600 bg-red-50/20">
                {{ item.breakdown.REJECTED }} <span class="text-[9px] text-gray-400">({{ item.breakdown.percentRejected }}%)</span>
              </td>
              <td class="py-3 px-4 text-center font-medium text-emerald-600 bg-emerald-50/20">
                {{ item.breakdown.APPROVED }} <span class="text-[9px] text-gray-400">({{ item.breakdown.percentApproved }}%)</span>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <span class="font-bold text-gray-900">{{ item.approvalRate }}%</span>
                  <!-- Small mini bar -->
                  <div class="w-10 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full" :style="{ width: item.approvalRate + '%' }"></div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="filteredRecap.length > 0" class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 flex-wrap gap-3 text-xs select-none">
        <div class="flex items-center gap-2">
          <span class="text-gray-500 font-medium">Tampilkan per halaman:</span>
          <select 
            v-model="perPage" 
            @change="currentPage = 1"
            class="px-2 py-1 border border-gray-200 rounded bg-white text-gray-700 font-semibold focus:outline-none focus:border-brand-orange cursor-pointer"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span class="text-gray-400 font-medium ml-1">
            Menampilkan {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredRecap.length) }} dari {{ filteredRecap.length }} data
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <button 
            @click="prevPage" 
            :disabled="currentPage === 1"
            class="p-1.5 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
            title="Halaman sebelumnya"
          >
            <i class="fa-solid fa-chevron-left text-[9px]"></i>
          </button>
          
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="currentPage = page"
            class="px-2.5 py-1 border rounded text-[10px] font-bold transition-all cursor-pointer"
            :class="currentPage === page ? 'bg-brand-orange border-brand-orange text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'"
          >
            {{ page }}
          </button>

          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="p-1.5 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center"
            title="Halaman berikutnya"
          >
            <i class="fa-solid fa-chevron-right text-[9px]"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import api from '../../services/api';

const loading = ref(true);
const errorMsg = ref('');
const ormawaRecaps = ref([]);
const recapSearch = ref('');
const recapPeriod = ref('');

// Pagination States
const currentPage = ref(1);
const perPage = ref(10);

const totalPages = computed(() => {
  return Math.ceil(filteredRecap.value.length / perPage.value) || 1;
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * perPage.value;
});

const endIndex = computed(() => {
  return startIndex.value + perPage.value;
});

const paginatedRecap = computed(() => {
  return filteredRecap.value.slice(startIndex.value, endIndex.value);
});

watch([recapSearch, recapPeriod, perPage], () => {
  currentPage.value = 1;
});

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

const filteredRecap = computed(() => {
  return ormawaRecaps.value.filter(item => {
    const matchSearch = item.ormawaNama.toLowerCase().includes(recapSearch.value.toLowerCase()) || 
                        item.ormawaNpa.toLowerCase().includes(recapSearch.value.toLowerCase());
    let matchPeriod = true;
    if (recapPeriod.value && item.lastSubmittedAt) {
      matchPeriod = item.lastSubmittedAt.startsWith(recapPeriod.value);
    }
    return matchSearch && matchPeriod;
  });
});

async function loadRecaps() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.get('/dashboard/recap/ormawa');
    ormawaRecaps.value = res.data?.data || [];
  } catch (err) {
    console.error('Error loading recap list:', err);
    errorMsg.value = 'Gagal memuat rekap Ormawa.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRecaps();
});
</script>
