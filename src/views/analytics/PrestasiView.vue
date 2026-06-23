<template>
  <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
    <!-- Loader -->
    <div v-if="loading" class="p-12 text-center flex flex-col items-center justify-center">
      <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs text-gray-400 font-medium">Memuat data Prestasi...</p>
    </div>

    <!-- Main Error Alert -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <div>
        <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Kompetisi & Prestasi</h3>
        <p class="text-xs text-gray-500 mt-0.5">Analisis konversi usulan lapor kompetisi menjadi prestasi berpoin IKU.</p>
      </div>

      <!-- Inline Alert for Prestasi errors -->
      <div v-if="prestasiErrors.rate" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
        <i class="fa-solid fa-circle-exclamation text-sm"></i>
        <span>{{ prestasiErrors.rate }}</span>
      </div>

      <!-- WD3 View: Success rate & IKU Skala Lomba -->
      <div v-if="authStore.user?.role === 'WD3'" class="space-y-6">
        <div v-if="prestasiData" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
            <span class="text-[9px] uppercase font-bold text-gray-400">Total Pengajuan</span>
            <span class="text-2xl font-bold text-gray-900 mt-2">{{ prestasiData.totalPengajuan }}</span>
          </div>
          <div class="bg-gray-50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
            <span class="text-[9px] uppercase font-bold text-gray-400">Total Prestasi Dicapai</span>
            <span class="text-2xl font-bold text-emerald-600 mt-2">{{ prestasiData.totalJadiPrestasi }}</span>
          </div>
          <div class="bg-gray-50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
            <span class="text-[9px] uppercase font-bold text-gray-400">Conversion Rate</span>
            <span class="text-2xl font-bold text-brand-orange mt-2">{{ prestasiData.successRatePercent }}%</span>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Tingkat Prestasi per Skala Lomba (IKU)</h4>
          <div v-if="prestasiErrors.iku" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ prestasiErrors.iku }}</div>
          <div v-else-if="!prestasiIkuTrend.data || prestasiIkuTrend.data.length === 0" class="text-xs text-gray-400">Tidak ada data tren IKU.</div>
          <div v-else class="overflow-x-auto rounded-xl border border-gray-100/70">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="py-3 px-4 font-bold text-gray-700">Tahun</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Internasional</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Nasional</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Regional</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Lokal</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Total Poin IKU</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="row in prestasiIkuTrend.data" :key="row.tahun" class="hover:bg-gray-50/50">
                  <td class="py-3 px-4 font-semibold text-gray-900 tracking-wide">{{ row.tahun }}</td>
                  <td class="py-3 px-4 text-center font-semibold text-indigo-600">{{ row.perSkala?.INTERNASIONAL || 0 }} Poin</td>
                  <td class="py-3 px-4 text-center font-semibold text-indigo-600">{{ row.perSkala?.NASIONAL || 0 }} Poin</td>
                  <td class="py-3 px-4 text-center font-semibold text-indigo-600">{{ row.perSkala?.REGIONAL || 0 }} Poin</td>
                  <td class="py-3 px-4 text-center font-semibold text-indigo-600">{{ row.perSkala?.LOKAL || 0 }} Poin</td>
                  <td class="py-3 px-4 text-center font-bold text-brand-orange">{{ row.totalIkuPoin }} Poin IKU</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- KLI View: Peta minat & LPJ audit -->
      <div v-else-if="authStore.user?.role === 'KLI'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Peta Minat Kategori -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Peta Persebaran Minat Kategori Kompetisi</h4>
          <div v-if="prestasiErrors.kategori" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ prestasiErrors.kategori }}</div>
          <div v-else-if="!prestasiInterestDist.data || prestasiInterestDist.data.length === 0" class="text-xs text-gray-400">Tidak ada data sebaran minat.</div>
          <div v-else class="space-y-3">
            <div v-for="int in prestasiInterestDist.data" :key="int.kategori" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ int.kategori }}</span>
                <span>{{ int.jumlah }} Usulan ({{ int.percent }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full" :style="{ width: int.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- LPJ Audit (Rasio Gagal Tanding) -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Rasio "Gagal Tanding" (Dana Cair Tanpa LPJ)</h4>
          <div v-if="prestasiErrors.lpj" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ prestasiErrors.lpj }}</div>
          <div v-else class="grid grid-cols-1 gap-4">
            <div class="flex justify-between items-center p-3 bg-white rounded-xl">
              <span class="text-xs text-gray-500 font-semibold">Total Tim Didanai Berangkat:</span>
              <span class="font-bold text-gray-900 text-sm">{{ prestasiGagalTanding?.totalDanaCair ?? 0 }} Tim</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-white rounded-xl">
              <span class="text-xs text-gray-500 font-semibold">Belum Menyusun Berkas LPJ (>1 bulan):</span>
              <span class="font-bold text-red-650 text-sm">{{ prestasiGagalTanding?.totalTanpaLpj ?? 0 }} Tim</span>
            </div>
            <div class="p-3 bg-red-50/50 rounded-xl">
              <div class="flex justify-between text-xs font-bold text-red-800 mb-1">
                <span>Persentase Gagal LPJ / Gagal Tanding:</span>
                <span>{{ prestasiGagalTanding?.rasioGagalTandingPercent ?? 0 }}%</span>
              </div>
              <div class="w-full bg-red-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-red-500 h-full" :style="{ width: (prestasiGagalTanding?.rasioGagalTandingPercent ?? 0) + '%' }"></div>
              </div>
            </div>

            <!-- Overdue teams listing -->
            <div v-if="prestasiGagalTanding?.detail && prestasiGagalTanding.detail.length > 0" class="mt-3 text-[10px] text-gray-500 space-y-1">
              <p class="font-bold text-red-650">Daftar Tim Menunggak LPJ:</p>
              <div v-for="team in prestasiGagalTanding.detail" :key="team.submissionId" class="flex justify-between border-b border-gray-100 pb-1">
                <span>{{ team.namaTim }} (Cair: {{ formatDate(team.danaCairAt) }})</span>
                <span class="font-bold text-red-600">{{ team.hariSejakDanaCair }} Hari Overdue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Staff View: Lead time & Revision rate -->
      <div v-else-if="authStore.user?.role === 'STAFF'" class="grid grid-cols-1 md:grid-cols-2 gap-4 border-0">
        <div class="bg-gray-50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
          <div>
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Waktu Rata-rata Pemrosesan Berkas (Lead Time)</span>
            <div v-if="prestasiErrors.leadTime" class="text-xs text-red-500 font-semibold mt-2">⚠️ {{ prestasiErrors.leadTime }}</div>
            <div v-else class="mt-4">
              <span class="text-4xl font-bold text-gray-900">
                {{ prestasiLeadTime ? (prestasiLeadTime.avgLeadTimeHours / 24).toFixed(1) : '-' }} Hari
              </span>
              <p class="text-[10px] text-gray-400 font-semibold mt-1">
                Rata-rata {{ prestasiLeadTime?.avgLeadTimeHours || '-' }} jam. Kecepatan verifikasi dari lapor masuk hingga ACC.
              </p>
            </div>
          </div>

          <!-- Lead Time by stage details -->
          <div v-if="prestasiLeadTime?.leadTimeByStage" class="mt-4 text-[10px] text-gray-500 space-y-1.5 border-t border-gray-100 pt-3">
            <p class="font-semibold text-gray-700">Lead Time Per Tahap Pemrosesan:</p>
            <div v-for="stg in prestasiLeadTime.leadTimeByStage" :key="stg.stage" class="flex justify-between">
              <span>{{ stg.stage }}</span>
              <span class="font-bold text-gray-800">{{ stg.avgHours }} Jam</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Tingkat Berkas Cacat (Revision Rate)</span>
          <div v-if="prestasiErrors.leadTime" class="text-xs text-red-500 font-semibold mt-2">⚠️ {{ prestasiErrors.leadTime }}</div>
          <div v-else class="mt-4">
            <span class="text-4xl font-bold text-brand-orange">{{ prestasiLeadTime?.revisionRatePercent ?? 0 }}%</span>
            <div class="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div class="bg-brand-orange h-full" :style="{ width: (prestasiLeadTime?.revisionRatePercent ?? 0) + '%' }"></div>
            </div>
            <p class="text-[10px] text-gray-400 font-semibold mt-2">Rasio berkas dikembalikan ke mahasiswa untuk direvisi</p>
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
const prestasiData = ref(null);
const prestasiIkuTrend = ref([]);
const prestasiInterestDist = ref([]);
const prestasiGagalTanding = ref(null);
const prestasiLeadTime = ref(null);
const prestasiErrors = ref({});

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

async function loadPrestasiData() {
  loading.value = true;
  errorMsg.value = '';
  prestasiErrors.value = {};

  const promises = [];

  // Default success-rate is fetched for all roles in Prestasi tab
  promises.push(
    api.get('/dashboard/analytics/prestasi/success-rate')
      .then(res => {
        prestasiData.value = res.data || null;
      })
      .catch(err => {
        prestasiErrors.value.rate = err.response?.data?.message || err.message || 'Gagal memuat success rate prestasi';
      })
  );

  if (authStore.user?.role === 'WD3') {
    promises.push(
      api.get('/dashboard/analytics/prestasi/tren-iku')
        .then(res => {
          prestasiIkuTrend.value = res.data?.data || res.data || [];
        })
        .catch(err => {
          prestasiErrors.value.iku = err.response?.data?.message || err.message || 'Gagal memuat tren IKU prestasi';
        })
    );
  } else if (authStore.user?.role === 'KLI') {
    promises.push(
      api.get('/dashboard/analytics/prestasi/sebaran-kategori')
        .then(res => {
          prestasiInterestDist.value = res.data?.data || res.data || [];
        })
        .catch(err => {
          prestasiErrors.value.kategori = err.response?.data?.message || err.message || 'Gagal memuat sebaran minat prestasi';
        })
    );
    promises.push(
      api.get('/dashboard/analytics/prestasi/rasio-gagal-tanding')
        .then(res => {
          prestasiGagalTanding.value = res.data || null;
        })
        .catch(err => {
          prestasiErrors.value.lpj = err.response?.data?.message || err.message || 'Gagal memuat audit LPJ';
        })
    );
  } else if (authStore.user?.role === 'STAFF') {
    promises.push(
      api.get('/dashboard/analytics/prestasi/lead-time-revision')
        .then(res => {
          prestasiLeadTime.value = res.data || null;
        })
        .catch(err => {
          prestasiErrors.value.leadTime = err.response?.data?.message || err.message || 'Gagal memuat pemrosesan berkas';
        })
    );
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    console.error('Error loading Prestasi details:', err);
    errorMsg.value = 'Terjadi kesalahan saat memuat data Prestasi.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPrestasiData();
});
</script>
