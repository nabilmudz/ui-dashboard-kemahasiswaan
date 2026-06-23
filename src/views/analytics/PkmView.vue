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
        <div v-if="pkmData.totalProposalMasuk" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Proposal Masuk</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ pkmData.totalProposalMasuk }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Lolos Seleksi</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ pkmData.totalLolosSeleksi }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Didanai (Approved)</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">{{ pkmData.totalDidanai }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Rasio Kelulusan</p>
            <p class="text-2xl font-bold text-brand-orange mt-1">{{ pkmData.successRatePercent }}%</p>
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
                <tr v-for="row in pkmData.scoreboardJurusan" :key="row.jurusan" class="hover:bg-gray-50/50">
                  <td class="py-3 px-4 text-center font-bold text-brand-orange">#{{ row.rank }}</td>
                  <td class="py-3 px-4 font-semibold text-gray-900">{{ row.jurusan }}</td>
                  <td class="py-3 px-4 text-center font-medium text-gray-600">{{ row.totalProposal }}</td>
                  <td class="py-3 px-4 text-center font-bold text-emerald-600">{{ row.totalApproved }}</td>
                  <td class="py-3 px-4 text-center font-bold text-gray-800">{{ row.scorePoint }}</td>
                </tr>
              </tbody>
            </table>
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
                <div class="bg-indigo-500 h-full" :style="{ width: getPercentage(sc.count, pkmData?.totalProposalMasuk || 210) + '%' }"></div>
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
                <div class="bg-brand-orange h-full rounded-lg flex items-center pl-2" :style="{ width: getPercentage(t.count, pkmData?.totalProposalMasuk || 250) + '%' }">
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
          <div v-else-if="pkmStatusDistList.length === 0" class="text-xs text-gray-400">Tidak ada data status distribusi.</div>
          <div v-else class="space-y-3">
            <div v-for="st in pkmStatusDistList" :key="st.status" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ st.status }}</span>
                <span>{{ st.count }} Tim ({{ st.percent }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="h-full" :class="st.status === 'APPROVED' ? 'bg-emerald-500' : st.status === 'PENDING' ? 'bg-amber-500' : st.status === 'REVISION' ? 'bg-indigo-500' : 'bg-red-500'" :style="{ width: st.percent + '%' }"></div>
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
            <div v-for="rev in pkmReviewerProg" :key="rev.reviewerId" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ rev.reviewerName }}</span>
                <span>{{ rev.totalReviewed }} Berkas ({{ rev.progressPercent }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full" :style="{ width: rev.progressPercent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
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
const pkmData = ref({});
const pkmStatusDist = ref([]);
const pkmReviewerProg = ref([]);
const pkmAnnualTrend = ref([]);
const pkmSchemeDist = ref([]);
const pkmErrors = ref({});

const pkmStatusDistList = computed(() => {
  const dist = pkmStatusDist.value?.distribution;
  if (!dist) return [];
  const pct = (k) => dist['percent' + k[0] + k.slice(1).toLowerCase()] || 0;
  return ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED', 'REVISION']
    .filter(k => dist[k] !== undefined)
    .map(k => ({ status: k, count: dist[k], percent: pct(k) }));
});

function getPercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

async function loadPkmData() {
  loading.value = true;
  errorMsg.value = '';
  pkmErrors.value = {};

  const promises = [];

  // KPI summary is fetched for WD3 only
  if (authStore.user?.role === 'WD3') {
    promises.push(
      api.get('/api/v1/dashboard/analytics/pkm/kpi-summary')
        .then(res => {
          pkmData.value = res.data?.data || res.data || {};
        })
        .catch(err => {
          pkmErrors.value.kpi = err.response?.data?.message || err.message || 'Gagal memuat ringkasan KPI PKM';
        })
    );
  }

  if (authStore.user?.role === 'STAFF') {
    promises.push(
      api.get('/api/v1/dashboard/analytics/pkm/status-distribution')
        .then(res => {
          pkmStatusDist.value = res.data?.data || res.data || [];
        })
        .catch(err => {
          pkmErrors.value.statusDist = err.response?.data?.message || err.message || 'Gagal memuat distribusi status PKM';
        })
    );
    promises.push(
      api.get('/api/v1/dashboard/analytics/pkm/reviewer-progress')
        .then(res => {
          pkmReviewerProg.value = res.data?.data || res.data || [];
        })
        .catch(err => {
          pkmErrors.value.reviewerProg = err.response?.data?.message || err.message || 'Gagal memuat progres reviewer PKM';
        })
    );
  } else if (authStore.user?.role === 'KLI') {
    promises.push(
      api.get('/api/v1/dashboard/analytics/pkm/distribution-jurusan-skema')
        .then(res => {
          pkmSchemeDist.value = res.data?.data || res.data || [];
        })
        .catch(err => {
          pkmErrors.value.schemeDist = err.response?.data?.message || err.message || 'Gagal memuat sebaran skema PKM';
        })
    );
    promises.push(
      api.get('/api/v1/dashboard/analytics/pkm/trend-tahunan')
        .then(res => {
          pkmAnnualTrend.value = res.data?.data || res.data || [];
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
