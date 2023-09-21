<script setup lang="ts">
import * as Evaluate from "../../models/FormulaEvaluate";
import * as Parse from "../../models/FormulaParse";
import EvaluatedFormulaTerm from "./EvaluatedFormulaTerm.vue";

const props = defineProps<{
    term: Evaluate.EvaluatedFormulaBinaryTerm
}>();
</script>

<template>

<EvaluatedFormulaTerm :term="term.firstOperand" />

<span class="binary-operator">{{ (term.sourceTerm as Parse.FormulaBinaryTerm).getOperatorSource() }}</span>

<EvaluatedFormulaTerm :term="term.secondOperand" />

</template>

<style scoped>
.binary-operator
{
    margin: 0px 4px;
}
</style>