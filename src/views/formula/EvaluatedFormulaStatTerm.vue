<script setup lang="ts">
import * as Evaluate from "../../models/FormulaEvaluate";

const props = defineProps<{
    term: Evaluate.EvaluatedFormulaStatTerm
}>();
</script>

<template>
<div class="stat-container">
    <div class="stat-number">
        {{ term.value }}
    </div>
    <div class="stat-id">
        {{ term.resolvedStatId ?? '???' }}
    </div>
</div>
</template>

<style scoped>
.stat-container
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

.stat-number
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

.stat-id
{
    color: rgba(0, 0, 0, 0.6);
}
</style>