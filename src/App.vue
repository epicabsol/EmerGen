<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
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
