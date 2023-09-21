<script setup lang="ts">

defineProps<{
    /**
     * The number of points needed to upgrade.
     */
    segments: number;
    points: number;
}>();

function dashArray(segments: number): string
{
    const circumference = 31.41592;
    const strokeDash = (1 / segments * circumference);
    return `${strokeDash} ${circumference}`;
}

</script>

<template>
<svg class="upgrade-view" width="20" height="20" viewBox="-10 -10 20 20" transform="rotate(-90)">
    <!-- Fills -->
    <circle v-for="i in points" r="5" cx="0" cy="0" :stroke="segments == points ? 'black' : 'gray'" fill="none" stroke-width="10" :stroke-dasharray="dashArray(segments)" :transform="'rotate(' + (i - 1) * 360 / segments + ')'" />
    
    <!-- Outline -->
    <circle r="10" cx="0" cy="0" fill="none" stroke="black" />

    <!-- Spokes -->
    <line v-for="i in (segments > 1 ? segments : 0)" x1="0" y1="0" :x2="10 * Math.cos(i / segments * 3.141592 * 2)" :y2="10 * Math.sin(i / segments * 3.141592 * 2)" stroke="black" />
</svg>
</template>

<style scoped>
.upgrade-view
{
    overflow: visible;
    margin: 1px;
}
</style>