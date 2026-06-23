<template>
  <a v-if="href" :href="href" target="_blank" class="home-item group text-start  no-underline block">
    <div class="flex items-center gap-3">
      <!-- Left Icon -->
      <i :class="[icon, 'icon']" :style="{ color: color }"></i>
      
      <!-- Right Texts -->
      <div>
        <p class="font-semibold m-0 text-gray-900 text-[14px] flex items-center leading-tight">
          {{ title }}
          <i class="fa-regular fa-arrow-right opacity-0 pl-0 w-2.5 group-hover:opacity-100 group-hover:pl-[5px] transition-all duration-100 ease-in text-gray-900"></i>
        </p>
        <p class="m-0 text-xs text-gray-400 group-hover:text-black transition-colors duration-100 leading-tight">
          {{ description }}
        </p>
      </div>
    </div>
  </a>
  <router-link v-else :to="to" class="home-item group text-start  no-underline block">
    <div class="flex items-center gap-3">
      <!-- Left Icon -->
      <i :class="[icon, 'icon']" :style="{ color: color }"></i>
      
      <!-- Right Texts -->
      <div>
        <p class="font-semibold m-0 text-gray-900 text-[14px] flex items-center leading-tight">
          {{ title }}
          <i class="fa-regular fa-arrow-right opacity-0 pl-0 w-2.5 group-hover:opacity-100 group-hover:pl-[5px] transition-all duration-100 ease-in text-gray-900"></i>
        </p>
        <p class="m-0 text-xs text-gray-400 group-hover:text-black transition-colors duration-100 leading-tight">
          {{ description }}
        </p>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    default: ''
  },
  href: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
.home-item {
  font-size: 14px;
  padding: 0.5rem 1rem;
  min-width: 250px;
  cursor: pointer;
}

.home-item .icon {
  width: 50px;
  height: 30px;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
