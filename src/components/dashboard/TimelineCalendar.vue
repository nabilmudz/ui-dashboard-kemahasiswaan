<template>
  <div class="flex border border-gray-200 rounded-lg overflow-hidden bg-white text-xs">

    <!-- Left Resource Sidebar Column -->
    <div class="w-[130px] shrink-0 border-r border-gray-250 bg-gray-50/50 flex flex-col">
      <!-- Corner spacer header -->
      <div class="h-[60px] border-b border-gray-200 flex items-center px-3 font-semibold text-gray-500">
        Resources
      </div>
      <!-- Resource rows -->
      <div class="flex-1 flex flex-col">
        <div v-for="(row, idx) in rows" :key="idx"
          class="h-12 border-b border-gray-100 flex items-center px-3 font-medium text-gray-600 hover:bg-gray-100/50 select-none cursor-pointer">
          <i class="fa-solid fa-caret-right text-[10px] text-gray-400 mr-2"></i>
          {{ row }}
        </div>
      </div>
    </div>

    <!-- Right Scrollable Timeline Grid -->
    <div class="flex-1 overflow-x-auto relative no-scrollbar" ref="gridScrollRef" @scroll="syncHeaderScroll">

      <!-- Timeline Header -->
      <div class="flex min-w-max border-b border-gray-200" style="height: 60px;">
        <div v-for="day in days" :key="day.date"
          class="w-[60px] shrink-0 border-r border-gray-150 flex flex-col items-center justify-center p-1 bg-gray-50/20">
          <span class="font-bold text-gray-800 text-[13px]">{{ String(day.date).padStart(2, '0') }}</span>
          <span class="text-[9px] text-gray-400 font-medium uppercase tracking-tight">{{ day.dayName.substring(0, 3)
          }}</span>
        </div>
      </div>

      <!-- Grid Body Content -->
      <div class="relative min-w-max flex-1" style="height: calc(12 * 48px);">

        <!-- Column grid lines background -->
        <div class="absolute inset-0 flex pointer-events-none z-0">
          <div v-for="day in days" :key="'line-' + day.date" class="w-[60px] shrink-0 border-r border-gray-100 h-full">
          </div>
        </div>

        <!-- Row grid lines background -->
        <div class="absolute inset-0 flex flex-col pointer-events-none z-0">
          <div v-for="i in 12" :key="'row-line-' + i" class="h-12 border-b border-gray-100 w-full"></div>
        </div>

        <!-- SVG Dependency Connection Lines Layer -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6"
              orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8" />
            </marker>
          </defs>
          <path v-for="(path, idx) in connectorPaths" :key="idx" :d="path" fill="none" stroke="#cbd5e1"
            stroke-width="1.5" marker-end="url(#arrow)" />
        </svg>

        <!-- Interactive Task Bars Layer -->
        <div class="absolute inset-0 z-20 pointer-events-none">
          <div v-for="task in tasks" :key="task.id"
            class="absolute h-[32px] rounded-[16px] border flex items-center px-2 shadow-sm cursor-pointer select-none text-white pointer-events-auto transition-transform hover:scale-[1.02]"
            :class="task.themeClass" :style="getTaskStyle(task)">
            <!-- Circle Badge -->
            <div
              class="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[10px] mr-1.5 shrink-0"
              :class="task.textTheme">
              {{ task.badge }}
            </div>
            <!-- Label -->
            <span class="font-bold truncate text-[11px] uppercase tracking-wide">{{ task.name }}</span>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Define resources (left sidebar)
const rows = ref([
  'Row 1', 'Row 2', 'Row 3', 'Row 4', 'Row 5',
  'Row 6', 'Row 7', 'Row 8', 'Row 9', 'Row 10',
  'Row 11', 'Row 12'
]);

// Define days in August (Aug 5 to Aug 24)
const days = ref([
  { date: 5, dayName: 'Wednesday' },
  { date: 6, dayName: 'Thursday' },
  { date: 7, dayName: 'Friday' },
  { date: 8, dayName: 'Saturday' },
  { date: 9, dayName: 'Sunday' },
  { date: 10, dayName: 'Monday' },
  { date: 11, dayName: 'Tuesday' },
  { date: 12, dayName: 'Wednesday' },
  { date: 13, dayName: 'Thursday' },
  { date: 14, dayName: 'Friday' },
  { date: 15, dayName: 'Saturday' },
  { date: 16, dayName: 'Sunday' },
  { date: 17, dayName: 'Monday' },
  { date: 18, dayName: 'Tuesday' },
  { date: 19, dayName: 'Wednesday' },
  { date: 20, dayName: 'Thursday' },
  { date: 21, dayName: 'Friday' },
  { date: 22, dayName: 'Saturday' },
  { date: 23, dayName: 'Sunday' },
  { date: 24, dayName: 'Monday' }
]);

// Tasks aligned with user screenshot
const tasks = ref([
  {
    id: 't1',
    name: 'project A',
    row: 0, // Row 1
    startDay: 5,
    endDay: 13,
    badge: 'P',
    themeClass: 'bg-stripes-orange border-orange-400',
    textTheme: 'text-orange-500'
  },
  {
    id: 't2',
    name: 'task 1',
    row: 1, // Row 2
    startDay: 5,
    endDay: 13,
    badge: 'T',
    themeClass: 'bg-stripes-blue border-blue-400',
    textTheme: 'text-blue-500'
  },
  {
    id: 't3',
    name: 'milestone B',
    row: 4, // Row 5
    startDay: 9,
    endDay: 13,
    badge: 'M',
    themeClass: 'bg-stripes-teal border-teal-400',
    textTheme: 'text-teal-500'
  },
  {
    id: 't4',
    name: 'task 2',
    row: 8, // Row 9
    startDay: 14,
    endDay: 17,
    badge: 'T',
    themeClass: 'bg-stripes-red border-red-400',
    textTheme: 'text-red-500'
  },
  {
    id: 't5',
    name: 'project C',
    row: 3, // Row 4
    startDay: 18,
    endDay: 21,
    badge: 'P',
    themeClass: 'bg-stripes-orange border-orange-400',
    textTheme: 'text-orange-500'
  },
  {
    id: 't6',
    name: 'project D',
    row: 5, // Row 6
    startDay: 19,
    endDay: 22,
    badge: 'P',
    themeClass: 'bg-stripes-green border-green-400',
    textTheme: 'text-green-500'
  }
]);

// Dependencies linking tasks
const connections = ref([
  { from: 't3', to: 't4' }, // milestone B (Row 5, Day 13) -> task 2 (Row 9, Day 14)
  { from: 't4', to: 't5' }, // task 2 (Row 9, Day 17) -> project C (Row 4, Day 18)
  { from: 't4', to: 't6' }  // task 2 (Row 9, Day 17) -> project D (Row 6, Day 19)
]);

const colWidth = 60;
const rowHeight = 48;

function getDayIndex(dateNumber) {
  return days.value.findIndex(d => d.date === dateNumber);
}

function getTaskStyle(task) {
  const startIndex = getDayIndex(task.startDay);
  const endIndex = getDayIndex(task.endDay);

  const left = startIndex * colWidth + 5;
  const width = (endIndex - startIndex + 1) * colWidth - 10;
  const top = task.row * rowHeight + 8; // vertically centered in 48px row

  return {
    left: left + 'px',
    width: width + 'px',
    top: top + 'px'
  };
}

// Compute path coordinate curves for SVG markers
const connectorPaths = computed(() => {
  return connections.value.map(conn => {
    const fromTask = tasks.value.find(t => t.id === conn.from);
    const toTask = tasks.value.find(t => t.id === conn.to);

    if (!fromTask || !toTask) return '';

    const fromStartIndex = getDayIndex(fromTask.startDay);
    const fromEndIndex = getDayIndex(fromTask.endDay);
    const toStartIndex = getDayIndex(toTask.startDay);

    // Coordinates
    const x1 = (fromEndIndex + 1) * colWidth - 5;
    const y1 = fromTask.row * rowHeight + (rowHeight / 2);

    const x2 = toStartIndex * colWidth + 5;
    const y2 = toTask.row * rowHeight + (rowHeight / 2);

    // Curved Cubic Bezier path
    const dx = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  });
});

const gridScrollRef = ref(null);

onMounted(() => {
  // Initially scroll to center or starting tasks
  if (gridScrollRef.value) {
    gridScrollRef.value.scrollLeft = 0;
  }
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom background stripes matching the Gantt bars from user image */
.bg-stripes-orange {
  background-color: #ffa857;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.15) 10px, rgba(255, 255, 255, 0.15) 20px);
}

.bg-stripes-blue {
  background-color: #3b82f6;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.15) 10px, rgba(255, 255, 255, 0.15) 20px);
}

.bg-stripes-teal {
  background-color: #14b8a6;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.15) 10px, rgba(255, 255, 255, 0.15) 20px);
}

.bg-stripes-red {
  background-color: #ef4444;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.15) 10px, rgba(255, 255, 255, 0.15) 20px);
}

.bg-stripes-green {
  background-color: #10b981;
  background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.15) 10px, rgba(255, 255, 255, 0.15) 20px);
}
</style>
