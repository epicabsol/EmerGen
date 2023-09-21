<script setup lang="ts">

import * as Evaluate from "../../models/FormulaEvaluate";
import EvaluatedFormulaTerm from "./EvaluatedFormulaTerm.vue";

const props = defineProps<{
    result: Evaluate.FormulaEvaluationResult
}>();

const emit = defineEmits<{
    (e: 'reroll'): void,
    (e: 'edit'): void,
}>();

</script>

<template>

<div class="formula-row">
    <div class="formula-source-row">
        <div class="formula-source">
            {{ result.formula }}
        </div>

        <div class="padding"></div>

        <button @click="emit('reroll')">Reroll</button>
        <button @click="emit('edit')">Edit</button>
    </div>


    <div v-if="result.details.success" class="formula-body">
        <div v-if="result.details.success" class="formula-elements">

            <EvaluatedFormulaTerm :term="result.details.rootTerm" />
        </div>

        <h2 v-if="result.details.success" class="formula-result">
            = <span class="formula-number">{{ result.details.value }}</span>
        </h2>
    </div>

    <!--<div v-if="!result.details.success">
        {{ JSON.stringify(result.messages) }}
    </div>-->
    <div v-if="result.messages.length > 0">
        {{ JSON.stringify(result.messages) }}
    </div>
</div>

</template>

<style scoped>
.formula-row
{
    display: flex;
    flex-direction: column;
    padding: 8px 8px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.formula-source-row
{
    display: flex;
    flex-direction: row;
    align-items: center;
}

.formula-source-row button
{
    margin: 2px;
    display: none;
}

.formula-row:hover .formula-source-row button
{
    display: unset;
}

.padding
{
    flex-grow: 1;
}

.formula-source
{
    background-color: white;
    border-radius: 4px;
    padding: 4px;
    display: inline;
    align-self: flex-start;
}

.formula-body
{
    display: flex;
    flex-direction: row;
    padding-top: 4px;
}

.formula-elements
{
    display: flex;
    flex-direction: row;
    padding: 8px;
    justify-content: flex-end;
    flex-grow: 1;
    flex-shrink: 1;
    align-items: flex-start;
    margin: 8px 0px;
}

.formula-result
{
    align-self: end;
    flex-shrink: 0;
    
    position: relative;
    top: -38px;
}

.formula-number
{
    display: inline-block;
    min-width: 2em;
    height: 2em;
    padding: 0.5em;
    text-align: center;
    background-color: white;
    border-radius: 4px;
}
</style>