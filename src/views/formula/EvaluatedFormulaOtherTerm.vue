<script setup lang="ts">
import * as Evaluate from "../../models/FormulaEvaluate";

const props = defineProps<{
    term: Evaluate.EvaluatedFormulaTerm
}>();
</script>

<template>

{{ term.sourceTerm.source }}

</template>

<style scoped>

</style>