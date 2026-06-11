<template>
  <section class="p-12 relative select-none min-h-full">
    <!-- Yellow Header Banner -->
    <div class="absolute w-full h-[200px] top-0 left-0 right-0 z-0" style="background-color: #f9d428;"></div>
    
    <!-- Welcome Header Texts -->
    <div class="relative z-10 text-white mb-6">
      <h1 class="font-bold m-0 text-white text-[56px] tracking-tight leading-none">Selamat Datang di,</h1>
      <p class="font-semibold text-black mt-1 text-base">Farraskuy Shop</p>
    </div>
    
    <!-- Card 1: Reusable Quick Menu -->
    <div class="relative z-10 rounded-lg bg-white p-4 shadow-sm flex flex-wrap" style="gap: 0 20px;">
      <!-- As requested, leave only 1 example of category and item on Home -->
      <QuickMenuCard title="Menu Barang">
        <QuickMenuItem 
          to="/barang" 
          icon="fa-duotone fa-box" 
          color="purple" 
          title="Data Barang" 
          description="Daftar Barang-barang" 
        />
      </QuickMenuCard>
    </div>

    <!-- Card 2: Timeline Calendar (Gantt Scheduler) -->
    <div class="relative z-10 rounded-lg bg-white p-4 shadow-sm mt-6">
      <p class="font-semibold mb-1 text-[14px] text-gray-900 select-none">Timeline Calendar</p>
      <TimelineCalendar />
    </div>

    <!-- Card 3: Task & Schedule Status Table -->
    <div class="relative z-10 rounded-lg bg-white p-4 shadow-sm mt-6">
      <p class="font-semibold mb-1 text-[14px] text-gray-900 select-none">Task & Schedule Status</p>
      <TaskTable />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import QuickMenuCard from '../components/dashboard/QuickMenuCard.vue';
import QuickMenuItem from '../components/dashboard/QuickMenuItem.vue';
import TimelineCalendar from '../components/dashboard/TimelineCalendar.vue';
import TaskTable from '../components/dashboard/TaskTable.vue';

const authStore = useAuthStore();
</script>

<style scoped>
h1 {
  font-family: Poppins, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: -1.68px;
}
</style>
