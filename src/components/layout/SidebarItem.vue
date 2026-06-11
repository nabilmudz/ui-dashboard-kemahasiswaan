<template>
  <!-- Single Menu Item -->
  <li v-if="!children || children.length === 0" class="relative list-none">
    <router-link 
      :to="to" 
      class="nav-button mx-[10px] my-[5px] rounded-[5px] flex items-center transition-all duration-500 select-none text-[13px] font-semibold text-black no-underline"
      :class="[
        isActive ? 'bg-[#ffeeaf]' : 'bg-white hover:bg-[#ffeeaf]'
      ]"
    >
      <!-- Icon Wrapper -->
      <div class="w-[60px] h-[45px] flex items-center justify-center text-[18px] shrink-0 text-black">
        <i :class="icon"></i>
      </div>
      <!-- Label -->
      <span 
        class="transition-opacity duration-300 whitespace-nowrap text-black font-semibold"
        :class="[isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100']"
      >
        {{ label }}
      </span>
    </router-link>

    <!-- Sub Menu Tooltip for Collapsed State -->
    <ul 
      v-if="isCollapsed" 
      class="absolute left-full top-[10px] -translate-y-[5%] ml-0 bg-[#ffeeaf] py-[3px] px-[20px] rounded-[0_6px_6px_0] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400 z-50 whitespace-nowrap list-none shadow-none border-0"
    >
      <li class="font-semibold text-[13px] text-black">{{ label }}</li>
    </ul>
  </li>

  <!-- Multi-Level Menu Dropdown Item -->
  <li 
    v-else 
    class="relative list-none group" 
    :class="{ 'showMenu': isExpanded }"
  >
    <!-- Toggle Header -->
    <div 
      class="nav-button mx-[10px] my-[5px] rounded-[5px] flex items-center justify-between transition-all duration-500 text-[13px] font-semibold cursor-pointer select-none text-black bg-white hover:bg-[#ffeeaf]"
      :class="[
        isSubrouteActive ? 'bg-[#ffeeaf]' : ''
      ]"
      @click="toggleExpand"
    >
      <div class="flex items-center">
        <!-- Icon Wrapper -->
        <div class="w-[60px] h-[45px] flex items-center justify-center text-[18px] shrink-0 text-black">
          <i :class="icon"></i>
        </div>
        <!-- Label -->
        <span 
          class="transition-opacity duration-300 whitespace-nowrap text-black font-semibold"
          :class="[isCollapsed ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100']"
        >
          {{ label }}
        </span>
      </div>
      
      <!-- Arrow Icon -->
      <i 
        v-if="!isCollapsed" 
        class="fa-regular fa-angle-down transition-transform duration-300 text-xs mr-3 text-black"
        :class="{ 'rotate-180': isExpanded }"
      ></i>
    </div>

    <!-- Submenu Accordion for Expanded State (Matching original styling) -->
    <ul 
      v-if="!isCollapsed"
      v-show="isExpanded"
      class="bg-[#f8f9fa] rounded-[5px] mx-[10px] -mt-[5px] py-[5px] pl-[20px] select-none list-none border-0 shadow-none"
    >
      <li v-for="child in children" :key="child.to" class="list-none">
        <router-link 
          :to="child.to" 
          class="block py-[10px] px-[20px] rounded-[5px] text-[13px] font-semibold hover:bg-black/5 text-black no-underline"
          :class="[
            route.path === child.to ? 'bg-black/5' : ''
          ]"
        >
          <div class="flex items-center gap-2">
            <span :class="[child.icon, 'text-[15px] w-[17px] flex justify-center']"></span>
            <span>{{ child.label }}</span>
          </div>
        </router-link>
      </li>
    </ul>

    <!-- Floating Submenu for Collapsed State (Matches minimized absolute popover) -->
    <ul 
      v-else 
      class="absolute left-full top-[10px] ml-0 bg-white border border-gray-250 py-[10px] px-[10px] rounded-[0_6px_6px_0] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-50 min-w-[190px] list-none shadow-none"
    >
      <li class="px-[10px] py-[3px] text-[13px] font-semibold text-black border-b border-black/5 mb-1 select-none">{{ label }}</li>
      <li v-for="child in children" :key="child.to" class="list-none">
        <router-link 
          :to="child.to" 
          class="flex items-center gap-2 py-[10px] px-[20px] rounded-[5px] text-[13px] font-semibold hover:bg-black/5 text-black no-underline"
          :class="[
            route.path === child.to ? 'bg-black/5' : ''
          ]"
        >
          <span :class="[child.icon, 'text-[15px] w-[17px] flex justify-center']"></span>
          <span>{{ child.label }}</span>
        </router-link>
      </li>
    </ul>
  </li>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps({
  to: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  isCollapsed: {
    type: Boolean,
    default: false
  },
  children: {
    type: Array,
    default: () => []
  }
});

const route = useRoute();
const router = useRouter();
const isExpanded = ref(false);

const isActive = computed(() => {
  if (props.to === '/') {
    return route.path === '/';
  }
  return props.to && route.path.startsWith(props.to);
});

const isSubrouteActive = computed(() => {
  if (!props.children) return false;
  return props.children.some(child => route.path === child.to);
});

watch(
  () => route.path,
  () => {
    if (isSubrouteActive.value && !props.isCollapsed) {
      isExpanded.value = true;
    }
  },
  { immediate: true }
);

watch(
  () => props.isCollapsed,
  (collapsed) => {
    if (collapsed) {
      isExpanded.value = false;
    } else if (isSubrouteActive.value) {
      isExpanded.value = true;
    }
  }
);

function toggleExpand() {
  if (props.isCollapsed) return;
  isExpanded.value = !isExpanded.value;
}
</script>

<style scoped>
.nav-button:hover *,
.nav-button.active * {
  color: black !important;
}
</style>
