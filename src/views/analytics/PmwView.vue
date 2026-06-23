<template>
	<div class="bg-white rounded-2xl border border-gray-100/70 p-6 shadow-none">
		<!-- Loader -->
		<div
			v-if="loading"
			class="p-12 text-center flex flex-col items-center justify-center"
		>
			<div
				class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"
			></div>
			<p class="text-xs text-gray-400 font-medium">Memuat data PMW...</p>
		</div>

		<!-- Main Error Alert -->
		<div
			v-else-if="errorMsg"
			class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-xs font-semibold flex items-center gap-2"
		>
			<i class="fa-solid fa-circle-exclamation text-base"></i>
			<span>{{ errorMsg }}</span>
		</div>

		<!-- Content -->
		<div v-else class="space-y-6">
			<div>
				<h3
					class="text-sm font-bold text-gray-955 uppercase tracking-wide"
				>
					Program Mahasiswa Wirausaha (PMW)
				</h3>
				<p class="text-xs text-gray-500 mt-0.5">
					Analisis alokasi pendanaan inkubasi bisnis, bidang usaha,
					dan berkas lolos.
				</p>
			</div>

			<!-- Inline Alert for PMW errors -->
			<div
				v-if="pmwErrors.dana"
				class="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4"
			>
				<i class="fa-solid fa-circle-exclamation text-sm"></i>
				<span>{{ pmwErrors.dana }}</span>
			</div>

			<!-- WD3 View: Alokasi Dana & Rasio Kelulusan -->
			<div v-if="authStore.user?.role === 'WD3'" class="space-y-6">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div
						class="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100/70"
					>
						<span class="text-xs font-semibold text-gray-800"
							>Total Alokasi Dana PMW:</span
						>
						<span class="text-xl font-bold text-brand-orange">{{
							formatRupiah(pmwData.totalDanaDisalurkan)
						}}</span>
					</div>
					<div
						class="bg-gray-50 p-4 rounded-2xl flex justify-between items-center border border-gray-100/70"
					>
						<span class="text-xs font-semibold text-gray-800"
							>Rasio Kelulusan PMW:</span
						>
						<span
							v-if="pmwErrors.ratio"
							class="text-xs text-red-500 font-semibold"
							>⚠️ {{ pmwErrors.ratio }}</span
						>
						<span
							v-else-if="latestPmwGraduationRatio"
							class="text-xl font-bold text-emerald-600"
						>
							{{ latestPmwGraduationRatio.kelulusanRatePercent }}%
							({{ latestPmwGraduationRatio.totalLolos }} /
							{{ latestPmwGraduationRatio.totalPendaftar }} Tim)
						</span>
						<span v-else class="text-xs text-gray-400"
							>Loading...</span
						>
					</div>
				</div>

				<div v-if="pmwData.danaPerProdi" class="space-y-3">
					<h4
						class="text-xs font-bold text-gray-800 uppercase tracking-wide"
					>
						Sebaran Distribusi Bantuan Dana
					</h4>
					<div
						class="overflow-x-auto rounded-xl border border-gray-100/70"
					>
						<table class="w-full text-left border-collapse text-xs">
							<thead>
								<tr class="bg-gray-50 border-b border-gray-100">
									<th
										class="py-3 px-4 font-bold text-gray-700"
									>
										Jurusan
									</th>
									<th
										class="py-3 px-4 font-bold text-gray-700 text-center"
									>
										Tim Didanai
									</th>
									<th
										class="py-3 px-4 font-bold text-gray-700 text-right"
									>
										Total Pendanaan
									</th>
									<th
										class="py-3 px-4 font-bold text-gray-700 text-center"
									>
										Persentase
									</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-100">
								<tr
									v-for="item in pmwData.danaPerProdi"
									:key="item.jurusan"
									class="hover:bg-gray-50/50"
								>
									<td
										class="py-3 px-4 font-semibold text-gray-900"
									>
										{{ item.jurusan }}
									</td>
									<td
										class="py-3 px-4 text-center font-semibold text-gray-700"
									>
										{{ item.jumlahTimDidanai }}
									</td>
									<td
										class="py-3 px-4 text-right font-bold text-gray-900"
									>
										{{ formatRupiah(item.totalDana) }}
									</td>
									<td class="py-3 px-4 text-center">
										<div
											class="flex items-center justify-center gap-2"
										>
											<span
												class="font-bold text-gray-700"
												>{{ item.percent }}%</span
											>
											<div
												class="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden"
											>
												<div
													class="bg-brand-orange h-full"
													:style="{
														width:
															item.percent + '%',
													}"
												></div>
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
			<div
				v-else-if="authStore.user?.role === 'KLI'"
				class="grid grid-cols-1 lg:grid-cols-2 gap-6"
			>
				<!-- Sebaran Bidang Usaha -->
				<div
					class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70"
				>
					<h4
						class="text-xs font-bold text-gray-800 uppercase tracking-wide"
					>
						Sebaran Kategori / Bidang Usaha Mahasiswa
					</h4>
					<div
						v-if="pmwErrors.categories"
						class="text-xs text-red-500 font-semibold"
					>
						⚠️ {{ pmwErrors.categories }}
					</div>
					<div
						v-else-if="
							!pmwBusinessCategories.data ||
							pmwBusinessCategories.data.length === 0
						"
						class="text-xs text-gray-400"
					>
						Tidak ada data kategori usaha.
					</div>
					<div v-else class="space-y-3">
						<div
							v-for="cat in pmwBusinessCategories.data"
							:key="cat.bidangUsaha"
							class="flex flex-col"
						>
							<div
								class="flex justify-between text-xs font-semibold text-gray-700 mb-1"
							>
								<span>{{ cat.bidangUsaha }}</span>
								<span
									>{{ cat.jumlah }} Tim ({{
										cat.percent
									}}%)</span
								>
							</div>
							<div
								class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"
							>
								<div
									class="bg-indigo-500 h-full"
									:style="{ width: cat.percent + '%' }"
								></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Dana Usul vs Rekomendasi -->
				<div
					class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70"
				>
					<h4
						class="text-xs font-bold text-gray-800 uppercase tracking-wide"
					>
						Rasio Dana Usulan vs Rekomendasi Praktisi
					</h4>
					<div
						v-if="pmwErrors.comparison"
						class="text-xs text-red-500 font-semibold"
					>
						⚠️ {{ pmwErrors.comparison }}
					</div>
					<div v-else class="grid grid-cols-1 gap-4">
						<div
							class="flex justify-between items-center p-3 bg-white rounded-xl"
						>
							<span class="text-xs text-gray-500 font-semibold"
								>Rata-rata Usulan Tim:</span
							>
							<span class="font-bold text-gray-900 text-sm">{{
								formatRupiah(
									computedPmwFundingComparison.averageUsulan,
								)
							}}</span>
						</div>
						<div
							class="flex justify-between items-center p-3 bg-white rounded-xl"
						>
							<span class="text-xs text-gray-500 font-semibold"
								>Rata-rata Rekomendasi Reviewer:</span
							>
							<span class="font-bold text-emerald-600 text-sm">{{
								formatRupiah(
									computedPmwFundingComparison.averageRekomendasi,
								)
							}}</span>
						</div>
						<div class="p-3 bg-emerald-50/50 rounded-xl">
							<div
								class="flex justify-between text-xs font-bold text-emerald-800 mb-1"
							>
								<span>Rasio Penyerapan Dana Rekomendasi:</span>
								<span
									>{{
										computedPmwFundingComparison.absorptionRatePercent
									}}%</span
								>
							</div>
							<div
								class="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden"
							>
								<div
									class="bg-emerald-500 h-full"
									:style="{
										width:
											computedPmwFundingComparison.absorptionRatePercent +
											'%',
									}"
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Staff View: Penilaian & Kelengkapan Berkas Tim Lolos -->
			<div
				v-else-if="authStore.user?.role === 'STAFF'"
				class="grid grid-cols-1 lg:grid-cols-2 gap-6"
			>
				<!-- Penilaian Reviewer -->
				<div
					class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70"
				>
					<h4
						class="text-xs font-bold text-gray-800 uppercase tracking-wide"
					>
						Progres Penilaian Reviewer PMW
					</h4>
					<div
						v-if="pmwErrors.staff"
						class="text-xs text-red-500 font-semibold"
					>
						⚠️ {{ pmwErrors.staff }}
					</div>
					<div
						v-else-if="pmwReviewerProgress.length === 0"
						class="text-xs text-gray-400"
					>
						Tidak ada progres reviewer.
					</div>
					<div v-else class="space-y-3">
						<div
							v-for="rev in pmwReviewerProgress"
							:key="rev.reviewerId"
							class="flex flex-col"
						>
							<div
								class="flex justify-between text-xs font-semibold text-gray-700 mb-1"
							>
								<span>{{ rev.reviewerName }}</span>
								<span
									>{{ rev.totalReviewed }} /
									{{ rev.totalAssigned }} Tim ({{
										rev.progressPercent
									}}%)</span
								>
							</div>
							<div
								class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"
							>
								<div
									class="bg-emerald-500 h-full"
									:style="{
										width: rev.progressPercent + '%',
									}"
								></div>
							</div>
						</div>
					</div>
				</div>

				<!-- Kelengkapan Berkas -->
				<div
					class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70"
				>
					<h4
						class="text-xs font-bold text-gray-800 uppercase tracking-wide"
					>
						Checklist Kelengkapan Berkas Tim Lolos
					</h4>
					<div
						v-if="pmwErrors.staff"
						class="text-xs text-red-500 font-semibold"
					>
						⚠️ {{ pmwErrors.staff }}
					</div>
					<div
						v-else-if="pmwRequiredDocuments.length === 0"
						class="text-xs text-gray-400"
					>
						Tidak ada berkas terdaftar.
					</div>
					<div v-else class="space-y-3">
						<div
							v-for="doc in pmwRequiredDocuments"
							:key="doc.namaTim"
							class="flex flex-col"
						>
							<div
								class="flex justify-between text-xs font-semibold text-gray-700 mb-1"
							>
								<span>{{ doc.namaTim }}</span>
								<span
									>{{ doc.totalDokumenLengkap }} /
									{{ doc.totalDokumenWajib }} Berkas ({{
										doc.completenessPercent
									}}%)</span
								>
							</div>
							<div
								class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"
							>
								<div
									class="bg-brand-orange h-full"
									:style="{
										width: doc.completenessPercent + '%',
									}"
								></div>
							</div>
							<span
								v-if="
									doc.dokumenKurang &&
									doc.dokumenKurang.length > 0
								"
								class="text-[9px] text-red-500 font-medium -my-1 block"
							>
								Kurang: {{ doc.dokumenKurang.join(", ") }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Combined View (Default Fallback) -->
			<div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div
					class="bg-gray-50/50 p-5 rounded-2xl space-y-4 border border-gray-100/70"
				>
					<h4
						class="text-xs font-bold text-gray-800 uppercase tracking-wide"
					>
						Sebaran Bidang Usaha PMW
					</h4>
					<div
						v-if="pmwErrors.categories"
						class="text-xs text-red-500 font-semibold"
					>
						⚠️ {{ pmwErrors.categories }}
					</div>
					<div
						v-else-if="
							!pmwBusinessCategories.data ||
							pmwBusinessCategories.data.length === 0
						"
						class="text-xs text-gray-400"
					>
						Tidak ada data kategori usaha.
					</div>
					<div v-else class="space-y-3">
						<div
							v-for="cat in pmwBusinessCategories.data"
							:key="cat.bidangUsaha"
							class="flex flex-col"
						>
							<div
								class="flex justify-between text-xs font-semibold text-gray-700 mb-1"
							>
								<span>{{ cat.bidangUsaha }}</span>
								<span>{{ cat.percent }}%</span>
							</div>
							<div
								class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"
							>
								<div
									class="bg-indigo-500 h-full"
									:style="{ width: cat.percent + '%' }"
								></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import api from "../../services/api";

const authStore = useAuthStore();

const loading = ref(true);
const errorMsg = ref("");
const pmwData = ref({});
const pmwGraduationRatio = ref(null);
const pmwBusinessCategories = ref([]);
const pmwFundingComparison = ref(null);
const pmwReviewerProgress = ref([]);
const pmwRequiredDocuments = ref([]);
const pmwErrors = ref({});

const latestPmwGraduationRatio = computed(() => {
	if (!pmwGraduationRatio.value || pmwGraduationRatio.value.length === 0)
		return null;
	return pmwGraduationRatio.value[pmwGraduationRatio.value.length - 1];
});

const computedPmwFundingComparison = computed(() => {
	const list = pmwFundingComparison.value || [];
	if (list.length === 0)
		return {
			averageUsulan: 0,
			averageRekomendasi: 0,
			absorptionRatePercent: 0,
		};
	const totalUsulan = list.reduce(
		(sum, item) => sum + (item.danaUsulan || 0),
		0,
	);
	const totalRekomendasi = list.reduce(
		(sum, item) => sum + (item.danaRekomendasiPraktisi || 0),
		0,
	);
	const averageUsulan = totalUsulan / list.length;
	const averageRekomendasi = totalRekomendasi / list.length;
	const absorptionRatePercent =
		averageUsulan > 0
			? Math.round((averageRekomendasi / averageUsulan) * 1000) / 10
			: 0;
	return { averageUsulan, averageRekomendasi, absorptionRatePercent };
});

function formatRupiah(value) {
	if (value === undefined || value === null) return "-";
	return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

async function loadPmwData() {
	loading.value = true;
	errorMsg.value = "";
	pmwErrors.value = {};

	const promises = [];

	// Default always fetched: dana-per-jurusan
	promises.push(
		api
			.get("/api/v1/dashboard/analytics/pmw/dana-per-jurusan")
			.then((res) => {
				pmwData.value = res.data?.data || res.data || {};
			})
			.catch((err) => {
				pmwErrors.value.dana =
					err.response?.data?.message ||
					err.message ||
					"Gagal memuat alokasi dana PMW";
			}),
	);

	if (authStore.user?.role === "WD3") {
		promises.push(
			api
				.get("/api/v1/dashboard/analytics/pmw/rasio-kelulusan")
				.then((res) => {
					pmwGraduationRatio.value =
						res.data?.data || res.data || null;
				})
				.catch((err) => {
					pmwErrors.value.ratio =
						err.response?.data?.message ||
						err.message ||
						"Gagal memuat rasio kelulusan PMW";
				}),
		);
	} else if (authStore.user?.role === "KLI") {
		promises.push(
			api
				.get("/api/v1/dashboard/analytics/pmw/sebaran-bidang-usaha")
				.then((res) => {
					pmwBusinessCategories.value =
						res.data?.data || res.data || {};
				})
				.catch((err) => {
					pmwErrors.value.categories =
						err.response?.data?.message ||
						err.message ||
						"Gagal memuat bidang usaha PMW";
				}),
		);
		promises.push(
			api
				.get(
					"/api/v1/dashboard/analytics/pmw/dana-usulan-vs-rekomendasi",
				)
				.then((res) => {
					pmwFundingComparison.value =
						res.data?.data || res.data || null;
				})
				.catch((err) => {
					pmwErrors.value.comparison =
						err.response?.data?.message ||
						err.message ||
						"Gagal memuat perbandingan dana PMW";
				}),
		);
	} else if (authStore.user?.role === "STAFF") {
		promises.push(
			api
				.get("/api/v1/dashboard/analytics/pmw/staff-progress")
				.then((res) => {
					pmwReviewerProgress.value =
						res.data?.data?.reviewerProgress || [];
					pmwRequiredDocuments.value =
						res.data?.data?.kelengkapanBerkasTimLolos || [];
				})
				.catch((err) => {
					pmwErrors.value.staff =
						err.response?.data?.message ||
						err.message ||
						"Gagal memuat progres dokumen PMW";
				}),
		);
	}

	try {
		await Promise.all(promises);
	} catch (err) {
		console.error("Error loading PMW details:", err);
		errorMsg.value = "Terjadi kesalahan saat memuat data PMW.";
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	loadPmwData();
});
</script>
