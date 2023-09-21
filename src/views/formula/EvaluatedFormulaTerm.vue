<script setup lang="ts">
import type { Component } from "vue";
import * as Evaluate from "../../models/FormulaEvaluate";

import EvaluatedFormulaOtherTerm from "./EvaluatedFormulaOtherTerm.vue";
import EvaluatedFormulaDieRollTerm from "./EvaluatedFormulaDieRollTerm.vue";
import EvaluatedFormulaStatTerm from "./EvaluatedFormulaStatTerm.vue";
import EvaluatedFormulaUnaryTerm from "./EvaluatedFormulaUnaryTerm.vue";
import EvaluatedFormulaBinaryTerm from "./EvaluatedFormulaBinaryTerm.vue";

const props = defineProps<{
    term: Evaluate.EvaluatedFormulaTerm
}>();

function getEvaluatedTermComponent(term: Evaluate.EvaluatedFormulaTerm): Component
{
    function visitOtherTerm(term: Evaluate.EvaluatedFormulaStatTerm, param: never): Component
    {
        return EvaluatedFormulaOtherTerm;
    }

    function visitDieRollTerm(term: Evaluate.EvaluatedFormulaDieRollTerm, param: never): Component
    {
        return EvaluatedFormulaDieRollTerm;
    }

    function visitStatTerm(term: Evaluate.EvaluatedFormulaStatTerm, param: never): Component
    {
        return EvaluatedFormulaStatTerm;
    }

    function visitUnaryTerm(term: Evaluate.EvaluatedFormulaUnaryTerm, param: never): Component
    {
        return EvaluatedFormulaUnaryTerm;
    }

    function visitBinaryTerm(term: Evaluate.EvaluatedFormulaBinaryTerm, param: never): Component
    {
        return EvaluatedFormulaBinaryTerm;
    }

    return term.visit({ visitOtherTerm, visitDieRollTerm, visitStatTerm, visitUnaryTerm, visitBinaryTerm }, null);
}

</script>

<template>

<component :is="getEvaluatedTermComponent(term)" :term="term" />

</template>
