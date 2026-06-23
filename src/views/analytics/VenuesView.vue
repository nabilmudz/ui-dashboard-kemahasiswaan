<template>
  <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
    <!-- Loader -->
    <div v-if="loading" class="p-12 text-center flex flex-col items-center justify-center">
      <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs text-gray-400 font-medium">Memuat data okupansi venue...</p>
    </div>

    <!-- Main Error Alert -->
    <div v-else-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Content -->
    <div v-else class="space-y-4">
      <div>
        <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Status Okupansi Tempat (Sarpras Venue ACC)</h3>
        <p class="text-xs text-gray-500 mt-0.5">Daftar ruangan yang berstatus APPROVED untuk peminjaman tempat ormawa.</p>
      </div>

      <div class="overflow-x-auto rounded-xl">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="py-3 px-4 font-bold text-gray-700">Nama Lokasi / Tempat</th>
              <th class="py-3 px-4 font-bold text-gray-700">Ormawa Pengaju</th>
              <th class="py-3 px-4 font-bold text-gray-700">Tanggal Mulai</th>
              <th class="py-3 px-4 font-bold text-gray-700">Tanggal Selesai</th>
              <th class="py-3 px-4 font-bold text-gray-700">Disetujui Oleh</th>
              <th class="py-3 px-4 font-bold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="approvedVenues.length === 0">
              <td colspan="6" class="py-6 text-center text-gray-400 font-semibold">Tidak ada jadwal peminjaman tempat yang disetujui (ACC).</td>
            </tr>
            <tr v-for="venue in approvedVenues" :key="venue.submissionId" class="hover:bg-gray-50/50 transition-colors">
              <td class="py-3 px-4 font-semibold text-gray-900">
                <i class="fa-solid fa-location-dot text-brand-orange mr-1.5"></i>
                {{ venue.namaLokasi || 'Fasilitas Kampus' }}
              </td>
              <td class="py-3 px-4 font-semibold text-gray-700">{{ venue.ormawaNama || venue.submitterName || 'Ormawa' }}</td>
              <td class="py-3 px-4 text-gray-500 font-medium">{{ formatDate(venue.tanggalMulai) }}</td>
              <td class="py-3 px-4 text-gray-500 font-medium">{{ formatDate(venue.tanggalSelesai) }}</td>
              <td class="py-3 px-4 text-gray-600 font-semibold">{{ venue.approvedBy || 'Kasubag Sarpras' }}</td>
              <td class="py-3 px-4">
                <span class="px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide bg-emerald-50 text-emerald-600">
                  APPROVED / ACC
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const loading = ref(true);
const errorMsg = ref('');
const approvedVenues = ref([]);

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

async function loadApprovedVenues() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const res = await api.get('/api/v1/dashboard/venues/approved');
    approvedVenues.value = res.data?.data || [];
  } catch (err) {
    console.error('Error loading venue okupansi list:', err);
    errorMsg.value = 'Gagal memuat okupansi venue.';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadApprovedVenues();
});
</script>
