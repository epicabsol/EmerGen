<script setup lang="ts">
import type { Ref } from 'vue';
import CharacterSheet, { type IStat } from '../models/CharacterSheet';
import { type IGameData } from '../models/GameData';

defineProps<{
    stat: Ref<IStat>
}>();

</script>

<template>
    <div class="stat-box">
        <h4 class="stat-id">{{ stat.value.id }}</h4>
        <!--<h1 :title="character.evaluateStatistic(statisticId).modifications.map(mod => `${mod.amount} - ${mod.displayName} (${mod.displayFormula})`).join(`\n`)">{{ character.evaluateStatistic(statisticId).finalValue }}</h1>-->
        <h1>{{ stat.value.getValue() }}</h1>
    </div>
</template>

<style scoped>
.stat-box
{
    display: flex;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 1.0);
    text-align: center;
    min-width: 3em;
    border-radius: 4px;
}

.stat-id
{
    color: rgba(0, 0, 0, 0.6);
}
</style>