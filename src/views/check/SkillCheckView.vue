<script setup lang="ts">
import type { SkillCheck } from "@/models/SkillCheck";


defineProps<{
    check: SkillCheck,
}>();

</script>

<template>

    <div class="check-container">
        <div class="check-column">
            skill stuff
        </div>

        <div>
            vs
        </div>

        <div class="check-column">
            difficulty stuff
        </div>
    </div>

</template>

<style scoped>
.check-container
{
    display: flex;
    align-items: center;
    justify-content: stretch;

    background-color: rgba(0, 0, 0, 0.1);
    margin: 4px;
}

.check-column
{
    flex: 1 1 0px;
}
</style>