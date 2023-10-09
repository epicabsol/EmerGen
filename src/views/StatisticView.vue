<script setup lang="ts">
import type { Ref } from 'vue';
import CharacterSheet, { type IStat } from '../models/CharacterSheet';
import { type IGameData } from '../models/GameData';

defineProps<{
    stat: IStat,
    mini?: boolean,
}>();

</script>

<template>
    <div :class="{ 'stat-box': true, 'mini': mini }">
        <h4 class="stat-id">{{ stat.id }}</h4>
        <!--<h1 :title="character.evaluateStatistic(statisticId).modifications.map(mod => `${mod.amount} - ${mod.displayName} (${mod.displayFormula})`).join(`\n`)">{{ character.evaluateStatistic(statisticId).finalValue }}</h1>-->
        <h1 v-if="!mini" class="stat-value">{{ stat.getValue() }}</h1>
        <h4 v-if="mini" class="stat-value">{{ stat.getValue() }}</h4>
    </div>
</template>

<style scoped>
.stat-box
{
    display: inline-flex;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 1.0);
    text-align: center;
    min-width: 3em;
    border-radius: 4px;
}

.stat-box.mini
{
    flex-direction: row;
    align-items: baseline;
    padding: 4px;
    background-color: unset;
}

.stat-id
{
    color: rgba(0, 0, 0, 0.6);
}

.mini > .stat-value
{
    font-weight: bold;
    padding-left: 4px;
}
</style>