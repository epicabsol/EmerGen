<script setup lang="ts">
import * as Evaluate from "../../models/FormulaEvaluate";
import * as Parse from "../../models/FormulaParse";
import EvaluatedFormulaTerm from "./EvaluatedFormulaTerm.vue";

const props = defineProps<{
    term: Evaluate.EvaluatedFormulaUnaryTerm
}>();
</script>

<template>

<span class="unary-operator">{{ (term.sourceTerm as Parse.FormulaUnaryTerm).getOperatorSource() }}</span>

<EvaluatedFormulaTerm :term="term.operandTerm" />

</template>

<style scoped>
.unary-operator
{
    margin: 0px 4px;
}
</style>