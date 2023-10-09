<script setup lang="ts">
import { nextTick, ref } from 'vue';

const isVisible = ref(false);
const dropdownElement = ref<HTMLElement | null>(null);

defineExpose({
    isVisible,
    setVisible,
});

function setVisible(visible: boolean)
{
    const wasVisible = isVisible.value;
    

    isVisible.value = visible;

    if (visible && !wasVisible)
    {
        nextTick(() => 
        {
            dropdownElement.value?.focus();
        });
    }
    else if (!visible && wasVisible)
    {
        dropdownElement?.value?.blur();
    }
}

</script>

<template>
    <div class="outer">
        <div class="activator" @mousedown.prevent="setVisible(!isVisible)">
            <slot name="activator"></slot>
        </div>
        <div v-if="isVisible" class="dropdown" ref="dropdownElement" @blur="setVisible(false)" tabindex="-1">
            <slot>

            </slot>
        </div>
    </div>
</template>

<style scoped>
.outer
{
    position: relative;
    /*display: inline-block;*/
}

.activator
{
    cursor: pointer;
}

.dropdown
{
    position: absolute;
    left: 0px;
    top: 100%;
    min-width: 100%;
    z-index: 1;
    background: white;
}

.dropdown:focus
{
    outline: none;
}

</style>