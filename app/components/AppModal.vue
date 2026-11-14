<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        title: string;
        size?: "md" | "lg";
    }>(),
    { size: "md" },
);

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
}>();

const titleId = useId();

function close(): void {
    emit("update:modelValue", false);
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") close();
}

// Listen only while open, and only in the browser (Teleport is client-side).
watch(
    () => props.modelValue,
    (open) => {
        if (!import.meta.client) return;

        if (open) {
            window.addEventListener("keydown", onKeydown);
        } else {
            window.removeEventListener("keydown", onKeydown);
        }
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    if (import.meta.client) {
        window.removeEventListener("keydown", onKeydown);
    }
});
</script>

<template>
    <Teleport to="body">
        <div v-if="modelValue" class="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-default-950/40" aria-hidden="true" @click="close" />

            <div role="dialog" aria-modal="true" :aria-labelledby="titleId" class="card relative z-10 w-full"
                :class="size === 'lg' ? 'max-w-2xl' : 'max-w-lg'">
                <div class="card-header">
                    <h2 :id="titleId" class="card-title">{{ title }}</h2>
                    <AppButton variant="ghost" size="sm" icon aria-label="Close" @click="close">
                        <AppIcon name="close" class="size-4" />
                    </AppButton>
                </div>

                <div class="card-body">
                    <slot />
                </div>

                <div v-if="$slots.footer" class="card-footer justify-end">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </Teleport>
</template>