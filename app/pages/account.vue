<script setup lang="ts">
import type { ApiErrorPayload } from "~/utils/api";
import { toApiError } from "~/utils/api";
import { formatDateTime } from "~/utils/format";

definePageMeta({ middleware: "auth" });

useHead({ title: "Account" });

type TelegramIdentity = {
    telegram_user_id: number;
    telegram_username: string | null;
    verified_at: string | null;
};

type TelegramStatus = {
    linked: boolean;
    identity: TelegramIdentity | null;
};

type LinkCode = {
    code: string;
    expires_at: string;
    expires_in_seconds: number;
};

const request = import.meta.server ? useRequestFetch() : $fetch;

const {
    data: telegram,
    error: statusError,
    pending: statusPending,
    refresh: refreshStatus,
} = await useAsyncData("telegram-status", () =>
    request<TelegramStatus>("/api/telegram"),
);

const linkCode = ref<LinkCode | null>(null);
const codeCopied = ref(false);
const generating = ref(false);
const unlinking = ref(false);
const actionError = ref<ApiErrorPayload | null>(null);

const validMinutes = computed(() =>
    linkCode.value ? Math.round(linkCode.value.expires_in_seconds / 60) : 0,
);

async function generateCode(): Promise<void> {
    if (generating.value) return;

    generating.value = true;
    actionError.value = null;
    codeCopied.value = false;

    try {
        linkCode.value = await $fetch<LinkCode>("/api/telegram/link-codes", {
            method: "POST",
        });
    } catch (cause) {
        actionError.value = toApiError(cause);
    } finally {
        generating.value = false;
    }
}

async function copyCode(): Promise<void> {
    if (!linkCode.value || typeof navigator === "undefined" || !navigator.clipboard) {
        return;
    }

    await navigator.clipboard.writeText(`/link ${linkCode.value.code}`);
    codeCopied.value = true;
}

async function unlink(): Promise<void> {
    if (unlinking.value) return;

    if (
        !window.confirm(
            "Unlink this Telegram account? The bot will stop acting for your account.",
        )
    ) {
        return;
    }

    unlinking.value = true;
    actionError.value = null;

    try {
        await $fetch("/api/telegram", { method: "DELETE" });

        linkCode.value = null;
        await refreshStatus();
    } catch (cause) {
        actionError.value = toApiError(cause);
    } finally {
        unlinking.value = false;
    }
}
</script>

<template>
    <div class="space-y-6">
        <AppPageTitle title="Account" subtitle="Manage how your account connects to other Xibra services." />

        <AppAlert v-if="statusError" tone="error">
            Telegram status could not be loaded. Try refreshing the page.
        </AppAlert>

        <AppAlert v-if="actionError" tone="error">
            {{ actionError.message }}
        </AppAlert>
        <AccountProfileForm />
        <section class="card">
            <div class="card-header">
                <div>
                    <h2 class="card-title">Telegram</h2>
                    <p class="text-xs text-default-400">
                        Use the Xibra bot to check your account and, if you are an owner,
                        create invitations.
                    </p>
                </div>
                <AppButton variant="ghost" size="sm" :loading="statusPending" @click="refreshStatus()">
                    Refresh
                </AppButton>
            </div>

            <div class="card-body space-y-4 text-sm">
                <template v-if="telegram?.linked && telegram.identity">
                    <dl class="grid gap-3 sm:grid-cols-2">
                        <div>
                            <dt class="text-xs text-default-500">Status</dt>
                            <dd>
                                <span class="badge bg-success/10 text-success">Linked</span>
                            </dd>
                        </div>
                        <div>
                            <dt class="text-xs text-default-500">Telegram account</dt>
                            <dd class="font-medium text-default-900">
                                {{
                                    telegram.identity.telegram_username
                                        ? `@${telegram.identity.telegram_username}`
                                        : `ID ${telegram.identity.telegram_user_id}`
                                }}
                            </dd>
                        </div>
                        <div>
                            <dt class="text-xs text-default-500">Linked since</dt>
                            <dd class="font-medium text-default-900">
                                {{ formatDateTime(telegram.identity.verified_at) }}
                            </dd>
                        </div>
                    </dl>

                    <div>
                        <AppButton variant="secondary" size="sm" :loading="unlinking" @click="unlink">
                            Unlink Telegram
                        </AppButton>
                    </div>
                </template>

                <template v-else-if="telegram && !telegram.linked">
                    <p class="text-default-600">
                        Your Telegram account is not linked. Create a link code here, then
                        send it to the bot within 10 minutes.
                    </p>

                    <AppAlert v-if="linkCode" tone="success" title="Link code created">
                        <p class="text-xs">
                            Send this to the bot. The code is shown only once and expires in
                            about {{ validMinutes }} minutes.
                        </p>
                        <p class="mt-3 font-mono text-base font-semibold">
                            /link {{ linkCode.code }}
                        </p>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <AppButton size="sm" variant="secondary" @click="copyCode">
                                {{ codeCopied ? "Copied" : "Copy command" }}
                            </AppButton>
                        </div>
                    </AppAlert>

                    <div>
                        <AppButton :loading="generating" @click="generateCode">
                            {{ linkCode ? "Create a new code" : "Create link code" }}
                        </AppButton>
                    </div>
                </template>

                <p v-else class="text-default-500">Loading Telegram status…</p>
            </div>
        </section>
    </div>
</template>