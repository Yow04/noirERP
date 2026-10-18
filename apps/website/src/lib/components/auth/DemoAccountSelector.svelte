<script lang="ts">
    import { DEMO_ACCOUNTS } from "$lib/state/auth.svelte";
    import type { DemoAccount } from "$lib/types/auth";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { SparklesIcon } from "@hugeicons/core-free-icons";

    let {
        selectedId = "admin",
        onSelect,
    }: {
        selectedId?: string;
        onSelect: (account: DemoAccount) => void;
    } = $props();
</script>

<div class="bg-black/30 border border-white/5 rounded-xl p-2.5 mb-5 flex flex-col gap-2">
    <div class="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
        <HugeiconsIcon icon={SparklesIcon} size={14} class="text-zinc-400" />
        <span>Akun Demo Cepat</span>
    </div>
    <div class="grid grid-cols-3 gap-1.5">
        {#each DEMO_ACCOUNTS as acc}
            {@const isActive = selectedId === acc.id}
            <button
                type="button"
                class="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-[11px] font-medium border transition-all truncate {isActive
                    ? 'bg-white/10 text-white border-white/25 font-semibold'
                    : 'bg-white/[0.02] text-zinc-400 border-white/5 hover:bg-white/[0.06] hover:text-zinc-200'}"
                onclick={() => onSelect(acc)}
                title="{acc.name} ({acc.role})"
            >
                <span
                    class="size-1.5 rounded-full {isActive ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'bg-zinc-600'}"
                ></span>
                <span class="truncate">{acc.label}</span>
            </button>
        {/each}
    </div>
</div>
