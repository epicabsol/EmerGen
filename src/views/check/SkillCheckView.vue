<script setup lang="ts">
import type { SkillCheck } from "@/models/SkillCheck";
import CharacterSheet from "@/models/CharacterSheet";
import * as Check from "@/models/SkillCheck";
import { computed } from "vue";


const props = defineProps<{
    check: SkillCheck,
    characterSheet: CharacterSheet,
}>();

const isSuccess = computed(() => props.check.isSuccess());
const successDegree = computed(() => props.check.getSuccessDegree());
const criticalDegree = computed(() => props.check.getCriticalDegree());
const criticalDescription = computed(() => props.check.getCriticalDegree() >= 2 ? 'Double critical' : 'Critical');

</script>

<template>

    <div :class="{ 'check-container': true, 'check-crit': criticalDegree > 0 }">

        <div class="check-row">
            <div class="check-column">
                <p>{{ characterSheet.getStatistic(check.statId)?.displayName }}</p>
            </div>
        </div>

        <div class="check-row">
            <div class="check-column">
                
                <h1 class="check-valuebox">
                    {{ check.skillEvaluation.finalValue }}
                </h1>
            </div>

            <h2 class="check-center">
                <em>vs</em>
            </h2>

            <div class="check-column">
                
                <h1 class="check-valuebox">
                    {{ check.dieRoll }}
                </h1>
            </div>
        </div>

        <div class="check-row">
            <div class="check-column">
                <h5 class="check-subtitle">Effective Skill Value</h5>

            </div>

            <div class="check-center">

            </div>

            <div class="check-column">
                <h5 class="check-subtitle">1d{{ Check.getDifficultyDieSides(check.getEffectiveDifficulty().rollDifficulty) }}</h5>
            </div>
        </div>
        <div class="check-row">
            <div class="check-column">

            </div>

            <div class="check-center">
                <br />
                <div>
                    <p>{{ isSuccess ? 'Success' : 'Failure' }} by {{ Math.abs(successDegree) }} degree{{ Math.abs(successDegree) != 1 ? 's' : ''}}</p>
                    <h5 v-if="criticalDegree > 0">{{ criticalDescription }} success!</h5>
                </div>
                <br />
            </div>

            <div class="check-column check-timestamp">
                <h5 class="check-subtitle">(time rolled)</h5>
            </div>
        </div>
    </div>

</template>

<style scoped>
.check-container
{
    background-color: rgba(0, 0, 0, 0.1);
    margin: 4px;
    padding: 4px;
}

.check-container.check-crit
{
    background-color: rgba(50, 150, 50, 0.1);
}

.check-row
{
    display: flex;
    align-items: center;
    justify-content: stretch;
}

.check-column
{
    flex: 1 1 0px;
    text-align: center;
}

.check-center
{
    width: 0px;
    position: relative;
    white-space: nowrap;
    text-align: center;
}

.check-center > *
{
    transform: translate(-50%, -50%);
    position: absolute;
}

.check-valuebox
{
    display: inline-block;
    padding: 8px;
    border-radius: 4px;
    background: white;
    min-width: 1.5em;
    text-align: center;
}

.check-subtitle
{
    color: rgba(0, 0, 0, 0.5);
    margin: 2px;
}

.check-timestamp
{
    align-self: end;
    text-align: right;
    padding: 0px;
}
</style>