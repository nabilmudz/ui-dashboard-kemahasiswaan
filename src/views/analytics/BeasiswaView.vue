<template>
  <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
    <!-- Loader -->
    <div v-if="loading" class="p-12 text-center flex flex-col items-center justify-center">
      <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs text-gray-400 font-medium">Memuat data Beasiswa...</p>
    </div>

    <!-- Main Error Alert -->
    <div v-else-if="errorMsg"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <div>
        <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Proposal Beasiswa</h3>
        <p class="text-xs text-gray-500 mt-0.5">Monitoring sebaran proposal, tipe pendanaan, dan antrean verifikasi
          berkas.</p>
      </div>

      <!-- Inline Alerts for Beasiswa errors -->
      <div v-if="beasiswaErrors.monitoring"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
        <i class="fa-solid fa-circle-exclamation text-sm"></i>
        <span>{{ beasiswaErrors.monitoring }}</span>
      </div>
      <div v-if="beasiswaErrors.kajur"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
        <i class="fa-solid fa-circle-exclamation text-sm"></i>
        <span>{{ beasiswaErrors.kajur }}</span>
      </div>

      <!-- WD3 View: Submissions Monitoring & Jurusan -->
      <div v-if="authStore.user?.role === 'WD3'" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Pengajuan</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ beasiswaData?.totalPengajuan ?? 0 }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Penerima</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">{{ beasiswaData?.totalDiterima ?? 0 }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rasio Penerimaan</p>
            <p class="text-2xl font-bold text-brand-orange mt-1">{{ beasiswaData?.acceptanceRatePercent ?? 0 }}%</p>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Penerima Beasiswa Berdasarkan
            Jurusan</h4>
          <div v-if="beasiswaErrors.jurusan" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{
            beasiswaErrors.jurusan }}</div>
          <div v-else-if="!beasiswaJurusanDist.data || beasiswaJurusanDist.data.length === 0"
            class="text-xs text-gray-400">Tidak ada data sebaran jurusan.</div>
          <div v-else class="overflow-x-auto rounded-xl border border-gray-100/70">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="py-3 px-4 font-bold text-gray-700">Jurusan</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Jumlah Penerima</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Persentase</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="row in beasiswaJurusanDist.data" :key="row.jurusan" class="hover:bg-gray-50/50">
                  <td class="py-3 px-4 font-semibold text-gray-900">{{ row.jurusan }}</td>
                  <td class="py-3 px-4 text-center font-bold text-gray-850">{{ row.totalPenerima }} Mahasiswa</td>
                  <td class="py-3 px-4 text-center font-bold text-gray-700">{{ row.percent }}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- KLI View: Tipe Pendanaan & Program Aktif -->
      <div v-else-if="authStore.user?.role === 'KLI'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sumber Pendanaan & Tipe Beasiswa -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-6 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Beasiswa Berdasarkan Sumber
            Pendanaan</h4>
          <div v-if="beasiswaErrors.sumber" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.sumber
            }}</div>
          <div v-else-if="!beasiswaFundingDist.bySumberDana || beasiswaFundingDist.bySumberDana.length === 0"
            class="text-xs text-gray-400">Tidak ada data sumber pendanaan.</div>
          <div v-else class="space-y-3">
            <div v-for="fund in beasiswaFundingDist.bySumberDana" :key="fund.sumber" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ fund.sumber }}</span>
                <span>{{ fund.jumlah }} Penerima ({{ fund.percent }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full" :style="{ width: fund.percent + '%' }"></div>
              </div>
            </div>
          </div>

          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide border-t border-gray-100 pt-4">Sebaran
            Berdasarkan Tipe Beasiswa</h4>
          <div v-if="beasiswaErrors.sumber" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.sumber
            }}</div>
          <div v-else-if="!beasiswaFundingDist.byTipe || beasiswaFundingDist.byTipe.length === 0"
            class="text-xs text-gray-400">Tidak ada data tipe beasiswa.</div>
          <div v-else class="space-y-3">
            <div v-for="fund in beasiswaFundingDist.byTipe" :key="fund.tipe" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span>{{ fund.tipe }}</span>
                <span>{{ fund.jumlah }} Penerima ({{ fund.percent }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full" :style="{ width: fund.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Program Aktif -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Program Beasiswa Berjalan & Akan Datang
          </h4>
          <div v-if="beasiswaErrors.sumber" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.sumber
            }}</div>
          <div v-else-if="beasiswaActivePrograms.length === 0" class="text-xs text-gray-400">Tidak ada program beasiswa
            aktif.</div>
          <div v-else class="space-y-3">
            <div v-for="prog in beasiswaActivePrograms" :key="prog.programId"
              class="p-3 bg-white rounded-xl flex justify-between items-center gap-3 border border-gray-100/70">
              <div>
                <p class="font-bold text-gray-900 text-xs m-0">{{ prog.programName }}</p>
                <p class="text-[10px] text-gray-400 font-medium m-0 mt-0.5">
                  <i class="fa-regular fa-calendar mr-1"></i>
                  Linimasa: {{ prog.startDate ? formatDate(prog.startDate) : '-' }} s/d {{ prog.endDate ?
                    formatDate(prog.endDate) : '-' }}
                </p>
              </div>
              <span class="px-2 py-0.5 rounded font-bold text-[8px] uppercase tracking-wide shrink-0"
                :class="prog.status === 'AKAN_DATANG' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'">
                {{ prog.status === 'AKAN_DATANG' ? 'Akan Datang' : 'Berjalan' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Staff View: Status verifikasi & log aktivitas -->
      <div v-else-if="authStore.user?.role === 'STAFF'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Status verifikasi beasiswa -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Monitoring Status Berkas Tahap Verifikasi
          </h4>
          <div v-if="beasiswaErrors.aktivitas" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{
            beasiswaErrors.aktivitas }}</div>
          <div v-else class="space-y-3">
            <div v-for="st in statusTypes" :key="st.key" class="flex flex-col">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span class="flex items-center gap-2">
                  <span class="inline-block w-2.5 h-2.5 rounded-full" :class="st.colorClass"></span>
                  {{ st.label }}
                </span>
                <span>{{ beasiswaVerificationStages[st.key] || 0 }} Berkas</span>
              </div>
              <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300" :class="st.barClass"
                  :style="{ width: getPercentage(beasiswaVerificationStages[st.key] || 0, beasiswaData?.totalPengajuan || 100) + '%' }">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Aktivitas pengajuan beasiswa -->
        <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Tren Pengajuan Baru per Periode</h4>
          <div v-if="beasiswaErrors.aktivitas" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{
            beasiswaErrors.aktivitas }}</div>
          <div v-else-if="beasiswaRecentActivities.length === 0" class="text-xs text-gray-400">Tidak ada riwayat tren
            pengajuan baru.</div>
          <div v-else class="space-y-3">
            <div v-for="act in beasiswaRecentActivities" :key="act.periodLabel"
              class="p-3 bg-white rounded-xl flex justify-between items-center gap-3 border border-gray-100/70">
              <div>
                <p class="font-bold text-gray-900 text-xs m-0">Periode: {{ act.periodLabel }}</p>
                <p class="text-[10px] text-gray-400 font-medium m-0 mt-0.5">Jumlah Pengajuan Baru: <span
                    class="font-semibold text-indigo-600">{{ act.totalPengajuanBaru }} Berkas</span></p>
              </div>
              <span class="text-[9px] font-bold text-gray-400 shrink-0"><i
                  class="fa-regular fa-chart-line mr-1"></i>Tren</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback / General view (WD3/Staff/etc overview) -->
      <div v-else class="space-y-4">
        <div v-if="beasiswaData" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Pengajuan</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ beasiswaData.totalPengajuan }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Diterima</p>
            <p class="text-2xl font-bold text-emerald-600 mt-1">{{ beasiswaData.totalDiterima }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
            <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rasio Penerimaan</p>
            <p class="text-2xl font-bold text-brand-orange mt-1">{{ beasiswaData.acceptanceRatePercent }}%</p>
          </div>
        </div>

        <div v-if="beasiswaData" class="space-y-3">
          <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Performa Program Proposal Aktif</h4>
          <div class="overflow-x-auto rounded-xl border border-gray-100/70">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="py-3 px-4 font-bold text-gray-700">Nama Program</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Pendaftar</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Diterima ACC</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Rasio Sukses</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="prog in beasiswaData.perProgram" :key="prog.programId" class="hover:bg-gray-50/50">
                  <td class="py-3 px-4 font-semibold text-gray-900">{{ prog.programName }}</td>
                  <td class="py-3 px-4 text-center font-medium text-gray-600">{{ prog.totalPengajuan }}</td>
                  <td class="py-3 px-4 text-center font-bold text-emerald-600">{{ prog.totalDiterima }}</td>
                  <td class="py-3 px-4 text-center font-bold text-gray-800">
                    {{ getPercentage(prog.totalDiterima, prog.totalPengajuan) }}%
                  </td>
                </tr>
              </tbody>
            </table>
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
const beasiswaData = ref(null);
const beasiswaKajurData = ref(null);
const beasiswaJurusanDist = ref([]);
const beasiswaFundingDist = ref([]);
const beasiswaActivePrograms = ref([]);
const beasiswaVerificationStages = ref([]);
const beasiswaRecentActivities = ref([]);
const beasiswaErrors = ref({});

const statusTypes = [
  { key: 'PENDING', label: 'Belum Diproses (Pending)', colorClass: 'bg-amber-500', barClass: 'bg-amber-500' },
  { key: 'REVIEWED', label: 'Sedang Direview (Reviewed)', colorClass: 'bg-indigo-500', barClass: 'bg-indigo-500' },
  { key: 'REVISION', label: 'Perlu Revisi (Revision)', colorClass: 'bg-brand-orange', barClass: 'bg-brand-orange' },
  { key: 'REJECTED', label: 'Ditolak (Rejected)', colorClass: 'bg-red-500', barClass: 'bg-red-500' },
  { key: 'APPROVED', label: 'Disetujui / ACC (Approved)', colorClass: 'bg-emerald-500', barClass: 'bg-emerald-500' }
];

function getPercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

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

async function loadBeasiswaData() {
  loading.value = true;
  errorMsg.value = '';
  beasiswaErrors.value = {};

  const promises = [];


  promises.push(
    api.get('/dashboard/analytics/beasiswa/monitoring')
      .then(res => {
        beasiswaData.value = res.data || null;
      })
      .catch(err => {
        beasiswaErrors.value.monitoring = err.response?.data?.message || err.message || 'Gagal memuat monitoring beasiswa';
      })
  );

  if (authStore.user?.role === 'WD3') {
    promises.push(
      api.get('/dashboard/analytics/beasiswa/sebaran-jurusan')
        .then(res => {
          beasiswaJurusanDist.value = res.data || [];
        })
        .catch(err => {
          beasiswaErrors.value.jurusan = err.response?.data?.message || err.message || 'Gagal memuat sebaran jurusan beasiswa';
        })
    );
  } else if (authStore.user?.role === 'KLI') {
    promises.push(
      api.get('/dashboard/analytics/beasiswa/sebaran-tipe-sumber')
        .then(res => {
          beasiswaFundingDist.value = res.data?.fundingDistribution || res.data?.data || res.data || [];
          beasiswaActivePrograms.value = res.data?.activePrograms || [];
        })
        .catch(err => {
          beasiswaErrors.value.sumber = err.response?.data?.message || err.message || 'Gagal memuat tipe sumber beasiswa';
        })
    );
  } else if (authStore.user?.role === 'STAFF') {
    promises.push(
      api.get('/dashboard/analytics/beasiswa/status-aktivitas')
        .then(res => {
          beasiswaVerificationStages.value = res.data?.verificationStages || [];
          beasiswaRecentActivities.value = res.data?.recentActivities || [];
        })
        .catch(err => {
          beasiswaErrors.value.aktivitas = err.response?.data?.message || err.message || 'Gagal memuat status aktivitas beasiswa';
        })
    );
  }

  try {
    await Promise.all(promises);
  } catch (err) {
    console.error('Error loading Beasiswa details:', err);
    errorMsg.value = 'Terjadi kesalahan saat memuat data Beasiswa.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadBeasiswaData();
});
</script>
