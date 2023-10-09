<script setup lang="ts">
import { ref } from 'vue';


const props = defineProps<{
    modelValue: number,
    changeIncrement: number,
    minValue?: number,
    maxValue?: number,
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', modelValue: number): void
}>();

const inputField = ref<HTMLInputElement | null>(null);

function increment()
{
    let newValue = props.modelValue + props.changeIncrement;
    if (props.maxValue !== undefined && props.maxValue < newValue)
    {
        newValue = props.maxValue;
    }

    emit("update:modelValue", newValue);
}

function decrement()
{
    let newValue = props.modelValue - props.changeIncrement;
    if (props.minValue !== undefined && props.minValue > newValue)
    {
        newValue = props.minValue;
    }

    emit("update:modelValue", newValue);
}

function validate(event: Event)
{
    let typedValue = (event.target as HTMLInputElement).valueAsNumber;

    if (props.minValue !== undefined && typedValue < props.minValue)
    {
        typedValue = props.minValue;
    }

    if (props.maxValue !== undefined && typedValue > props.maxValue)
    {
        typedValue = props.maxValue;
    }

    emit("update:modelValue", typedValue);

    inputField.value?.blur();
}

function onKey(event: KeyboardEvent)
{
    if (event.key === "Enter")
    {
        validate(event);
    }
}

</script>

<template>
    <div class="incdec-container">
        <button class="incdec-button" @click="decrement" :disabled="minValue !== undefined && modelValue - changeIncrement < minValue">-</button>
        <input type="number" class="incdec-field" size="1" :value="modelValue" :min="minValue ?? -99" :max="maxValue ?? 99" @blur="validate" @keypress="onKey" @focus="inputField?.select()" ref="inputField">
        <button class="incdec-button" @click="increment" :disabled="maxValue !== undefined && modelValue + changeIncrement > maxValue">+</button>
    </div>
</template>

<style scoped>
.incdec-container
{
    display: flex;
    flex-direction: row;
    align-items: stretch;
}

.incdec-container > *
{
    border-radius: 0;
    border-width: 1px;
}

.incdec-container > *:first-child
{
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
    border-right: none;
}

.incdec-container > *:last-child
{
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    border-left: none;
}

.incdec-button
{
    width: 24px;
    height: 24px;
}

.incdec-field
{
    min-width: 3em;
    text-align: center;
}

/*
 * Hide the updown arrows on numeric input boxes (source: https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp)
 */

/* Chrome, Safari, Edge, Opera */
.incdec-field::-webkit-outer-spin-button,
.incdec-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.incdec-field {
  -moz-appearance: textfield;
  appearance: textfield; /* ??? not sure if this is legit or not */
}
</style>