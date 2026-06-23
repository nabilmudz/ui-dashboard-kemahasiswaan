<template>
  <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
    <!-- Loader -->
    <div v-if="loading" class="p-12 text-center flex flex-col items-center justify-center">
      <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs text-gray-400 font-medium">Memuat data PKM...</p>
    </div>

    <!-- Main Error Alert -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <div>
        <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Program Kreativitas Mahasiswa (PKM)</h3>
        <p class="text-xs text-gray-500 mt-0.5">Analitis performa proposal, sebaran jurusan, dan penilai berdasarkan peran Anda.</p>
      </div>

      <!-- KPI Error Banner -->
      <div v-if="pkmErrors.kpi" class="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
        ⚠️ {{ pkmErrors.kpi }}
      </div>

      <!-- WD3 View: KPI & Scoreboard -->
      <div v-if="authStore.user?.role === 'WD3'" class="space-y-6">
        <div v-if="pkmData.kpi" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Proposal Masuk</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ pkmData.kpi.totalProposalMasuk }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Lolos Seleksi</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ pkmData.kpi.totalLolosSeleksi }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Didanai (Approved)</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">{{ pkmData.kpi.totalDidanai }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Rasio Kelulusan</p>
            <p class="text-2xl font-bold text-brand-orange mt-1">{{ pkmData.kpi.successRatePercent }}%</p>
          </div>
        </div>

        <div v-if="pkmData.scoreboardJurusan" class="space-y-3">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Scoreboard Peringkat Jurusan</h4>
          <div class="overflow-x-auto rounded-xl border border-gray-100/70">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="py-3 px-4 font-bold text-gray-700 w-16 text-center">Rank</th>
                  <th class="py-3 px-4 font-bold text-gray-700">Jurusan</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Total Proposal</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Lolos ACC</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Poin Score</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="row in paginatedScoreboard" :key="row.jurusan" class="hover:bg-gray-50/50">
                  <td class="py-3 px-4 text-center font-bold text-brand-orange">#{{ row.rank }}</td>
                  <td class="py-3 px-4 font-semibold text-gray-900">{{ row.jurusan }}</td>
                  <td class="py-3 px-4 text-center font-medium text-gray-600">{{ row.totalProposal }}</td>
                  <td class="py-3 px-4 text-center font-bold text-emerald-600">{{ row.totalApproved }}</td>
                  <td class="py-3 px-4 text-center font-bold text-gray-800">{{ row.scorePoint }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div v-if="pkmData.scoreboardJurusan && pkmData.scoreboardJurusan.length > 0" class="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 flex-wrap gap-3 text-xs select-none">
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
                Menampilkan {{ startIndex + 1 }}-{{ Math.min(endIndex, pkmData.scoreboardJurusan.length) }} dari {{ pkmData.scoreboardJurusan.length }} data
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

      <!-- KLI View: Sebaran per skema & tren tahunan -->
      <div v-else-if="authStore.user?.role === 'KLI'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sebaran per skema -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Proposal Per Skema PKM</h4>
          <div v-if="pkmErrors.schemeDist" class="text-xs text-red-500 font-semibold">⚠️ {{ pkmErrors.schemeDist }}</div>
          <div v-else-if="pkmSchemeDist.length === 0" class="text-xs text-gray-400">Tidak ada data sebaran skema.</div>
          <div v-else class="space-y-3">
            <div v-for="sc in pkmSchemeDist" :key="sc.scheme" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ sc.scheme }}</span>
                <span>{{ sc.count }} Proposal</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full" :style="{ width: getPercentage(sc.count, pkmData.kpi?.totalProposalMasuk || 210) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tren tahunan -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Tren Jumlah Proposal Per Tahun</h4>
          <div v-if="pkmErrors.annualTrend" class="text-xs text-red-500 font-semibold">⚠️ {{ pkmErrors.annualTrend }}</div>
          <div v-else-if="pkmAnnualTrend.length === 0" class="text-xs text-gray-400">Tidak ada data tren tahunan.</div>
          <div v-else class="space-y-4">
            <div v-for="t in pkmAnnualTrend" :key="t.year" class="flex items-center gap-3">
              <span class="w-12 font-bold text-xs text-gray-600">{{ t.year }}</span>
              <div class="flex-1 bg-gray-100 h-4 rounded-lg overflow-hidden relative">
                <div class="bg-brand-orange h-full rounded-lg flex items-center pl-2" :style="{ width: getPercentage(t.count, pkmData.kpi?.totalProposalMasuk || 250) + '%' }">
                  <span class="text-[9px] font-bold text-white">{{ t.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- STAFF View: Distribusi status & progres reviewer -->
      <div v-else-if="authStore.user?.role === 'STAFF'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Distribusi Status -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Distribusi Status Proposal PKM</h4>
          <div v-if="pkmErrors.statusDist" class="text-xs text-red-500 font-semibold">⚠️ {{ pkmErrors.statusDist }}</div>
          <div v-else-if="pkmStatusDist.length === 0" class="text-xs text-gray-400">Tidak ada data status distribusi.</div>
          <div v-else class="space-y-3">
            <div v-for="st in pkmStatusDist" :key="st.status" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ st.status }}</span>
                <span>{{ st.count }} Tim ({{ st.percent }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="h-full" :class="st.status === 'Approved' ? 'bg-emerald-500' : st.status === 'Pending' ? 'bg-amber-500' : st.status === 'Revision' ? 'bg-indigo-500' : 'bg-red-500'" :style="{ width: st.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progres Reviewer -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Progres Penilaian Reviewer Internal</h4>
          <div v-if="pkmErrors.reviewerProg" class="text-xs text-red-500 font-semibold">⚠️ {{ pkmErrors.reviewerProg }}</div>
          <div v-else-if="pkmReviewerProg.length === 0" class="text-xs text-gray-400">Tidak ada data progres reviewer.</div>
          <div v-else class="space-y-3">
            <div v-for="rev in pkmReviewerProg" :key="rev.reviewer" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ rev.reviewer }}</span>
                <span>{{ rev.count }} Berkas ({{ rev.progress }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full" :style="{ width: rev.progress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';

const authStore = useAuthStore();

const loading = ref(true);
const errorMsg = ref('');
const pkmData = ref({});
const pkmStatusDist = ref([]);
const pkmReviewerProg = ref([]);
const pkmAnnualTrend = ref([]);
const pkmSchemeDist = ref([]);
const pkmErrors = ref({});

// Pagination States
const currentPage = ref(1);
const perPage = ref(10);

const paginatedScoreboard = computed(() => {
  const list = pkmData.value.scoreboardJurusan || [];
  const start = (currentPage.value - 1) * perPage.value;
  return list.slice(start, start + perPage.value);
});

const totalPages = computed(() => {
  const list = pkmData.value.scoreboardJurusan || [];
  return Math.ceil(list.length / perPage.value) || 1;
});

const startIndex = computed(() => {
  return (currentPage.value - 1) * perPage.value;
});

const endIndex = computed(() => {
  return startIndex.value + perPage.value;
});

watch(perPage, () => {
  currentPage.value = 1;
});

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function getPercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function parseStatusDistribution(data) {
  const dist = data?.distribution;
  if (!dist) return [];
  
  const statuses = ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'REVISION'];
  return statuses.map(status => {
    let count = 0;
    let percent = 0;
    
    const val = dist[status];
    if (val !== undefined && val !== null) {
      if (typeof val === 'object') {
        count = val.count || 0;
        percent = val.percent || 0;
      } else {
        count = val;
        const camelStatus = status.charAt(0) + status.slice(1).toLowerCase();
        const percentKey = 'percent' + camelStatus;
        percent = dist[percentKey] || 0;
      }
    }
    
    const labels = {
      PENDING: 'Pending',
      REVIEWED: 'Reviewed',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      REVISION: 'Revision'
    };
    
    return {
      status: labels[status] || status,
      count,
      percent
    };
  });
}

async function loadPkmData() {
  loading.value = true;
  errorMsg.value = '';
  pkmErrors.value = {};

  const promises = [];

  // KPI summary is fetched for all roles in PKM page
  promises.push(
    api.get('/dashboard/analytics/pkm/kpi-summary')
      .then(res => {
        pkmData.value = {
          kpi: res.data?.data || {},
          scoreboardJurusan: res.data?.data?.scoreboardJurusan || null
        };
      })
      .catch(err => {
        pkmErrors.value.kpi = err.response?.data?.message || err.message || 'Gagal memuat ringkasan KPI PKM';
      })
  );

  if (authStore.user?.role === 'STAFF') {
    promises.push(
      api.get('/dashboard/analytics/pkm/status-distribution')
        .then(res => {
          pkmStatusDist.value = parseStatusDistribution(res.data?.data || res.data);
        })
        .catch(err => {
          pkmErrors.value.statusDist = err.response?.data?.message || err.message || 'Gagal memuat distribusi status PKM';
        })
    );
    promises.push(
      api.get('/dashboard/analytics/pkm/reviewer-progress')
        .then(res => {
          pkmReviewerProg.value = (res.data?.data || []).map(r => ({
            reviewer: r.reviewerName || r.reviewer || 'Unknown Reviewer',
            count: r.totalReviewed !== undefined ? r.totalReviewed : (r.count || 0),
            totalAssigned: r.totalAssigned || 0,
            progress: r.progressPercent !== undefined ? r.progressPercent : (r.progress || 0)
          }));
        })
        .catch(err => {
          pkmErrors.value.reviewerProg = err.response?.data?.message || err.message || 'Gagal memuat progres reviewer PKM';
        })
    );
  } else if (authStore.user?.role === 'KLI') {
    promises.push(
      api.get('/dashboard/analytics/pkm/distribution-jurusan-skema')
        .then(res => {
          const matrix = res.data?.data?.matrix || res.data?.matrix || [];
          const schemeMap = {};
          matrix.forEach(row => {
            if (row.perSkema) {
              Object.entries(row.perSkema).forEach(([scheme, count]) => {
                schemeMap[scheme] = (schemeMap[scheme] || 0) + count;
              });
            }
          });
          pkmSchemeDist.value = Object.entries(schemeMap).map(([scheme, count]) => ({ scheme, count }));
        })
        .catch(err => {
          pkmErrors.value.schemeDist = err.response?.data?.message || err.message || 'Gagal memuat sebaran skema PKM';
        })
    );
    promises.push(
      api.get('/dashboard/analytics/pkm/trend-tahunan')
        .then(res => {
          pkmAnnualTrend.value = (res.data?.data || []).map(item => ({
            year: item.tahun || 0,
            count: item.totalProposal || 0
          }));
        })
        .catch(err => {
          pkmErrors.value.annualTrend = err.response?.data?.message || err.message || 'Gagal memuat tren tahunan PKM';
        })
    );
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    console.error('Error loading PKM details:', err);
    errorMsg.value = 'Terjadi kesalahan saat memuat analitis PKM.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPkmData();
});
</script>
