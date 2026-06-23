<template>
  <section class="p-8 lg:p-12 relative select-none min-h-full">
    <!-- Blue Header Banner (Updated to bright blue theme) -->
    <div class="absolute w-full h-[200px] top-0 left-0 right-0 z-0 bg-brand-orange"></div>

    <!-- Page Title -->
    <div class="relative z-10 text-white mb-8">
      <h1 class="font-bold m-0 text-white text-[42px] tracking-tight leading-none">Dashboard</h1>
      <p class="font-medium text-black mt-1 text-sm opacity-90">
        {{ isMahasiswa ? 'Statistik pengajuan kegiatan dan status dokumen pribadi' : `Dasbor terpadu peran ${authStore.user?.role}` }}
      </p>
    </div>

    <!-- Error Alerts -->
    <div v-if="errorMsg" class="relative z-10 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2">
      <i class="fa-solid fa-circle-exclamation text-base"></i>
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Main Loader -->
    <div v-if="loading" class="relative z-10 bg-white rounded-2xl p-12 border border-gray-100/70 shadow-none text-center flex flex-col items-center justify-center">
      <div class="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-xs text-gray-500 font-semibold">Memuat data analitik...</p>
    </div>

    <!-- MAIN DASHBOARD CONTENT -->
    <div v-else class="relative z-10 grid grid-cols-1 gap-6">

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
          <div class="bg-white p-5 rounded-2xl border border-gray-100/70 shadow-none flex flex-col justify-between col-span-1 md:col-span-2">
            <div class="flex justify-between items-start">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Persentase Belum Disetujui</span>
              <span class="px-2 py-0.5 rounded-full font-bold text-[9px] bg-brand-orange/10 text-brand-orange uppercase tracking-wide">
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
                <div class="bg-brand-orange h-full rounded-full transition-all duration-500" :style="{ width: unacceptedPercentage + '%' }"></div>
              </div>
            </div>
            <span class="text-[9px] text-gray-400 mt-2 block font-medium">Akumulasi status PENDING, REVIEWED, REVISION & REJECTED</span>
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
            <span class="text-3xl font-bold mt-2" :class="(statusCounts.REVISION || 0) > 0 ? 'text-brand-orange' : 'text-gray-950'">
              {{ statusCounts.REVISION || 0 }}
            </span>
            <span class="text-[10px] text-gray-500 mt-1 font-medium">
              Dokumen perlu direvisi
            </span>
          </div>
        </div>

        <!-- Breakdown Statistics (Progress bars) -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100/70 shadow-none mt-2">
          <p class="font-bold text-sm text-gray-900 mb-6 uppercase tracking-wider border-b border-gray-100 pb-3">Rincian Status Pengajuan</p>
          <div class="space-y-4">
            <div v-for="st in statusTypes" :key="st.key">
              <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                <span class="flex items-center gap-2">
                  <span class="inline-block w-2.5 h-2.5 rounded-full" :class="st.colorClass"></span>
                  {{ st.label }}
                </span>
                <span>{{ statusCounts[st.key] || 0 }} ({{ getPercentage(statusCounts[st.key] || 0, mySubmissions.length) }}%)</span>
              </div>
              <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300" :class="st.barClass" :style="{ width: getPercentage(statusCounts[st.key] || 0, mySubmissions.length) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Submissions Table -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100/70 shadow-none mt-2">
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
                  <td colspan="6" class="py-6 text-center text-gray-400 font-semibold">Anda belum memiliki riwayat pengajuan.</td>
                </tr>
                <tr v-for="sub in mySubmissions" :key="sub.submissionId" class="hover:bg-gray-50/50 transition-colors">
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded font-bold text-[9px] bg-slate-100 text-slate-700 uppercase tracking-wide">{{ sub.appSource }}</span>
                  </td>
                  <td class="py-3 px-4 font-semibold text-gray-950">{{ sub.title }}</td>
                  <td class="py-3 px-4 text-gray-500 font-medium">{{ formatDate(sub.submittedAt) }}</td>
                  <td class="py-3 px-4 text-gray-600 font-medium">{{ sub.currentStage || '-' }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide" :class="getStatusBadgeClass(sub.status)">
                      {{ sub.status }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <a :href="sub.deepLinkUrl" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-white bg-brand-orange rounded hover:bg-brand-orange/90 transition-colors no-underline">
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
      <!-- 2. ADMINISTRATIVE STAFF / LEADERSHIP DASHBOARD -->
      <!-- =================================== -->
      <template v-else>
        <!-- Clean Shadowless layout with soft border -->
        <div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
          
          <!-- Tab Loading Indicator -->
          <div v-if="tabLoading" class="p-12 text-center flex flex-col items-center justify-center">
            <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-xs text-gray-400 font-medium">Memuat data modul {{ activeTab.toUpperCase() }}...</p>
          </div>

          <!-- Tab Contents -->
          <div v-else>
            
            <!-- OVERVIEW: RINGKASAN STATISTIK BERBAGAI PERMINTAAN -->
            <div v-if="activeTab === 'overview'" class="space-y-6">
              <div class="mb-4">
                <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Ringkasan Statistik Permintaan</h3>
                <p class="text-xs text-gray-500 mt-0.5">Pemantauan cepat metrik keberhasilan dan jumlah pengajuan dari berbagai modul layanan.</p>
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
                  <router-link 
                    to="/analytics?tab=proposals" 
                    class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-brand-orange rounded-xl border border-gray-100 transition-colors no-underline block"
                  >
                    Buka Detail Antrean <i class="fa-solid fa-chevron-right ml-1"></i>
                  </router-link>
                </div>

                <!-- 2. Card PKM Statistics (if allowed) -->
                <div v-if="allowedAppSources.includes('PKM') && isAdmin" class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                  <div>
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Program Kreativitas Mahasiswa (PKM)</span>
                      <i class="fa-solid fa-lightbulb text-amber-500 text-sm"></i>
                    </div>
                    <div class="flex justify-between items-baseline mt-2">
                      <span class="text-3xl font-bold text-gray-955">{{ pkmData.kpi?.totalProposalMasuk !== undefined ? pkmData.kpi.totalProposalMasuk : 'N/A' }}</span>
                      <span class="text-xs font-bold text-brand-orange">{{ pkmData.kpi?.successRatePercent !== undefined ? pkmData.kpi.successRatePercent + '%' : 'N/A' }} Success Rate</span>
                    </div>
                    <span class="text-[10px] text-gray-500 mt-1 block font-medium">Total proposal terdaftar di sistem</span>
                  </div>
                  <router-link 
                    to="/analytics?tab=pkm" 
                    class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block"
                  >
                    Buka Detail PKM <i class="fa-solid fa-chevron-right ml-1"></i>
                  </router-link>
                </div>

                <!-- 3. Card PMW Statistics (if allowed) -->
                <div v-if="allowedAppSources.includes('PMW') && isAdmin" class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                  <div>
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Program Mahasiswa Wirausaha (PMW)</span>
                      <i class="fa-solid fa-briefcase text-blue-500 text-sm"></i>
                    </div>
                    <div class="flex justify-between items-baseline mt-2">
                      <span class="text-3xl font-bold text-gray-955">{{ pmwGraduationRatio?.totalPartisipasi !== undefined ? pmwGraduationRatio.totalPartisipasi : 'N/A' }}</span>
                      <span class="text-xs font-bold text-emerald-600">{{ pmwGraduationRatio?.ratePercent !== undefined ? pmwGraduationRatio.ratePercent + '%' : 'N/A' }} Lolos</span>
                    </div>
                    <span class="text-[10px] text-gray-500 mt-1 block font-medium">Total partisipasi tim wirausaha</span>
                  </div>
                  <router-link 
                    to="/analytics?tab=pmw" 
                    class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block"
                  >
                    Buka Detail PMW <i class="fa-solid fa-chevron-right ml-1"></i>
                  </router-link>
                </div>

                <!-- 4. Card Beasiswa (if allowed) -->
                <div v-if="allowedAppSources.includes('BEASISWA') && (isAdmin || isKajur)" class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                  <div>
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Proposal Beasiswa</span>
                      <i class="fa-solid fa-file-signature text-emerald-500 text-sm"></i>
                    </div>
                    <div class="flex justify-between items-baseline mt-2">
                      <span class="text-3xl font-bold text-gray-955">{{ isKajur ? (beasiswaKajurData?.totalDiajukan ?? 'N/A') : (beasiswaData?.totalPengajuan ?? 'N/A') }}</span>
                      <span class="text-xs font-bold text-brand-orange">{{ isKajur ? (beasiswaKajurData?.successRatePercent !== undefined ? beasiswaKajurData.successRatePercent + '%' : 'N/A') : (beasiswaData?.acceptanceRatePercent !== undefined ? beasiswaData.acceptanceRatePercent + '%' : 'N/A') }} Penerimaan</span>
                    </div>
                    <span class="text-[10px] text-gray-500 mt-1 block font-medium">Total berkas usulan beasiswa mahasiswa</span>
                  </div>
                  <router-link 
                    to="/analytics?tab=beasiswa" 
                    class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block"
                  >
                    Buka Detail Proposal <i class="fa-solid fa-chevron-right ml-1"></i>
                  </router-link>
                </div>

                <!-- 5. Card Prestasi (if allowed) -->
                <div v-if="allowedAppSources.includes('PRESTASI') && isAdmin" class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                  <div>
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lapor Kompetisi & Prestasi</span>
                      <i class="fa-solid fa-trophy text-pink-500 text-sm"></i>
                    </div>
                    <div class="flex justify-between items-baseline mt-2">
                      <span class="text-3xl font-bold text-gray-955">{{ prestasiData?.totalPengajuan ?? 'N/A' }}</span>
                      <span class="text-xs font-bold text-emerald-600">{{ prestasiData?.successRatePercent !== undefined ? prestasiData.successRatePercent + '%' : 'N/A' }} Konversi</span>
                    </div>
                    <span class="text-[10px] text-gray-500 mt-1 block font-medium">Laporan usulan prestasi disetujui</span>
                  </div>
                  <router-link 
                    to="/analytics?tab=prestasi" 
                    class="mt-5 w-full py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block"
                  >
                    Buka Detail Prestasi <i class="fa-solid fa-chevron-right ml-1"></i>
                  </router-link>
                </div>

                <!-- 6. Card Sarpras (if allowed) -->
                <div v-if="allowedAppSources.includes('SARPRAS') && isAdmin" class="bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between border border-gray-100/70">
                  <div>
                    <div class="flex justify-between items-start mb-2">
                      <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rekap & Peminjaman Sarpras</span>
                      <i class="fa-solid fa-door-open text-indigo-500 text-sm"></i>
                    </div>
                    <div class="flex justify-between items-baseline mt-2">
                      <span class="text-3xl font-bold text-gray-955">{{ ormawaRecaps?.length ?? 0 }}</span>
                      <span class="text-xs font-bold text-gray-600">{{ approvedVenues?.length ?? 0 }} Venue Terisi</span>
                    </div>
                    <span class="text-[10px] text-gray-500 mt-1 block font-medium">Rekapitulasi Ormawa & Okupansi Tempat</span>
                  </div>
                  <div class="flex gap-2 mt-5">
                    <router-link 
                      to="/analytics?tab=recap" 
                      class="flex-1 py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block"
                    >
                      Rekap Ormawa
                    </router-link>
                    <router-link 
                      to="/analytics?tab=venues" 
                      class="flex-1 py-2 bg-white hover:bg-gray-50 text-center text-[10px] font-bold text-gray-800 rounded-xl border border-gray-100 transition-colors no-underline block"
                    >
                      Jadwal Ruang
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- A. TAB: PENDING PROPOSALS -->
            <div v-if="activeTab === 'proposals'" class="space-y-4">
              <div class="flex justify-between items-center flex-wrap gap-3 mb-2">
                <div>
                  <h3 class="text-sm font-bold text-gray-950 uppercase tracking-wide">Antrean Pending Proposal (Real-time)</h3>
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
                      <td class="py-3 px-4 font-semibold text-gray-950 truncate max-w-[200px]" :title="prop.title">{{ prop.title }}</td>
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

            <!-- B. TAB: PKM STATISTICS -->
            <div v-if="activeTab === 'pkm'" class="space-y-6">
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

              <!-- Staff View: Distribusi status & progres reviewer -->
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
            <!-- C. TAB: PMW STATISTICS -->
            <div v-if="activeTab === 'pmw'" class="space-y-6">
              <div>
                <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Program Mahasiswa Wirausaha (PMW)</h3>
                <p class="text-xs text-gray-500 mt-0.5">Analisis alokasi pendanaan inkubasi bisnis, bidang usaha, dan berkas lolos.</p>
              </div>

              <!-- Inline Alert for PMW errors -->
              <div v-if="pmwErrors.dana" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
                <i class="fa-solid fa-circle-exclamation text-sm"></i>
                <span>{{ pmwErrors.dana }}</span>
              </div>

              <!-- WD3 View: Alokasi Dana & Rasio Kelulusan -->
              <div v-if="authStore.user?.role === 'WD3'" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100/70">
                    <span class="text-xs font-semibold text-gray-800">Total Alokasi Dana PMW:</span>
                    <span class="text-xl font-bold text-brand-orange">{{ formatRupiah(pmwData.totalDanaDisalurkan) }}</span>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100/70">
                    <span class="text-xs font-semibold text-gray-800">Rasio Kelulusan PMW:</span>
                    <span v-if="pmwErrors.ratio" class="text-xs text-red-500 font-semibold">⚠️ {{ pmwErrors.ratio }}</span>
                    <span v-else-if="latestPmwGraduationRatio" class="text-xl font-bold text-emerald-600">
                      {{ latestPmwGraduationRatio.kelulusanRatePercent }}% ({{ latestPmwGraduationRatio.totalLolos }} / {{ latestPmwGraduationRatio.totalPendaftar }} Tim)
                    </span>
                    <span v-else class="text-xs text-gray-400">Loading...</span>
                  </div>
                </div>

                <div v-if="pmwData.data" class="space-y-3">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide font-sans">Sebaran Distribusi Bantuan Dana</h4>
                  <div class="overflow-x-auto rounded-xl border border-gray-100/70">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr class="bg-gray-50 border-b border-gray-100">
                          <th class="py-3 px-4 font-bold text-gray-700">Jurusan</th>
                          <th class="py-3 px-4 font-bold text-gray-700 text-center">Tim Didanai</th>
                          <th class="py-3 px-4 font-bold text-gray-700 text-right">Total Pendanaan</th>
                          <th class="py-3 px-4 font-bold text-gray-700 text-center">Persentase</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="item in pmwData.data" :key="item.jurusan" class="hover:bg-gray-50/50">
                          <td class="py-3 px-4 font-semibold text-gray-900">{{ item.jurusan }}</td>
                          <td class="py-3 px-4 text-center font-semibold text-gray-700">{{ item.jumlahTimDidanai }}</td>
                          <td class="py-3 px-4 text-right font-bold text-gray-900">{{ formatRupiah(item.totalDana) }}</td>
                          <td class="py-3 px-4 text-center">
                            <div class="flex items-center justify-center gap-2">
                              <span class="font-bold text-gray-700">{{ item.percent }}%</span>
                              <div class="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div class="bg-brand-orange h-full" :style="{ width: item.percent + '%' }"></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- KLI View: Bidang Usaha & Rasio Dana Usulan -->
              <div v-else-if="authStore.user?.role === 'KLI'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Sebaran Bidang Usaha -->
                <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Kategori / Bidang Usaha Mahasiswa</h4>
                  <div v-if="pmwErrors.categories" class="text-xs text-red-500 font-semibold">⚠️ {{ pmwErrors.categories }}</div>
                  <div v-else-if="!pmwBusinessCategories.data || pmwBusinessCategories.data.length === 0" class="text-xs text-gray-400">Tidak ada data kategori usaha.</div>
                  <div v-else class="space-y-3">
                    <div v-for="cat in pmwBusinessCategories.data" :key="cat.bidangUsaha" class="flex flex-col">
                      <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{{ cat.bidangUsaha }}</span>
                        <span>{{ cat.jumlah }} Tim ({{ cat.percent }}%)</span>
                      </div>
                      <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-indigo-500 h-full" :style="{ width: cat.percent + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Dana Usul vs Rekomendasi -->
                <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Rasio Dana Usulan vs Rekomendasi Praktisi</h4>
                  <div v-if="pmwErrors.comparison" class="text-xs text-red-500 font-semibold">⚠️ {{ pmwErrors.comparison }}</div>
                  <div v-else class="grid grid-cols-1 gap-4">
                    <div class="flex justify-between items-center p-3 bg-white rounded-xl">
                      <span class="text-xs text-gray-500 font-semibold">Rata-rata Usulan Tim:</span>
                      <span class="font-bold text-gray-900 text-sm">{{ formatRupiah(computedPmwFundingComparison.averageUsulan) }}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-white rounded-xl">
                      <span class="text-xs text-gray-500 font-semibold">Rata-rata Rekomendasi Reviewer:</span>
                      <span class="font-bold text-emerald-600 text-sm">{{ formatRupiah(computedPmwFundingComparison.averageRekomendasi) }}</span>
                    </div>
                    <div class="p-3 bg-emerald-50/50 rounded-xl">
                      <div class="flex justify-between text-xs font-bold text-emerald-800 mb-1">
                        <span>Rasio Penyerapan Dana Rekomendasi:</span>
                        <span>{{ computedPmwFundingComparison.absorptionRatePercent }}%</span>
                      </div>
                      <div class="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-emerald-500 h-full" :style="{ width: computedPmwFundingComparison.absorptionRatePercent + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Staff View: Penilaian & Kelengkapan Berkas Tim Lolos -->
              <div v-else-if="authStore.user?.role === 'STAFF'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Penilaian Reviewer -->
                <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Progres Penilaian Reviewer PMW</h4>
                  <div v-if="pmwErrors.staff" class="text-xs text-red-500 font-semibold">⚠️ {{ pmwErrors.staff }}</div>
                  <div v-else-if="pmwReviewerProgress.length === 0" class="text-xs text-gray-400">Tidak ada progres reviewer.</div>
                  <div v-else class="space-y-3">
                    <div v-for="rev in pmwReviewerProgress" :key="rev.reviewerId" class="flex flex-col">
                      <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{{ rev.reviewerName }}</span>
                        <span>{{ rev.totalReviewed }} / {{ rev.totalAssigned }} Tim ({{ rev.progressPercent }}%)</span>
                      </div>
                      <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-emerald-500 h-full" :style="{ width: rev.progressPercent + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Kelengkapan Berkas -->
                <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Checklist Kelengkapan Berkas Tim Lolos</h4>
                  <div v-if="pmwErrors.staff" class="text-xs text-red-500 font-semibold">⚠️ {{ pmwErrors.staff }}</div>
                  <div v-else-if="pmwRequiredDocuments.length === 0" class="text-xs text-gray-400">Tidak ada berkas terdaftar.</div>
                  <div v-else class="space-y-3">
                    <div v-for="doc in pmwRequiredDocuments" :key="doc.namaTim" class="flex flex-col">
                      <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{{ doc.namaTim }}</span>
                        <span>{{ doc.totalDokumenLengkap }} / {{ doc.totalDokumenWajib }} Berkas ({{ doc.completenessPercent }}%)</span>
                      </div>
                      <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-brand-orange h-full" :style="{ width: doc.completenessPercent + '%' }"></div>
                      </div>
                      <span v-if="doc.dokumenKurang && doc.dokumenKurang.length > 0" class="text-[9px] text-red-500 font-medium -mt-1 block">
                        Kurang: {{ doc.dokumenKurang.join(', ') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Combined View (Default Fallback) -->
              <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Bidang Usaha PMW</h4>
                  <div v-if="pmwErrors.categories" class="text-xs text-red-500 font-semibold">⚠️ {{ pmwErrors.categories }}</div>
                  <div v-else-if="!pmwBusinessCategories.data || pmwBusinessCategories.data.length === 0" class="text-xs text-gray-400">Tidak ada data kategori usaha.</div>
                  <div v-else class="space-y-3">
                    <div v-for="cat in pmwBusinessCategories.data" :key="cat.bidangUsaha" class="flex flex-col">
                      <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                        <span>{{ cat.bidangUsaha }}</span>
                        <span>{{ cat.percent }}%</span>
                      </div>
                      <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-brand-orange h-full" :style="{ width: cat.percent + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="pmwData.data" class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Alokasi Dana Per Jurusan</h4>
                  <div class="overflow-x-auto rounded-xl border border-gray-100/70">
                    <table class="w-full text-left border-collapse text-xs">
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="item in pmwData.data" :key="item.jurusan">
                          <td class="py-2.5 px-1 font-semibold text-gray-900">{{ item.jurusan }}</td>
                          <td class="py-2.5 px-1 font-bold text-gray-950 text-right">{{ formatRupiah(item.totalDana) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <!-- D. TAB: BEASISWA STATISTICS -->
            <div v-if="activeTab === 'beasiswa'" class="space-y-6">
              <div>
                <h3 class="text-sm font-bold text-gray-955 uppercase tracking-wide">Proposal Beasiswa</h3>
                <p class="text-xs text-gray-500 mt-0.5">Monitoring sebaran proposal, tipe pendanaan, dan antrean verifikasi berkas.</p>
              </div>

              <!-- Inline Alerts for Beasiswa errors -->
              <div v-if="beasiswaErrors.monitoring" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
                <i class="fa-solid fa-circle-exclamation text-sm"></i>
                <span>{{ beasiswaErrors.monitoring }}</span>
              </div>
              <div v-if="beasiswaErrors.kajur" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
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
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Penerima Beasiswa Berdasarkan Jurusan</h4>
                  <div v-if="beasiswaErrors.jurusan" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.jurusan }}</div>
                  <div v-else-if="!beasiswaJurusanDist.data || beasiswaJurusanDist.data.length === 0" class="text-xs text-gray-400">Tidak ada data sebaran jurusan.</div>
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
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Sebaran Beasiswa Berdasarkan Sumber Pendanaan</h4>
                  <div v-if="beasiswaErrors.sumber" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.sumber }}</div>
                  <div v-else-if="!beasiswaFundingDist.bySumberDana || beasiswaFundingDist.bySumberDana.length === 0" class="text-xs text-gray-400">Tidak ada data sumber pendanaan.</div>
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

                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide border-t border-gray-100 pt-4">Sebaran Berdasarkan Tipe Beasiswa</h4>
                  <div v-if="beasiswaErrors.sumber" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.sumber }}</div>
                  <div v-else-if="!beasiswaFundingDist.byTipe || beasiswaFundingDist.byTipe.length === 0" class="text-xs text-gray-400">Tidak ada data tipe beasiswa.</div>
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
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Program Beasiswa Berjalan & Akan Datang</h4>
                  <div v-if="beasiswaErrors.sumber" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.sumber }}</div>
                  <div v-else-if="beasiswaActivePrograms.length === 0" class="text-xs text-gray-400">Tidak ada program beasiswa aktif.</div>
                  <div v-else class="space-y-3">
                    <div v-for="prog in beasiswaActivePrograms" :key="prog.programId" class="p-3 bg-white rounded-xl flex justify-between items-center gap-3 border border-gray-100/70">
                      <div>
                        <p class="font-bold text-gray-900 text-xs m-0">{{ prog.programName }}</p>
                        <p class="text-[10px] text-gray-400 font-medium m-0 mt-0.5">
                          <i class="fa-regular fa-calendar mr-1"></i>
                          Linimasa: {{ prog.startDate ? formatDate(prog.startDate) : '-' }} s/d {{ prog.endDate ? formatDate(prog.endDate) : '-' }}
                        </p>
                      </div>
                      <span class="px-2 py-0.5 rounded font-bold text-[8px] uppercase tracking-wide shrink-0" :class="prog.status === 'AKAN_DATANG' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'">
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
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Monitoring Status Berkas Tahap Verifikasi</h4>
                  <div v-if="beasiswaErrors.aktivitas" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.aktivitas }}</div>
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
                        <div class="h-full rounded-full transition-all duration-300" :class="st.barClass" :style="{ width: getPercentage(beasiswaVerificationStages[st.key] || 0, beasiswaData?.totalPengajuan || 100) + '%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Aktivitas pengajuan beasiswa -->
                <div class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                  <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Tren Pengajuan Baru per Periode</h4>
                  <div v-if="beasiswaErrors.aktivitas" class="text-xs text-red-500 font-semibold mb-2">⚠️ {{ beasiswaErrors.aktivitas }}</div>
                  <div v-else-if="beasiswaRecentActivities.length === 0" class="text-xs text-gray-400">Tidak ada riwayat tren pengajuan baru.</div>
                  <div v-else class="space-y-3">
                    <div v-for="act in beasiswaRecentActivities" :key="act.periodLabel" class="p-3 bg-white rounded-xl flex justify-between items-center gap-3 border border-gray-100/70">
                      <div>
                        <p class="font-bold text-gray-900 text-xs m-0">Periode: {{ act.periodLabel }}</p>
                        <p class="text-[10px] text-gray-400 font-medium m-0 mt-0.5">Jumlah Pengajuan Baru: <span class="font-semibold text-indigo-600">{{ act.totalPengajuanBaru }} Berkas</span></p>
                      </div>
                      <span class="text-[9px] font-bold text-gray-400 shrink-0"><i class="fa-regular fa-chart-line mr-1"></i>Tren</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- General Gabungan / Kajur View -->
              <div v-else class="space-y-4">
                <!-- Kajur View -->
                <div v-if="isKajur" class="space-y-4">
                  <div v-if="beasiswaKajurData" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
                      <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Pengajuan</p>
                      <p class="text-2xl font-bold text-gray-900 mt-1">{{ beasiswaKajurData.totalPengajuan }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
                      <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Total Diterima</p>
                      <p class="text-2xl font-bold text-emerald-600 mt-1">{{ beasiswaKajurData.totalDiterima }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100/70">
                      <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rasio Penerimaan</p>
                      <p class="text-2xl font-bold text-brand-orange mt-1">{{ getPercentage(beasiswaKajurData.totalDiterima, beasiswaKajurData.totalPengajuan) }}%</p>
                    </div>
                  </div>

                  <div v-if="beasiswaKajurData?.distribution" class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70">
                    <h4 class="text-xs font-bold text-gray-800 uppercase tracking-wide">Distribusi Status Proposal Beasiswa Jurusan</h4>
                    <div class="space-y-3">
                      <div v-for="st in statusTypes" :key="st.key" class="flex flex-col">
                        <div class="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                          <span class="flex items-center gap-2">
                            <span class="inline-block w-2.5 h-2.5 rounded-full" :class="st.colorClass"></span>
                            {{ st.label }}
                          </span>
                          <span>{{ beasiswaKajurData.distribution[st.key] || 0 }} Berkas</span>
                        </div>
                        <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div class="h-full rounded-full transition-all duration-300" :class="st.barClass" :style="{ width: getPercentage(beasiswaKajurData.distribution[st.key] || 0, beasiswaKajurData.totalPengajuan) + '%' }"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fallback Gabungan View (WD3/Staff/etc overview) -->
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

            <!-- E. TAB: PRESTASI STATISTICS -->
            <div v-if="activeTab === 'prestasi'" class="space-y-6">
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

            <!-- F. TAB: RECAP ORMAWA (SARPRAS) -->
            <div v-if="activeTab === 'recap'" class="space-y-4">
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

            <!-- G. TAB: VENUE OCCUPANCY -->
            <div v-if="activeTab === 'venues'" class="space-y-4">
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
        </div>
      </template>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// Role determinations
const isMahasiswa = computed(() => authStore.user?.role === 'MAHASISWA');
const isKajur = computed(() => authStore.user?.role === 'KAJUR');
const isKaprodi = computed(() => authStore.user?.role === 'KAPRODI');
const isAdmin = computed(() => ['STAFF', 'WD3', 'KLI'].includes(authStore.user?.role));

// List of allowed AppSources based on user token response
const allowedAppSources = computed(() => {
  return (authStore.user?.accessibleApps || []).map(app => {
    return typeof app === 'string' ? app : app.appSource;
  });
});

// State management
const loading = ref(true);
const tabLoading = ref(false);
const errorMsg = ref('');
const activeTab = ref('overview');

// Filters
const selectedAppFilter = ref('ALL');
const recapSearch = ref('');
const recapPeriod = ref('');

// Tab Lists based on accessibleApps and Role
const availableTabs = computed(() => {
  if (isMahasiswa.value) return [];
  
  const tabs = [
    { id: 'overview', label: 'Ringkasan Statistik', icon: 'fa-solid fa-chart-pie' },
    { id: 'proposals', label: 'Antrean Pending', icon: 'fa-solid fa-list-check' }
  ];

  if (allowedAppSources.value.includes('PKM') && (isAdmin.value)) {
    tabs.push({ id: 'pkm', label: 'PKM', icon: 'fa-solid fa-lightbulb' });
  }
  if (allowedAppSources.value.includes('PMW') && (isAdmin.value)) {
    tabs.push({ id: 'pmw', label: 'PMW', icon: 'fa-solid fa-briefcase' });
  }
  if (allowedAppSources.value.includes('BEASISWA') && (isAdmin.value || isKajur.value)) {
    tabs.push({ id: 'beasiswa', label: 'Proposal', icon: 'fa-solid fa-file-signature' });
  }
  if (allowedAppSources.value.includes('PRESTASI') && (isAdmin.value)) {
    tabs.push({ id: 'prestasi', label: 'Kompetisi & Prestasi', icon: 'fa-solid fa-trophy' });
  }
  if (allowedAppSources.value.includes('SARPRAS') && (isAdmin.value)) {
    tabs.push({ id: 'recap', label: 'Rekap Ormawa', icon: 'fa-solid fa-chart-column' });
    tabs.push({ id: 'venues', label: 'Okupansi Venue', icon: 'fa-solid fa-door-open' });
  }

  return tabs;
});

// Data Containers
const mySubmissions = ref([]);
const pendingProposals = ref([]);
const ormawaRecaps = ref([]);
const approvedVenues = ref([]);

// New Statistics Containers
const pkmData = ref({});
const pmwData = ref({});
const beasiswaData = ref(null);
const beasiswaKajurData = ref(null);
const prestasiData = ref(null);

// Real Statistics Refs (Populated from live API endpoints)
const pkmStatusDist = ref([]);
const pkmReviewerProg = ref([]);
const pkmAnnualTrend = ref([]);
const pkmSchemeDist = ref([]);

const pmwGraduationRatio = ref(null);
const pmwBusinessCategories = ref([]);
const pmwFundingComparison = ref(null);
const pmwReviewerProgress = ref([]);
const pmwRequiredDocuments = ref([]);

const beasiswaJurusanDist = ref([]);
const beasiswaFundingDist = ref([]);
const beasiswaActivePrograms = ref([]);
const beasiswaVerificationStages = ref([]);
const beasiswaRecentActivities = ref([]);

const prestasiIkuTrend = ref([]);
const prestasiInterestDist = ref([]);
const prestasiGagalTanding = ref(null);
const prestasiLeadTime = ref(null);

const pkmErrors = ref({});
const pmwErrors = ref({});
const beasiswaErrors = ref({});
const prestasiErrors = ref({});

// Configuration for progress bar visualization
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

const latestPmwGraduationRatio = computed(() => {
  if (!pmwGraduationRatio.value?.data || pmwGraduationRatio.value.data.length === 0) return null;
  return pmwGraduationRatio.value.data[pmwGraduationRatio.value.data.length - 1];
});

const computedPmwFundingComparison = computed(() => {
  const list = pmwFundingComparison.value?.data || [];
  if (list.length === 0) return { averageUsulan: 0, averageRekomendasi: 0, absorptionRatePercent: 0 };
  const totalUsulan = list.reduce((sum, item) => sum + (item.danaUsulan || 0), 0);
  const totalRekomendasi = list.reduce((sum, item) => sum + (item.danaRekomendasiPraktisi || 0), 0);
  const averageUsulan = totalUsulan / list.length;
  const averageRekomendasi = totalRekomendasi / list.length;
  const absorptionRatePercent = averageUsulan > 0 ? Math.round((averageRekomendasi / averageUsulan) * 1000) / 10 : 0;
  return { averageUsulan, averageRekomendasi, absorptionRatePercent };
});

// Filter pending proposals based on appSource selection and accessibleApps
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

// Filter recap table based on search input & year filter
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

// Switch Tabs & Load Tab Data dynamically
async function switchTab(tabId) {
  activeTab.value = tabId;
  tabLoading.value = true;
  errorMsg.value = '';
  try {
    if (tabId === 'overview') {
      const promises = [
        api.get('/dashboard/proposals/pending')
          .then(res => { pendingProposals.value = res.data?.data || []; })
          .catch(err => console.error('Error fetching proposals overview:', err))
      ];
      
      if (allowedAppSources.value.includes('PKM') && isAdmin.value) {
        promises.push(
          api.get('/dashboard/analytics/pkm/kpi-summary')
            .then(res => { pkmData.value = res.data || {}; })
            .catch(err => console.error('Error fetching pkm overview:', err))
        );
      }
      if (allowedAppSources.value.includes('PMW') && isAdmin.value) {
        promises.push(
          api.get('/dashboard/analytics/pmw/dana-per-jurusan')
            .then(res => { pmwData.value = res.data || {}; })
            .catch(err => console.error('Error fetching pmw overview:', err))
        );
        promises.push(
          api.get('/dashboard/analytics/pmw/rasio-kelulusan')
            .then(res => { pmwGraduationRatio.value = res.data || null; })
            .catch(err => console.error('Error fetching pmw ratio overview:', err))
        );
      }
      if (allowedAppSources.value.includes('BEASISWA')) {
        if (isKajur.value) {
          promises.push(
            api.get('/dashboard/analytics/beasiswa/kajur/status-proposal')
              .then(res => { beasiswaKajurData.value = res.data || null; })
              .catch(err => console.error('Error fetching beasiswa kajur overview:', err))
          );
        } else {
          promises.push(
            api.get('/dashboard/analytics/beasiswa/monitoring')
              .then(res => { beasiswaData.value = res.data || null; })
              .catch(err => console.error('Error fetching beasiswa overview:', err))
          );
        }
      }
      if (allowedAppSources.value.includes('PRESTASI') && isAdmin.value) {
        promises.push(
          api.get('/dashboard/analytics/prestasi/success-rate')
            .then(res => { prestasiData.value = res.data || null; })
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
    } else if (tabId === 'proposals') {
      const res = await api.get('/dashboard/proposals/pending');
      pendingProposals.value = res.data?.data || [];
    } else if (tabId === 'pkm') {
      pkmErrors.value = {};
      try {
        const res = await api.get('/dashboard/analytics/pkm/kpi-summary');
        pkmData.value = res.data || {};
      } catch (err) {
        pkmErrors.value.kpi = err.response?.data?.message || err.message || 'Gagal memuat ringkasan KPI PKM';
      }

      if (authStore.user?.role === 'STAFF') {
        try {
          const res = await api.get('/dashboard/analytics/pkm/status-distribution');
          pkmStatusDist.value = res.data?.data || res.data || [];
        } catch (err) {
          pkmErrors.value.statusDist = err.response?.data?.message || err.message || 'Gagal memuat distribusi status PKM';
        }

        try {
          const res = await api.get('/dashboard/analytics/pkm/reviewer-progress');
          pkmReviewerProg.value = res.data?.data || res.data || [];
        } catch (err) {
          pkmErrors.value.reviewerProg = err.response?.data?.message || err.message || 'Gagal memuat progres reviewer PKM';
        }
      } else if (authStore.user?.role === 'KLI') {
        try {
          const res = await api.get('/dashboard/analytics/pkm/distribution-jurusan-skema');
          pkmSchemeDist.value = res.data?.data || res.data || [];
        } catch (err) {
          pkmErrors.value.schemeDist = err.response?.data?.message || err.message || 'Gagal memuat sebaran skema PKM';
        }

        try {
          const res = await api.get('/dashboard/analytics/pkm/trend-tahunan');
          pkmAnnualTrend.value = res.data?.data || res.data || [];
        } catch (err) {
          pkmErrors.value.annualTrend = err.response?.data?.message || err.message || 'Gagal memuat tren tahunan PKM';
        }
      }
    } else if (tabId === 'pmw') {
      pmwErrors.value = {};
      try {
        const res = await api.get('/dashboard/analytics/pmw/dana-per-jurusan');
        pmwData.value = res.data || {};
      } catch (err) {
        pmwErrors.value.dana = err.response?.data?.message || err.message || 'Gagal memuat alokasi dana PMW';
      }

      if (authStore.user?.role === 'WD3') {
        try {
          const res = await api.get('/dashboard/analytics/pmw/rasio-kelulusan');
          pmwGraduationRatio.value = res.data || null;
        } catch (err) {
          pmwErrors.value.ratio = err.response?.data?.message || err.message || 'Gagal memuat rasio kelulusan PMW';
        }
      } else if (authStore.user?.role === 'KLI') {
        try {
          const res = await api.get('/dashboard/analytics/pmw/sebaran-bidang-usaha');
          pmwBusinessCategories.value = res.data?.data || res.data || [];
        } catch (err) {
          pmwErrors.value.categories = err.response?.data?.message || err.message || 'Gagal memuat bidang usaha PMW';
        }

        try {
          const res = await api.get('/dashboard/analytics/pmw/dana-usulan-vs-rekomendasi');
          pmwFundingComparison.value = res.data || null;
        } catch (err) {
          pmwErrors.value.comparison = err.response?.data?.message || err.message || 'Gagal memuat perbandingan dana PMW';
        }
      } else if (authStore.user?.role === 'STAFF') {
        try {
          const res = await api.get('/dashboard/analytics/pmw/staff-progress');
          pmwReviewerProgress.value = res.data?.reviewerProgress || [];
          pmwRequiredDocuments.value = res.data?.requiredDocuments || [];
        } catch (err) {
          pmwErrors.value.staff = err.response?.data?.message || err.message || 'Gagal memuat progres dokumen PMW';
        }
      }
    } else if (tabId === 'beasiswa') {
      beasiswaErrors.value = {};
      if (isKajur.value) {
        try {
          const res = await api.get('/dashboard/analytics/beasiswa/kajur/status-proposal');
          beasiswaKajurData.value = res.data || null;
        } catch (err) {
          beasiswaErrors.value.kajur = err.response?.data?.message || err.message || 'Gagal memuat status proposal beasiswa kajur';
        }
      } else {
        try {
          const res = await api.get('/dashboard/analytics/beasiswa/monitoring');
          beasiswaData.value = res.data || null;
        } catch (err) {
          beasiswaErrors.value.monitoring = err.response?.data?.message || err.message || 'Gagal memuat monitoring beasiswa';
        }

        if (authStore.user?.role === 'WD3') {
          try {
            const res = await api.get('/dashboard/analytics/beasiswa/sebaran-jurusan');
            beasiswaJurusanDist.value = res.data?.data || res.data || [];
          } catch (err) {
            beasiswaErrors.value.jurusan = err.response?.data?.message || err.message || 'Gagal memuat sebaran jurusan beasiswa';
          }
        } else if (authStore.user?.role === 'KLI') {
          try {
            const res = await api.get('/dashboard/analytics/beasiswa/sebaran-tipe-sumber');
            beasiswaFundingDist.value = res.data?.fundingDistribution || res.data?.data || res.data || [];
            beasiswaActivePrograms.value = res.data?.activePrograms || [];
          } catch (err) {
            beasiswaErrors.value.sumber = err.response?.data?.message || err.message || 'Gagal memuat tipe sumber beasiswa';
          }
        } else if (authStore.user?.role === 'STAFF') {
          try {
            const res = await api.get('/dashboard/analytics/beasiswa/status-aktivitas');
            beasiswaVerificationStages.value = res.data?.verificationStages || [];
            beasiswaRecentActivities.value = res.data?.recentActivities || [];
          } catch (err) {
            beasiswaErrors.value.aktivitas = err.response?.data?.message || err.message || 'Gagal memuat status aktivitas beasiswa';
          }
        }
      }
    } else if (tabId === 'prestasi') {
      prestasiErrors.value = {};
      try {
        const res = await api.get('/dashboard/analytics/prestasi/success-rate');
        prestasiData.value = res.data || null;
      } catch (err) {
        prestasiErrors.value.rate = err.response?.data?.message || err.message || 'Gagal memuat success rate prestasi';
      }

      if (authStore.user?.role === 'WD3') {
        try {
          const res = await api.get('/dashboard/analytics/prestasi/tren-iku');
          prestasiIkuTrend.value = res.data?.data || res.data || [];
        } catch (err) {
          prestasiErrors.value.iku = err.response?.data?.message || err.message || 'Gagal memuat tren IKU prestasi';
        }
      } else if (authStore.user?.role === 'KLI') {
        try {
          const res = await api.get('/dashboard/analytics/prestasi/sebaran-kategori');
          prestasiInterestDist.value = res.data?.data || res.data || [];
        } catch (err) {
          prestasiErrors.value.kategori = err.response?.data?.message || err.message || 'Gagal memuat sebaran minat prestasi';
        }

        try {
          const res = await api.get('/dashboard/analytics/prestasi/rasio-gagal-tanding');
          prestasiGagalTanding.value = res.data || null;
        } catch (err) {
          prestasiErrors.value.lpj = err.response?.data?.message || err.message || 'Gagal memuat audit LPJ';
        }
      } else if (authStore.user?.role === 'STAFF') {
        try {
          const res = await api.get('/dashboard/analytics/prestasi/lead-time-revision');
          prestasiLeadTime.value = res.data || null;
        } catch (err) {
          prestasiErrors.value.leadTime = err.response?.data?.message || err.message || 'Gagal memuat pemrosesan berkas';
        }
      }
    } else if (tabId === 'recap') {
      const res = await api.get('/dashboard/recap/ormawa');
      ormawaRecaps.value = res.data?.data || [];
    } else if (tabId === 'venues') {
      const res = await api.get('/dashboard/venues/approved');
      approvedVenues.value = res.data?.data || [];
    }
  } catch (err) {
    console.error(`Error loading tab data for ${tabId}:`, err);
    errorMsg.value = `Gagal memuat analitis data untuk modul ${tabId.toUpperCase()}.`;
  } finally {
    tabLoading.value = false;
  }
}

// Initial Fetch on view mounted
async function initDashboard() {
  loading.value = true;
  errorMsg.value = '';
  try {
    if (isMahasiswa.value) {
      const res = await api.get('/dashboard/submissions');
      mySubmissions.value = res.data?.data || [];
    } else {
      const initialTab = route.query.tab || 'overview';
      if (availableTabs.value.some(t => t.id === initialTab)) {
        await switchTab(initialTab);
      } else {
        await switchTab('overview');
      }
    }
  } catch (err) {
    console.error('Analytics init error:', err);
    errorMsg.value = 'Gagal memuat dasbor gateway. Periksa koneksi backend Anda.';
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.query.tab,
  async (newTab) => {
    if (isMahasiswa.value) return;
    const tab = newTab || 'overview';
    if (availableTabs.value.some(t => t.id === tab)) {
      await switchTab(tab);
    } else {
      await switchTab('overview');
    }
  }
);

onMounted(() => {
  initDashboard();
});
</script>

<style scoped>
h1 {
  font-family: Poppins, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: -1.2px;
}
</style>
