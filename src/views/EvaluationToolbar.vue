<script setup lang="ts">
import { ref } from 'vue';

/*const props = defineProps<{

}>();*/

const emits = defineEmits<{
    submit: [formula: string]
}>();

const formula = ref("");

function evaluate()
{
    emits("submit", formula.value);

    formula.value = "";
}

</script>

<template>

<div>
    <form class="toolbar-outer" v-on:submit.prevent="evaluate">
        <input v-model="formula" class="toolbar-textbox" type="text" placeholder="Formula">

        <button class="toolbar-button" type="submit">Evaluate</button>
    </form>
</div>

</template>

<style scoped>
.toolbar-outer
{
    margin: 4px;
    background-color: white;
    border-radius: 4px;

    display: flex;
    flex-direction: row;
}

.toolbar-textbox
{
    margin: 4px;
    flex-grow: 1;
}

.toolbar-button
{
    margin: 4px;
}
</style>