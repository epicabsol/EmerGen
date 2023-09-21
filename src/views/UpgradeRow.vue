<script setup lang="ts">
import type { UpgradableStat } from '@/models/CharacterSheet';
import UpgradePointsView from '../views/UpgradePointsView.vue';
import type { Ref } from 'vue';

const props = defineProps<{
    stat: Ref<UpgradableStat>
}>();

function segmentsForLevel(index: number): number
{
    if (index < props.stat.value.upgradeLevel)
    {
        return props.stat.value.levelUpPoints[index];
    }
    else if (index > props.stat.value.upgradeLevel)
    {
        return 0;
    }
    else
    {
        return props.stat.value.upgradePoints;
    }
}

</script>

<template>

<div class="upgrade-row">
    <UpgradePointsView v-for="levelPointCount, index in stat.value.levelUpPoints" :segments="levelPointCount" :points="segmentsForLevel(index)" />
    <button v-on:click="stat.value.tryRemoveUpgradePoint">-</button>
    <button v-on:click="stat.value.tryAddUpgradePoint">+</button>
</div>

</template>

<style scoped>
.upgrade-row
{
    display: flex;
    flex-direction: row;
    margin: 2px 0px 4px 0px;
}

.upgrade-row > button
{
    margin: 2px;
}
</style>