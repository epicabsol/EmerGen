<script setup lang="ts">

defineProps<{
    source: string,
    effect: string,
    title: string,
}>();

</script>

<template>
    <div class="modification">
        <h3 class="modification-effect">
            {{ effect }}
        </h3>
        <div class="modification-details">
            <p>{{ title }}</p>
            <p class="modification-source">{{ source }}</p>
        </div>
    </div>
</template>

<style scoped>
.modification
{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    padding: 2px;
    margin: 2px;
}

.modification-effect
{
    padding: 4px 12px;
    min-width: 2.5em;
    text-align: right;
}

.modification-details
{
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
}

.modification-source
{
    color: rgba(0, 0, 0, 0.5);
}
</style>