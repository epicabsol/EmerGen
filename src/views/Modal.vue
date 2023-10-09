<script setup lang="ts">

const props = defineProps<{
    modelValue: boolean,
    autoDismiss: boolean,
}>();

const emit = defineEmits<{
    (event: 'update:modelValue', modelValue: boolean): void
}>();

function skirtClicked()
{
    if (props.autoDismiss)
    {
        emit('update:modelValue', false);
    }
}
</script>

<template>
    <Teleport to="#overlay-host">
        <div class="skirt" v-if="modelValue" @click.self="skirtClicked">
            <div class="window">
                <div class="window-title">

                </div>
                <div class="window-content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.skirt
{
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0px;
    top: 0px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    flex-direction: column;
}

.window
{
    margin: 32px;
    background-color: white;
    min-width: 300px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    /*overflow-y: auto;*/
}

.window-title
{

}

.window-content
{
    margin: 15px;
    flex-shrink: 1;
    /*overflow-y: auto;*/

    display: flex;
    flex-direction: column;
    min-height: 0;
}
</style>