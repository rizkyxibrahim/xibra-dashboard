<script setup lang="ts">
import type { AuthUser } from "~/composables/useAuth";

const props = defineProps<{
  user: AuthUser | null;
  signingOut?: boolean;
}>();

const emit = defineEmits<{ signOut: [] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const initials = computed(() => {
  const source = props.user?.name?.trim();
  if (!source) return "X";

  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
});

const roleLabel = computed(
  () =>
    props.user?.roles.map((role) => role.label).join(", ") || "Member",
);

function close() {
  open.value = false;
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value) return;
  if (root.value && !root.value.contains(event.target as Node)) close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") close();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown);
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("keydown", onKeydown);
});

function handleSignOut() {
  close();
  emit("signOut");
}
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      @click="open = !open"
    >
      <span
        class="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
      <span class="hidden text-left sm:block">
        <span class="block max-w-40 truncate text-sm font-semibold text-default-900">
          {{ user?.name ?? "Unknown user" }}
        </span>
        <span class="block max-w-40 truncate text-xs text-default-500">
          {{ roleLabel }}
        </span>
      </span>
      <AppIcon
        name="chevron-down"
        class="size-4 text-default-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-default-200 bg-card p-2 shadow-lg"
      role="menu"
    >
      <div class="px-3 py-2">
        <p class="truncate text-sm font-semibold text-default-900">
          {{ user?.name ?? "Unknown user" }}
        </p>
        <p class="truncate text-xs text-default-500">
          @{{ user?.username ?? "unknown" }}
        </p>
        <p class="mt-2 inline-flex badge bg-primary/10 text-primary">
          {{ roleLabel }}
        </p>
      </div>

      <div class="my-1 border-t border-default-200" />

      <button
        type="button"
        role="menuitem"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-default-600 transition-colors hover:bg-default-100 hover:text-default-900 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="signingOut"
        @click="handleSignOut"
      >
        <AppIcon name="log-out" class="size-4" />
        {{ signingOut ? "Signing out…" : "Sign out" }}
      </button>
    </div>
  </div>
</template>
