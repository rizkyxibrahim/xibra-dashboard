<script setup lang="ts">
import type { ApiErrorPayload } from "~/utils/api";
import { fieldError, toApiError } from "~/utils/api";

const user = useAuthUser();

const form = reactive({
    name: user.value?.name ?? "",
    username: user.value?.username ?? "",
    phone: user.value?.phone ?? "",
});

const saving = ref(false);
const saved = ref(false);
const formError = ref<ApiErrorPayload | null>(null);

async function save(): Promise<void> {
    if (saving.value) return;

    saving.value = true;
    saved.value = false;
    formError.value = null;

    try {
        await $fetch("/api/me/profile", {
            method: "PATCH",
            body: { ...form },
        });

        // Refresh the shared user state so the header and overview match.
        await loadAuthUser();

        saved.value = true;
    } catch (cause) {
        formError.value = toApiError(cause);
    } finally {
        saving.value = false;
    }
}
</script>

<template>
    <section class="card">
        <div class="card-header">
            <div>
                <h2 class="card-title">Profile</h2>
                <p class="text-xs text-default-400">
                    Your name, username, and phone number.
                </p>
            </div>
        </div>

        <form class="card-body space-y-4" novalidate @submit.prevent="save">
            <AppField id="profile-name" v-model="form.name" label="Name" :error="fieldError(formError, 'name')" />
            <AppField id="profile-username" v-model="form.username" label="Username"
                hint="Lowercase letters, numbers, dots, underscores, and hyphens. 3 to 32 characters."
                :error="fieldError(formError, 'username')" />
            <AppField id="profile-phone" v-model="form.phone" label="Phone (optional)"
                :error="fieldError(formError, 'phone')" />

            <p class="text-xs text-default-500">
                Email is shown on the overview. Changing it will be available in a
                later update, because it resets verification.
            </p>

            <AppAlert
                v-if="formError && !fieldError(formError, 'name') && !fieldError(formError, 'username') && !fieldError(formError, 'phone')"
                tone="error">
                {{ formError.message }}
            </AppAlert>
            <AppAlert v-if="saved" tone="success">Profile saved.</AppAlert>

            <div>
                <AppButton type="submit" size="sm" :loading="saving">
                    {{ saving ? "Saving…" : "Save profile" }}
                </AppButton>
            </div>
        </form>
    </section>
</template>