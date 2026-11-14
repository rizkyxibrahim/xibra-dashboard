<script setup lang="ts">
import type { ApiErrorPayload } from "~/utils/api";
import { fieldError, toApiError } from "~/utils/api";
import { formatDateTime } from "~/utils/format";

definePageMeta({ middleware: ["auth", "owner"] });

useHead({ title: "Invitations" });

type InvitationStatus = "pending" | "redeemed" | "expired" | "revoked";

type InvitationUser = { id: number; name: string; username: string };

type Invitation = {
    id: number;
    status: InvitationStatus;
    note: string | null;
    role: { name: string; label: string } | null;
    created_by: InvitationUser | null;
    redeemed_by: InvitationUser | null;
    revoked_by: InvitationUser | null;
    expires_at: string | null;
    redeemed_at: string | null;
    revoked_at: string | null;
    created_at: string | null;
};

type InvitationPage = {
    items: Invitation[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
};

type CreatedInvitation = {
    invitation: Invitation;
    secrets: { code: string; token: string; link: string | null };
};

const PER_PAGE = 15;

const page = ref(1);
const request = import.meta.server ? useRequestFetch() : $fetch;

const { data, error, pending, refresh } = await useAsyncData(
    "invitations",
    () =>
        request<InvitationPage>(
            `/api/invitations?page=${page.value}&per_page=${PER_PAGE}`,
        ),
    {
        default: () => ({
            items: [],
            meta: { current_page: 1, per_page: PER_PAGE, total: 0, last_page: 1 },
        }),
        watch: [page],
    },
);

const invitations = computed(() => data.value?.items ?? []);
const meta = computed(() => data.value?.meta);

const statusLabels: Record<InvitationStatus, string> = {
    pending: "Pending",
    redeemed: "Redeemed",
    expired: "Expired",
    revoked: "Revoked",
};

const statusClasses: Record<InvitationStatus, string> = {
    pending: "bg-primary/10 text-primary",
    redeemed: "bg-success/15 text-success",
    expired: "bg-warning/15 text-warning",
    revoked: "bg-default-150 text-default-600",
};

function userLabel(user: InvitationUser | null): string {
    return user ? `${user.name} (@${user.username})` : "—";
}

/* ---------- Create (modal) ---------- */

const createOpen = ref(false);
const expiresInHours = ref("");
const note = ref("");
const creating = ref(false);
const formError = ref<ApiErrorPayload | null>(null);

/** The secrets exist only in this component's memory and are never stored. */
const created = ref<CreatedInvitation | null>(null);
const copied = ref(false);

function openCreate(): void {
    formError.value = null;
    createOpen.value = true;
}

async function createInvitation(): Promise<void> {
    if (creating.value) return;

    const hoursRaw = String(expiresInHours.value ?? "").trim();

    if (hoursRaw !== "" && !Number.isInteger(Number(hoursRaw))) {
        formError.value = {
            message: "Check the highlighted fields.",
            code: "VALIDATION_ERROR",
            fields: {
                expires_in_hours: ["Expiration must be a whole number of hours."],
            },
        };

        return;
    }

    creating.value = true;
    formError.value = null;
    created.value = null;
    copied.value = false;

    try {
        const body: Record<string, unknown> = {};

        if (hoursRaw !== "") body.expires_in_hours = Number(hoursRaw);
        if (note.value.trim() !== "") body.note = note.value.trim();

        created.value = await $fetch<CreatedInvitation>("/api/invitations", {
            method: "POST",
            body,
        });

        expiresInHours.value = "";
        note.value = "";
        createOpen.value = false;

        await refresh();
    } catch (cause) {
        formError.value = toApiError(cause);
    } finally {
        creating.value = false;
    }
}

async function copyLink(): Promise<void> {
    const link = created.value?.secrets.link;

    if (!link || typeof navigator === "undefined" || !navigator.clipboard) {
        return;
    }

    await navigator.clipboard.writeText(link);
    copied.value = true;
}

async function shareLink(): Promise<void> {
    const current = created.value;
    const link = current?.secrets.link;

    if (!current || !link) return;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
            await navigator.share({
                title: "Undangan Xibra",
                text: `Undangan Xibra. Kode: ${current.secrets.code}`,
                url: link,
            });

            return;
        } catch {
            // Cancelled or unsupported: fall through to copying.
        }
    }

    await copyLink();
}

/* ---------- Detail (modal) ---------- */

const detailId = ref<number | null>(null);
const detail = computed(
    () => invitations.value.find((item) => item.id === detailId.value) ?? null,
);

/* ---------- Revoke (confirmation modal) ---------- */

const revokeTarget = ref<Invitation | null>(null);
const revokingId = ref<number | null>(null);
const actionError = ref<string | null>(null);

async function confirmRevoke(): Promise<void> {
    const target = revokeTarget.value;

    if (!target || revokingId.value !== null) return;

    revokingId.value = target.id;
    actionError.value = null;

    try {
        await $fetch(`/api/invitations/${target.id}/revoke`, { method: "POST" });

        revokeTarget.value = null;
        await refresh();
    } catch (cause) {
        revokeTarget.value = null;
        actionError.value = toApiError(cause).message;
    } finally {
        revokingId.value = null;
    }
}
</script>

<template>
    <div class="space-y-6">
        <AppPageTitle title="Invitations"
            subtitle="Invite people to the platform. Codes and links are one-time and expire.">
            <AppButton size="sm" @click="openCreate">
                <AppIcon name="user-plus" class="size-4" />
                New invitation
            </AppButton>
        </AppPageTitle>

        <AppAlert v-if="created" tone="success" title="Invitation created">
            <p class="text-xs">
                Copy this now. The code and link are shown only once.
            </p>

            <dl class="mt-3 space-y-2 text-sm">
                <div>
                    <dt class="text-xs text-default-500">Code</dt>
                    <dd class="font-mono font-semibold">{{ created.secrets.code }}</dd>
                </div>
                <div v-if="created.secrets.link">
                    <dt class="text-xs text-default-500">Link</dt>
                    <dd class="break-all font-mono text-xs">{{ created.secrets.link }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Expires</dt>
                    <dd>{{ formatDateTime(created.invitation.expires_at) }}</dd>
                </div>
            </dl>

            <div class="mt-3 flex flex-wrap gap-2">
                <AppButton v-if="created.secrets.link" size="sm" variant="secondary" @click="copyLink">
                    <AppIcon name="copy" class="size-4" />
                    {{ copied ? "Copied" : "Copy link" }}
                </AppButton>
                <AppButton v-if="created.secrets.link" size="sm" variant="secondary" @click="shareLink">
                    <AppIcon name="share" class="size-4" />
                    Share
                </AppButton>
                <AppButton size="sm" variant="ghost" @click="created = null">
                    Dismiss
                </AppButton>
            </div>
        </AppAlert>

        <AppAlert v-if="actionError" tone="error">{{ actionError }}</AppAlert>
        <AppAlert v-if="error" tone="error">
            Invitations could not be loaded. Try again shortly.
        </AppAlert>

        <section class="table-card">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-default-200">
                    <thead>
                        <tr class="table-head">
                            <th class="table-cell font-semibold">Status</th>
                            <th class="table-cell font-semibold">Note</th>
                            <th class="table-cell font-semibold">Expires</th>
                            <th class="table-cell font-semibold">Created by</th>
                            <th class="table-cell text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-default-200">
                        <tr v-for="item in invitations" :key="item.id">
                            <td class="table-cell">
                                <span class="badge" :class="statusClasses[item.status]">
                                    {{ statusLabels[item.status] }}
                                </span>
                            </td>
                            <td class="table-cell">{{ item.note ?? "—" }}</td>
                            <td class="table-cell">{{ formatDateTime(item.expires_at) }}</td>
                            <td class="table-cell">
                                {{ item.created_by ? `@${item.created_by.username}` : "—" }}
                            </td>
                            <td class="table-cell">
                                <div class="flex justify-end gap-1">
                                    <AppButton variant="ghost" size="sm" icon
                                        :aria-label="`View invitation #${item.id}`" @click="detailId = item.id">
                                        <AppIcon name="eye" class="size-4" />
                                    </AppButton>
                                    <AppButton v-if="item.status === 'pending'" variant="danger-ghost" size="sm" icon
                                        :aria-label="`Revoke invitation #${item.id}`" :disabled="revokingId === item.id"
                                        @click="revokeTarget = item">
                                        <AppIcon name="trash" class="size-4" />
                                    </AppButton>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p v-if="!pending && invitations.length === 0" class="px-5 py-6 text-sm text-default-500">
                No invitations yet.
            </p>
        </section>

        <div v-if="meta" class="flex flex-wrap items-center justify-between gap-3 text-sm text-default-500">
            <span>
                Page {{ meta.current_page }} of {{ meta.last_page }} · {{ meta.total }} total
            </span>
            <div class="flex gap-2">
                <AppButton size="sm" variant="secondary" :disabled="page <= 1 || pending" @click="page -= 1">
                    Previous
                </AppButton>
                <AppButton size="sm" variant="secondary" :disabled="page >= meta.last_page || pending"
                    @click="page += 1">
                    Next
                </AppButton>
            </div>
        </div>

        <!-- Create -->
        <AppModal v-model="createOpen" title="New invitation">
            <form id="create-invitation" class="space-y-4" novalidate @submit.prevent="createInvitation">
                <AppField id="expires-in-hours" v-model="expiresInHours" label="Expires in (hours)" type="number"
                    hint="Between 1 and 72. Leave empty for the default of 24 hours."
                    :error="fieldError(formError, 'expires_in_hours')" />
                <AppField id="invitation-note" v-model="note" label="Note (optional)" hint="Visible to the owner only."
                    :error="fieldError(formError, 'note')" />
                <AppAlert
                    v-if="formError && !fieldError(formError, 'expires_in_hours') && !fieldError(formError, 'note')"
                    tone="error">
                    {{ formError.message }}
                </AppAlert>
            </form>

            <template #footer>
                <AppButton variant="secondary" size="sm" @click="createOpen = false">
                    Cancel
                </AppButton>
                <AppButton type="submit" form="create-invitation" size="sm" :loading="creating">
                    {{ creating ? "Creating…" : "Create invitation" }}
                </AppButton>
            </template>
        </AppModal>

        <!-- Detail -->
        <AppModal :model-value="detail !== null" :title="detail ? `Invitation #${detail.id}` : 'Invitation'" size="lg"
            @update:model-value="(open: boolean) => { if (!open) detailId = null }">
            <dl v-if="detail" class="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                    <dt class="text-xs text-default-500">Status</dt>
                    <dd>
                        <span class="badge" :class="statusClasses[detail.status]">
                            {{ statusLabels[detail.status] }}
                        </span>
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Role</dt>
                    <dd class="font-medium text-default-900">{{ detail.role?.label ?? "—" }}</dd>
                </div>
                <div class="sm:col-span-2">
                    <dt class="text-xs text-default-500">Note</dt>
                    <dd class="text-default-900">{{ detail.note ?? "—" }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Created by</dt>
                    <dd class="text-default-900">{{ userLabel(detail.created_by) }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Created</dt>
                    <dd class="text-default-900">{{ formatDateTime(detail.created_at) }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Expires</dt>
                    <dd class="text-default-900">{{ formatDateTime(detail.expires_at) }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Redeemed by</dt>
                    <dd class="text-default-900">{{ userLabel(detail.redeemed_by) }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Redeemed at</dt>
                    <dd class="text-default-900">
                        {{ detail.redeemed_at ? formatDateTime(detail.redeemed_at) : "—" }}
                    </dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Revoked by</dt>
                    <dd class="text-default-900">{{ userLabel(detail.revoked_by) }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-default-500">Revoked at</dt>
                    <dd class="text-default-900">
                        {{ detail.revoked_at ? formatDateTime(detail.revoked_at) : "—" }}
                    </dd>
                </div>
            </dl>

            <template #footer>
                <AppButton variant="secondary" size="sm" @click="detailId = null">
                    Close
                </AppButton>
            </template>
        </AppModal>

        <!-- Revoke confirmation -->
        <AppModal :model-value="revokeTarget !== null" title="Revoke invitation?"
            @update:model-value="(open: boolean) => { if (!open) revokeTarget = null }">
            <p class="text-sm text-default-700">
                Invitation #{{ revokeTarget?.id }} will stop working immediately. Its
                link and code cannot be used after this, and this cannot be undone.
            </p>

            <template #footer>
                <AppButton variant="secondary" size="sm" @click="revokeTarget = null">
                    Cancel
                </AppButton>
                <AppButton variant="danger" size="sm" :loading="revokingId !== null" @click="confirmRevoke">
                    Revoke
                </AppButton>
            </template>
        </AppModal>
    </div>
</template>