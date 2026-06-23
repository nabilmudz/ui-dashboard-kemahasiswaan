<template>
  <div class="flex flex-col select-none border border-gray-200 rounded-lg overflow-hidden bg-white text-xs">
    
    <!-- Loading and Error State -->
    <div v-if="loading" class="p-12 text-center flex flex-col items-center justify-center">
      <div class="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-xs text-gray-400 font-semibold">Memuat timeline program...</p>
    </div>

    <div v-else-if="error || events.length === 0" class="p-12 text-center text-gray-400 font-semibold">
      <i class="fa-regular fa-calendar-xmark text-xl text-gray-300 mb-2 block"></i>
      Tidak ada data timeline program aktif untuk ditampilkan saat ini.
    </div>

    <!-- Timeline Grid -->
    <div v-else class="flex">
      <!-- Left Resource Sidebar Column (Dynamic rows based on programs) -->
      <div class="w-[140px] shrink-0 border-r border-gray-200 bg-gray-50/50 flex flex-col">
        <!-- Corner spacer header -->
        <div class="h-[60px] border-b border-gray-200 flex items-center px-3 font-bold text-gray-500 uppercase tracking-wide">
          Program
        </div>
        <!-- Resource rows -->
        <div class="flex-1 flex flex-col">
          <div v-for="(row, idx) in rows" :key="idx"
            class="h-12 border-b border-gray-100 flex items-center px-3 font-semibold text-gray-700 hover:bg-gray-100/30 truncate"
            :title="row"
          >
            <i class="fa-solid fa-angle-right text-[9px] text-brand-orange mr-1.5 shrink-0"></i>
            {{ row }}
          </div>
        </div>
      </div>

      <!-- Right Scrollable Timeline Grid -->
      <div class="flex-1 overflow-x-auto relative no-scrollbar" ref="gridScrollRef">

        <!-- Timeline Header -->
        <div class="flex min-w-max border-b border-gray-200" style="height: 60px;">
          <div v-for="day in days" :key="day.isoStr"
            class="w-[60px] shrink-0 border-r border-gray-150 flex flex-col items-center justify-center p-1 bg-gray-50/20"
            :class="{ 'bg-brand-orange/5': isToday(day.isoStr) }"
          >
            <span class="font-bold text-gray-800 text-[13px]">{{ String(day.date).padStart(2, '0') }}</span>
            <span class="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{{ day.dayName.substring(0, 3) }}</span>
          </div>
        </div>

        <!-- Grid Body Content -->
        <div class="relative min-w-max flex-1" :style="{ height: (rows.length * 48) + 'px' }">

          <!-- Column grid lines background -->
          <div class="absolute inset-0 flex pointer-events-none z-0">
            <div v-for="day in days" :key="'line-' + day.isoStr" class="w-[60px] shrink-0 border-r border-gray-100 h-full">
            </div>
          </div>

          <!-- Row grid lines background -->
          <div class="absolute inset-0 flex flex-col pointer-events-none z-0">
            <div v-for="i in rows.length" :key="'row-line-' + i" class="h-12 border-b border-gray-100 w-full"></div>
          </div>

          <!-- SVG Dependency Connection Lines Layer -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6"
                orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#cbd5e1" />
              </marker>
            </defs>
            <path v-for="(path, idx) in connectorPaths" :key="idx" :d="path" fill="none" stroke="#cbd5e1"
              stroke-width="1.5" marker-end="url(#arrow)" />
          </svg>

          <!-- Interactive Task Bars Layer -->
          <div class="absolute inset-0 z-20 pointer-events-none">
            <div v-for="task in tasks" :key="task.id"
              class="absolute h-[32px] rounded-[16px] border flex items-center px-3 shadow-sm cursor-pointer select-none text-white pointer-events-auto transition-transform hover:scale-[1.02]"
              :class="task.themeClass" :style="getTaskStyle(task)"
              :title="`${task.name} (${formatDate(task.startDateStr)} - ${formatDate(task.endDateStr)})`"
              @click="openLink(task.deepLinkUrl)"
            >
              <!-- Circle Badge -->
              <div
                class="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[10px] mr-1.5 shrink-0"
                :class="task.textTheme">
                {{ task.badge }}
              </div>
              <!-- Label -->
              <span class="font-bold truncate text-[10px] uppercase tracking-wider">{{ task.name }}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../../services/api';

const events = ref([]);
const loading = ref(true);
const error = ref(false);

const calendarStartDate = ref(new Date());

// Generate 30 days window from start date
const days = computed(() => {
  const list = [];
  const base = new Date(calendarStartDate.value);
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const isoStr = `${year}-${month}-${date}`;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    list.push({
      isoStr,
      date: d.getDate(),
      dayName: dayNames[d.getDay()]
    });
  }
  return list;
});

// Resource rows (unique programs list)
const rows = computed(() => {
  const unique = new Set();
  events.value.forEach(ev => {
    if (ev.programName) {
      unique.add(ev.programName);
    }
  });
  return Array.from(unique);
});

// Dynamic tasks derived from API
const tasks = computed(() => {
  const list = [];
  events.value.forEach((ev, idx) => {
    const rIdx = rows.value.indexOf(ev.programName);
    if (rIdx === -1) return;

    const evStart = new Date(ev.startDate);
    const evEnd = new Date(ev.endDate);
    evStart.setHours(0,0,0,0);
    evEnd.setHours(0,0,0,0);

    let startIndex = -1;
    let endIndex = -1;

    days.value.forEach((day, dIdx) => {
      const dayDate = new Date(day.isoStr);
      dayDate.setHours(0,0,0,0);
      if (dayDate.getTime() === evStart.getTime()) {
        startIndex = dIdx;
      }
      if (dayDate.getTime() === evEnd.getTime()) {
        endIndex = dIdx;
      }
    });

    // Clamp start/end index if dates fall outside calendar range
    const calStart = new Date(days.value[0].isoStr);
    calStart.setHours(0,0,0,0);
    const calEnd = new Date(days.value[days.value.length - 1].isoStr);
    calEnd.setHours(0,0,0,0);

    if (startIndex === -1 && evStart.getTime() < calStart.getTime() && evEnd.getTime() >= calStart.getTime()) {
      startIndex = 0;
    }
    if (endIndex === -1 && evEnd.getTime() > calEnd.getTime() && evStart.getTime() <= calEnd.getTime()) {
      endIndex = days.value.length - 1;
    }

    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
      const theme = getAppTheme(ev.appSource);
      list.push({
        id: `${ev.programId || 'ev'}-${idx}`,
        name: ev.phase || ev.programName,
        row: rIdx,
        startIndex,
        endIndex,
        badge: ev.appSource === 'BEASISWA' ? 'P' : ev.appSource === 'PRESTASI' ? 'L' : ev.appSource === 'KA_ORMAWA' ? 'K' : (ev.appSource ? ev.appSource.charAt(0) : 'E'),
        themeClass: theme.bg,
        textTheme: theme.text,
        deepLinkUrl: ev.deepLinkUrl,
        startDateStr: ev.startDate,
        endDateStr: ev.endDate,
        appSource: ev.appSource
      });
    }
  });
  return list;
});

// Auto connections within consecutive program phases
const connections = computed(() => {
  const list = [];
  const programGroups = {};

  tasks.value.forEach(t => {
    const key = `${t.appSource}-${t.row}`;
    if (!programGroups[key]) programGroups[key] = [];
    programGroups[key].push(t);
  });

  Object.values(programGroups).forEach(group => {
    // Sort by chronological start index
    group.sort((a, b) => a.startIndex - b.startIndex);
    for (let i = 0; i < group.length - 1; i++) {
      list.push({
        from: group[i].id,
        to: group[i+1].id
      });
    }
  });
  return list;
});

const colWidth = 60;
const rowHeight = 48;

function getTaskStyle(task) {
  const left = task.startIndex * colWidth + 5;
  const width = (task.endIndex - task.startIndex + 1) * colWidth - 10;
  const top = task.row * rowHeight + 8; // vertically centered in 48px row

  return {
    left: `${left}px`,
    width: `${width}px`,
    top: `${top}px`
  };
}

// Compute path coordinates for consecutive phase linking lines
const connectorPaths = computed(() => {
  return connections.value.map(conn => {
    const fromTask = tasks.value.find(t => t.id === conn.from);
    const toTask = tasks.value.find(t => t.id === conn.to);

    if (!fromTask || !toTask) return '';

    const x1 = (fromTask.endIndex + 1) * colWidth - 5;
    const y1 = fromTask.row * rowHeight + (rowHeight / 2);

    const x2 = toTask.startIndex * colWidth + 5;
    const y2 = toTask.row * rowHeight + (rowHeight / 2);

    const dx = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  });
});

function getAppTheme(appSource) {
  switch (appSource) {
    case 'PKM':
      return { bg: 'bg-stripes-orange border-orange-400', text: 'text-orange-500' };
    case 'PMW':
      return { bg: 'bg-stripes-blue border-blue-400', text: 'text-blue-500' };
    case 'BEASISWA':
      return { bg: 'bg-stripes-teal border-teal-400', text: 'text-teal-500' };
    case 'PRESTASI':
      return { bg: 'bg-stripes-red border-red-400', text: 'text-red-500' };
    case 'KA_ORMAWA':
      return { bg: 'bg-stripes-green border-green-400', text: 'text-green-500' };
    case 'SARPRAS':
      return { bg: 'bg-stripes-orange border-orange-400', text: 'text-orange-500' };
    default:
      return { bg: 'bg-stripes-blue border-blue-400', text: 'text-blue-500' };
  }
}

function isToday(isoStr) {
  const today = new Date();
  const d = new Date(isoStr);
  return today.getFullYear() === d.getFullYear() &&
         today.getMonth() === d.getMonth() &&
         today.getDate() === d.getDate();
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return isoStr;
  }
}

function openLink(url) {
  if (url) {
    window.open(url, '_blank');
  }
}

async function fetchTimelines() {
  loading.value = true;
  error.value = false;
  try {
    const response = await api.get('/dashboard/timelines');
    const data = response.data?.data || [];
    events.value = data;

    if (data.length > 0) {
      // Set calendar start date to the earliest event date
      let minDate = new Date();
      data.forEach(ev => {
        const d = new Date(ev.startDate);
        if (!isNaN(d.getTime()) && d.getTime() < minDate.getTime()) {
          minDate = d;
        }
      });
      calendarStartDate.value = minDate;
    }
  } catch (err) {
    console.error('Failed to fetch timelines:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchTimelines();
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
