<script setup lang="ts">
import AppVM from './viewmodels/AppVM.vue';


</script>

<template>
  <Suspense>
    <AppVM />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>

<style scoped>

</style>
