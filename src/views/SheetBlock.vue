<script setup lang="ts">

defineProps<{
    displayName: string,
}>();
</script>

<template>
<div class="sheet-block">
    <h2 class="sheet-title">{{ displayName }}</h2>
    <div class="sheet-content">
        <slot></slot>
    </div>
</div>

</template>

<style>
.sheet-block
{
    display: flex;
    flex-direction: row;
    margin: 4px;
}

.sheet-title
{
    display: inline;
    writing-mode: vertical-lr;
    text-orientation: sideways;
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.4);
    font-weight: bold;
    padding: 4px 4px 4px 4px;
    /*background-color: rgba(0, 0, 0, 0.4);*/
}

.sheet-content
{
    padding: 4px 8px 4px 4px;
    background-color: rgba(0, 0, 0, 0.1);
    flex-grow: 1;
}

.sheet-fixed
{
    flex-grow: 0;
}
</style>