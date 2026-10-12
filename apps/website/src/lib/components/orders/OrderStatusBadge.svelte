<script lang="ts">
    import type { PurchaseStatus } from "$lib/types/purchase";
    import type { SalesStatus } from "$lib/types/sales";

    type Props = {
        status: PurchaseStatus | SalesStatus;
        size?: "sm" | "md";
        showDot?: boolean;
    };

    let { status, size = "md", showDot = true }: Props = $props();

    const config = $derived(() => {
        switch (status) {
            case "DRAFT":
                return {
                    label: "Draft",
                    classes: "bg-amber-500/10 text-amber-300 border-amber-500/25",
                    dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
                };
            case "RECEIVED":
                return {
                    label: "Diterima",
                    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
                    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
                };
            case "COMPLETED":
                return {
                    label: "Selesai",
                    classes: "bg-sky-500/10 text-sky-400 border-sky-500/25",
                    dotClass: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]",
                };
            case "CANCELLED":
                return {
                    label: "Dibatalkan",
                    classes: "bg-rose-500/10 text-rose-400 border-rose-500/25",
                    dotClass: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
                };
            default:
                return {
                    label: status,
                    classes: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
                    dotClass: "bg-zinc-400",
                };
        }
    });
</script>

<span
    class="inline-flex items-center gap-1.5 rounded-full border font-medium tracking-wide transition-colors {config().classes} {size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'}"
>
    {#if showDot}
        <span class="h-1.5 w-1.5 rounded-full {config().dotClass}"></span>
    {/if}
    <span>{config().label}</span>
</span>
