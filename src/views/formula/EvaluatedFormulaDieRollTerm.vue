<script setup lang="ts">
import * as Evaluate from "../../models/FormulaEvaluate";

const props = defineProps<{
    term: Evaluate.EvaluatedFormulaDieRollTerm
}>();
</script>

<template>

<div class="die-container">
    <div class="die-results">
        <div class="die-result" v-for="dieValue, index in term.diceValues">
            <span v-if="index > 0">
                +
            </span>

            <div :class="{ 'die-number': true, 'success': dieValue == term.dieSides, 'failure': dieValue == 1 }">
                {{ dieValue }}
            </div>
        </div>
    </div>

    <div class="die-formula">
        {{ term.sourceTerm.source }}
    </div>
</div>

</template>

<style scoped>
.die-container
{
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 8px 8px 4px 8px;

    /* An attempt to align baseline of first row of values with that of surrounding terms */
    margin-top: calc(-9px - 0.5em);
    margin-left: 8px;
    margin-right: 8px;
}

.die-results
{
    margin-bottom: 4px;
}

.die-result
{
    display: inline;
}

.die-number
{
    display: inline-block;
    min-width: 2em;
    height: 2em;
    padding: 0.5em;
    text-align: center;
    background-color: white;
    border-radius: 4px;

    margin: 2px 0px;
}

.die-number.success
{
    background-color: rgb(200, 255, 200);
}

.die-number.failure
{
    background-color: rgb(255, 200, 200);
}

.die-formula
{
    color: rgba(0, 0, 0, 0.6);
}
</style>