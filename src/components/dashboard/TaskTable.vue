<template>
  <div class="flex flex-col select-none">
    <!-- Table Wrapper -->
    <div class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-200">
            <th class="py-3 px-4 font-bold text-gray-700 w-12 text-center">No</th>
            <th class="py-3 px-4 font-bold text-gray-700">ID</th>
            <th class="py-3 px-4 font-bold text-gray-700">Nama Pekerjaan</th>
            <th class="py-3 px-4 font-bold text-gray-700">Sumber Daya</th>
            <th class="py-3 px-4 font-bold text-gray-700">Tgl Mulai</th>
            <th class="py-3 px-4 font-bold text-gray-700">Tgl Selesai</th>
            <th class="py-3 px-4 font-bold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr 
            v-for="(task, index) in tasks" 
            :key="task.id" 
            class="hover:bg-gray-50/50 transition-colors"
          >
            <td class="py-3 px-4 text-center text-gray-400 font-medium">{{ index + 1 }}</td>
            <td class="py-3 px-4 font-semibold text-gray-800 font-mono">{{ task.id.toUpperCase() }}</td>
            <td class="py-3 px-4 font-semibold text-gray-900">
              <span 
                class="inline-block w-2.5 h-2.5 rounded-full mr-2" 
                :class="task.indicatorClass"
              ></span>
              {{ task.name }}
            </td>
            <td class="py-3 px-4 text-gray-600 font-medium">Row {{ task.row + 1 }}</td>
            <td class="py-3 px-4 text-gray-500 font-medium">05 Aug 2026</td>
            <td class="py-3 px-4 text-gray-500 font-medium">{{ task.endDay }} Aug 2026</td>
            <td class="py-3 px-4">
              <span 
                class="px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide"
                :class="task.statusBadge"
              >
                {{ task.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const tasks = ref([
  {
    id: 't1',
    name: 'project A',
    row: 0,
    endDay: 13,
    status: 'In Progress',
    indicatorClass: 'bg-orange-400',
    statusBadge: 'bg-orange-50 text-orange-600'
  },
  {
    id: 't2',
    name: 'task 1',
    row: 1,
    endDay: 13,
    status: 'In Progress',
    indicatorClass: 'bg-blue-400',
    statusBadge: 'bg-blue-50 text-blue-600'
  },
  {
    id: 't3',
    name: 'milestone B',
    row: 4,
    endDay: 13,
    status: 'Completed',
    indicatorClass: 'bg-teal-400',
    statusBadge: 'bg-teal-50 text-teal-600'
  },
  {
    id: 't4',
    name: 'task 2',
    row: 8,
    endDay: 17,
    status: 'Pending',
    indicatorClass: 'bg-red-400',
    statusBadge: 'bg-red-50 text-red-600'
  },
  {
    id: 't5',
    name: 'project C',
    row: 3,
    endDay: 21,
    status: 'Pending',
    indicatorClass: 'bg-orange-400',
    statusBadge: 'bg-orange-50 text-orange-600'
  },
  {
    id: 't6',
    name: 'project D',
    row: 5,
    endDay: 22,
    status: 'Pending',
    indicatorClass: 'bg-green-400',
    statusBadge: 'bg-green-50 text-green-600'
  }
]);
</script>

<style scoped>
</style>
