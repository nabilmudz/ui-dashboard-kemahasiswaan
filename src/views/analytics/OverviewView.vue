<template>
  <div>
    <!-- Main Loader -->
    <div v-if="loading"
      class="bg-white rounded-2xl p-12 border border-gray-100/70 shadow-none text-center flex flex-col items-center justify-center">
      <div class="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-xs text-gray-500 font-semibold">Memuat data dasbor...</p>
    </div>

    <!-- Error Alert -->
    <div v-else-if="errorMsg"
      class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <div v-else>
      <!-- =================================== -->
      <!-- 1. MAHASISWA DASHBOARD -->
      <!-- =================================== -->
      <template v-if="isMahasiswa">
        <!-- Submissions Status Highlights -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Total Card -->
          <div class="bg-white p-5 rounded-2xl border border-gray-100/70 shadow-none flex flex-col justify-between">
            <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Pengajuan</span>
            <span class="text-3xl font-bold text-gray-900 mt-2">{{ mySubmissions.length }}</span>
            <span class="text-[10px] text-gray-500 mt-1 font-medium">Dokumen diajukan</span>
          </div>

          <!-- Unaccepted (Belum Diterima) Percentage Card -->
          <div
            class="bg-white p-5 rounded-2xl border border-gray-100/70 shadow-none flex flex-col justify-between col-span-1 md:col-span-2">
            <div class="flex justify-between items-start">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Persentase Belum
                Disetujui</span>
              <span
                class="px-2 py-0.5 rounded-full font-bold text-[9px] bg-brand-orange/10 text-brand-orange uppercase tracking-wide">
                {{ unacceptedCount }} / {{ mySubmissions.length }} Dokumen
              </span>
            </div>

            <div class="mt-4">
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-bold text-gray-900">{{ unacceptedPercentage }}%</span>
                <span class="text-[11px] text-gray-500 font-medium">belum disetujui</span>
              </div>
              <!-- Flat Progress Bar -->
              <div class="w-full bg-gray-100 h-2.5 rounded-full mt-3 overflow-hidden">
                <div class="bg-brand-orange h-full rounded-full transition-all duration-500"
                  :style="{ width: unacceptedPercentage + '%' }"></div>
              </div>
            </div>
            <span class="text-[9px] text-gray-400 mt-2 block font-medium">Akumulasi status PENDING, REVIEWED, REVISION &
              REJECTED</span>
          </div>

          <!-- Approved Count Card -->
          <div class="bg-white p-5 rounded-2xl border border-gray-100/70 shadow-none flex flex-col justify-between">
            <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Disetujui (Approved)</span>
            <span class="text-3xl font-bold text-emerald-600 mt-2">{{ statusCounts.APPROVED || 0 }}</span>
            <span class="text-[10px] text-emerald-500 mt-1 font-semibold">
              {{ approvedPercentage }}% dari total
            </span>
          </div>

          <!-- Pending/Revision Alert Card -->
          <div class="bg-white p-5 rounded-2xl border border-gray-100/70 shadow-none flex flex-col justify-between">
            <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Butuh Tindakan</span>
            <span class="text-3xl font-bold mt-2"
              :class="(statusCounts.REVISION || 0) > 0 ? 'text-brand-orange' : 'text-gray-950'">
              {{ statusCounts.REVISION || 0 }}
            </span>
            <span class="text-[10px] text-gray-500 mt-1 font-medium">
              Dokumen perlu direvisi
            </span>
          </div>
        </div>

        <!-- Breakdown Statistics (Progress bars) -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100/70 shadow-none mt-4">
          <p class="font-bold text-sm text-gray-900 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3">Rincian
            Status Pengajuan</p>
          <div class="space-y-4">
            <div v-for="st in statusTypes" :key="st.key">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span class="flex items-center gap-2">
                  <span class="inline-block w-2.5 h-2.5 rounded-full" :class="st.colorClass"></span>
                  {{ st.label }}
                </span>
                <span>{{ statusCounts[st.key] || 0 }} ({{ getPercentage(statusCounts[st.key] || 0, mySubmissions.length)
                  }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300" :class="st.barClass"
                  :style="{ width: getPercentage(statusCounts[st.key] || 0, mySubmissions.length) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Submissions Table -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100/70 shadow-none mt-4">
          <p class="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Daftar Pengajuan Terbaru</p>
          <div class="overflow-x-auto rounded-xl">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-100">
                  <th class="py-3 px-4 font-bold text-gray-700">Sub-Aplikasi</th>
                  <th class="py-3 px-4 font-bold text-gray-700">Judul Pengajuan</th>
                  <th class="py-3 px-4 font-bold text-gray-700">Tgl Kirim</th>
                  <th class="py-3 px-4 font-bold text-gray-700">Tahap Terakhir</th>
                  <th class="py-3 px-4 font-bold text-gray-700">Status</th>
                  <th class="py-3 px-4 font-bold text-gray-700 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="mySubmissions.length === 0">
                  <td colspan="6" class="py-6 text-center text-gray-400 font-semibold">Anda belum memiliki riwayat
                    pengajuan.</td>
                </tr>
                <tr v-for="sub in mySubmissions" :key="sub.submissionId" class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 px-4">
                    <span
                      class="px-2 py-0.5 rounded font-bold text-[9px] bg-slate-100 text-slate-700 uppercase tracking-wide">{{
                      sub.appSource }}</span>
                  </td>
                  <td class="py-3 px-4 font-semibold text-gray-955">{{ sub.title }}</td>
                  <td class="py-3 px-4 text-gray-500 font-medium">{{ formatDate(sub.submittedAt) }}</td>
                  <td class="py-3 px-4 text-gray-600 font-medium">{{ sub.currentStage || '-' }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide"
                      :class="getStatusBadgeClass(sub.status)">
                      {{ sub.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <a :href="sub.deepLinkUrl" target="_blank"
                      class="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-white bg-brand-orange rounded hover:bg-brand-orange/90 transition-colors no-underline">
                      <i class="fa-regular fa-up-right-from-square"></i> Detail
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <!-- =================================== -->
      <!-- 2. ADMINISTRATIVE STAFF / LEADERSHIP OVERVIEW -->
      <!-- =================================== -->
      <template v-else>
        <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
          <div class="space-y-6">
            <div class="mb-4">
              <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Ringkasan Statistik Permintaan</h3>
              <p class="text-xs text-gray-500 mt-0.5">Pemantauan cepat metrik keberhasilan dan jumlah pengajuan dari
                berbagai modul layanan.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- 1. Card Pending Proposals -->
              <div class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Antrean Pending</span>
                    <i class="fa-solid fa-list-check text-brand-orange text-sm"></i>
                  </div>
                  <span class="text-3xl font-bold text-gray-955 block mt-2">{{ pendingProposals.length }}</span>
                  <span class="text-[10px] text-gray-500 mt-1 block font-medium">Berkas memerlukan persetujuan</span>
                </div>
                <router-link to="/analytics/proposals"
                  class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-brand-orange rounded-xl border border-gray-100 transition-colors no-underline block">
                  Buka Detail Antrean <i class="fa-solid fa-chevron-right ml-1"></i>
                </router-link>
              </div>

              <!-- 2. Card PKM Statistics (if allowed) -->
              <div v-if="allowedAppSources.includes('PKM') && isAdmin"
                class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Program Kreativitas
                      Mahasiswa (PKM)</span>
                    <i class="fa-solid fa-lightbulb text-amber-500 text-sm"></i>
                  </div>
                  <div class="flex justify-between items-baseline mt-2">
                    <span class="text-3xl font-bold text-gray-955">{{ pkmData.kpi?.totalProposalMasuk !== undefined ?
                      pkmData.kpi.totalProposalMasuk : 'N/A' }}</span>
                    <span class="text-xs font-bold text-brand-orange">{{ pkmData.kpi?.successRatePercent !== undefined ?
                      pkmData.kpi.successRatePercent + '%' : 'N/A' }} Success Rate</span>
                  </div>
                  <span class="text-[10px] text-gray-500 mt-1 block font-medium">Total proposal terdaftar di
                    sistem</span>
                </div>
                <router-link to="/analytics/pkm"
                  class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block">
                  Buka Detail PKM <i class="fa-solid fa-chevron-right ml-1"></i>
                </router-link>
              </div>

              <!-- 3. Card PMW Statistics (if allowed) -->
              <div v-if="allowedAppSources.includes('PMW') && isAdmin"
                class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Program Mahasiswa
                      Wirausaha (PMW)</span>
                    <i class="fa-solid fa-briefcase text-blue-500 text-sm"></i>
                  </div>
                  <div class="flex justify-between items-baseline mt-2">
                    <span class="text-3xl font-bold text-gray-955">{{ pmwGraduationRatio?.totalPartisipasi !== undefined
                      ? pmwGraduationRatio.totalPartisipasi : 'N/A' }}</span>
                    <span class="text-xs font-bold text-emerald-600">{{ pmwGraduationRatio?.ratePercent !== undefined ?
                      pmwGraduationRatio.ratePercent + '%' : 'N/A' }} Lolos</span>
                  </div>
                  <span class="text-[10px] text-gray-500 mt-1 block font-medium">Total partisipasi tim wirausaha</span>
                </div>
                <router-link to="/analytics/pmw"
                  class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block">
                  Buka Detail PMW <i class="fa-solid fa-chevron-right ml-1"></i>
                </router-link>
              </div>

              <!-- 4. Card Beasiswa (if allowed) -->
              <div v-if="allowedAppSources.includes('BEASISWA') && isAdmin"
                class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Proposal Beasiswa</span>
                    <i class="fa-solid fa-file-signature text-emerald-500 text-sm"></i>
                  </div>
                  <div class="flex justify-between items-baseline mt-2">
                    <span class="text-3xl font-bold text-gray-955">{{ beasiswaData?.totalPengajuan ?? 'N/A' }}</span>
                    <span class="text-xs font-bold text-brand-orange">{{ beasiswaData?.acceptanceRatePercent !==
                      undefined ? beasiswaData.acceptanceRatePercent + '%' : 'N/A' }} Penerimaan</span>
                  </div>
                  <span class="text-[10px] text-gray-500 mt-1 block font-medium">Total berkas usulan beasiswa
                    mahasiswa</span>
                </div>
                <router-link to="/analytics/beasiswa"
                  class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block">
                  Buka Detail Proposal <i class="fa-solid fa-chevron-right ml-1"></i>
                </router-link>
              </div>

              <!-- 5. Card Prestasi (if allowed) -->
              <div v-if="allowedAppSources.includes('PRESTASI') && isAdmin"
                class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lapor Kompetisi &
                      Prestasi</span>
                    <i class="fa-solid fa-trophy text-pink-500 text-sm"></i>
                  </div>
                  <div class="flex justify-between items-baseline mt-2">
                    <span class="text-3xl font-bold text-gray-955">{{ prestasiData?.totalPengajuan ?? 'N/A' }}</span>
                    <span class="text-xs font-bold text-emerald-600">{{ prestasiData?.successRatePercent !== undefined ?
                      prestasiData.successRatePercent + '%' : 'N/A' }} Konversi</span>
                  </div>
                  <span class="text-[10px] text-gray-500 mt-1 block font-medium">Laporan usulan prestasi
                    disetujui</span>
                </div>
                <router-link to="/analytics/prestasi"
                  class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block">
                  Buka Detail Prestasi <i class="fa-solid fa-chevron-right ml-1"></i>
                </router-link>
              </div>

              <!-- 6. Card Sarpras (if allowed) -->
              <div v-if="allowedAppSources.includes('SARPRAS') && isAdmin"
                class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                <div>
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rekap & Peminjaman
                      Sarpras</span>
                    <i class="fa-solid fa-door-open text-indigo-500 text-sm"></i>
                  </div>
                  <div class="flex justify-between items-baseline mt-2">
                    <span class="text-3xl font-bold text-gray-955">{{ ormawaRecaps?.length ?? 0 }}</span>
                    <span class="text-xs font-bold text-gray-600">{{ approvedVenues?.length ?? 0 }} Venue Terisi</span>
                  </div>
                  <span class="text-[10px] text-gray-500 mt-1 block font-medium">Rekapitulasi Ormawa & Okupansi
                    Tempat</span>
                </div>
                <router-link to="/analytics/venues"
                  class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block">
                  Buka Okupansi Venue <i class="fa-solid fa-chevron-right ml-1"></i>
                </router-link>
              </div>
            </div>

            <!-- Rekap Ormawa Table (Visible only to Admins who have access to SARPRAS) -->
            <div v-if="allowedAppSources.includes('SARPRAS') && isAdmin" class="border-t border-gray-100 pt-6 mt-6 space-y-4">
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
                    <tr v-if="filteredRecap.length === 0">
                      <td colspan="8" class="py-6 text-center text-gray-400 font-semibold">Tidak ada data rekap Ormawa yang sesuai.</td>
                    </tr>
                    <tr v-for="item in filteredRecap" :key="item.ormawaNpa" class="hover:bg-gray-50/50 transition-colors">
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
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';

const authStore = useAuthStore();

// Role determinations
const isMahasiswa = computed(() => authStore.user?.role === 'MAHASISWA');
const isAdmin = computed(() => ['STAFF', 'WD3', 'KLI'].includes(authStore.user?.role));

// List of allowed AppSources
const allowedAppSources = computed(() => {
  return (authStore.user?.accessibleApps || []).map(app => {
    return typeof app === 'string' ? app : app.appSource;
  });
});

const loading = ref(true);
const errorMsg = ref('');

// Data Containers
const mySubmissions = ref([]);
const pendingProposals = ref([]);
const ormawaRecaps = ref([]);
const recapSearch = ref('');
const recapPeriod = ref('');

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
const approvedVenues = ref([]);
const pkmData = ref({});
const pmwData = ref({});
const pmwGraduationRatio = ref(null);
const beasiswaData = ref(null);
const beasiswaKajurData = ref(null);
const prestasiData = ref(null);

const statusTypes = [
  { key: 'PENDING', label: 'Belum Diproses (Pending)', colorClass: 'bg-amber-500', barClass: 'bg-amber-500' },
  { key: 'REVIEWED', label: 'Sedang Direview (Reviewed)', colorClass: 'bg-indigo-500', barClass: 'bg-indigo-500' },
  { key: 'REVISION', label: 'Perlu Revisi (Revision)', colorClass: 'bg-brand-orange', barClass: 'bg-brand-orange' },
  { key: 'REJECTED', label: 'Ditolak (Rejected)', colorClass: 'bg-red-500', barClass: 'bg-red-500' },
  { key: 'APPROVED', label: 'Disetujui / ACC (Approved)', colorClass: 'bg-emerald-500', barClass: 'bg-emerald-500' }
];

// Computed calculations: Mahasiswa
const statusCounts = computed(() => {
  const counts = {};
  mySubmissions.value.forEach(sub => {
    counts[sub.status] = (counts[sub.status] || 0) + 1;
  });
  return counts;
});

const unacceptedCount = computed(() => {
  return mySubmissions.value.filter(sub => ['PENDING', 'REVIEWED', 'REVISION', 'REJECTED'].includes(sub.status)).length;
});

const unacceptedPercentage = computed(() => {
  if (mySubmissions.value.length === 0) return 0;
  return Math.round((unacceptedCount.value / mySubmissions.value.length) * 100);
});

const approvedPercentage = computed(() => {
  if (mySubmissions.value.length === 0) return 0;
  return Math.round(((statusCounts.value.APPROVED || 0) / mySubmissions.value.length) * 100);
});

// Helpers
function getPercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'PENDING': return 'bg-amber-50 text-amber-600';
    case 'REVIEWED': return 'bg-indigo-50 text-indigo-600';
    case 'REVISION': return 'bg-brand-accent text-brand-orange';
    case 'REJECTED': return 'bg-red-50 text-red-600';
    case 'APPROVED': return 'bg-emerald-50 text-emerald-600';
    default: return 'bg-gray-100 text-gray-600';
  }
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

function formatRupiah(value) {
  if (value === undefined || value === null) return '-';
  return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

async function initDashboard() {
  loading.value = true;
  errorMsg.value = '';
  try {
    if (isMahasiswa.value) {
      const res = await api.get('/dashboard/submissions');
      mySubmissions.value = res.data?.data || [];
    } else {
      const promises = [
        api.get('/dashboard/proposals/pending')
          .then(res => { pendingProposals.value = res.data?.data || []; })
          .catch(err => console.error('Error fetching proposals overview:', err))
      ];

      if (allowedAppSources.value.includes('PKM') && isAdmin.value) {
        promises.push(
          api.get('/dashboard/analytics/pkm/kpi-summary')
            .then(res => {
              pkmData.value = {
                kpi: res.data?.data || {},
                scoreboardJurusan: res.data?.data?.scoreboardJurusan || null
              };
            })
            .catch(err => console.error('Error fetching pkm overview:', err))
        );
      }
      if (allowedAppSources.value.includes('PMW') && isAdmin.value) {
        promises.push(
          api.get('/dashboard/analytics/pmw/dana-per-jurusan')
            .then(res => { pmwData.value = res.data?.data || {}; })
            .catch(err => console.error('Error fetching pmw overview:', err))
        );
        promises.push(
          api.get('/dashboard/analytics/pmw/rasio-kelulusan')
            .then(res => {
              const list = res.data?.data || [];
              const totalPendaftar = list.reduce((sum, item) => sum + (item.totalPendaftar || 0), 0);
              const totalLolos = list.reduce((sum, item) => sum + (item.totalLolos || 0), 0);
              const ratePercent = totalPendaftar > 0 ? Math.round((totalLolos / totalPendaftar) * 100) : 0;
              pmwGraduationRatio.value = {
                totalPartisipasi: totalPendaftar,
                ratePercent: ratePercent,
                data: list
              };
            })
            .catch(err => console.error('Error fetching pmw ratio overview:', err))
        );
      }
      if (allowedAppSources.value.includes('BEASISWA')) {
        promises.push(
          api.get('/dashboard/analytics/beasiswa/monitoring')
            .then(res => { beasiswaData.value = res.data?.data || null; })
            .catch(err => console.error('Error fetching beasiswa overview:', err))
        );
      }
      if (allowedAppSources.value.includes('PRESTASI') && isAdmin.value) {
        promises.push(
          api.get('/dashboard/analytics/prestasi/success-rate')
            .then(res => { prestasiData.value = res.data?.data || null; })
            .catch(err => console.error('Error fetching prestasi overview:', err))
        );
      }
      if (allowedAppSources.value.includes('SARPRAS') && isAdmin.value) {
        promises.push(
          api.get('/dashboard/recap/ormawa')
            .then(res => { ormawaRecaps.value = res.data?.data || []; })
            .catch(err => console.error('Error fetching recap overview:', err))
        );
        promises.push(
          api.get('/dashboard/venues/approved')
            .then(res => { approvedVenues.value = res.data?.data || []; })
            .catch(err => console.error('Error fetching venues overview:', err))
        );
      }

      await Promise.all(promises);
    }
  } catch (err) {
    console.error('Overview init error:', err);
    errorMsg.value = 'Gagal memuat dasbor. Periksa koneksi backend Anda.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  initDashboard();
});
</script>
