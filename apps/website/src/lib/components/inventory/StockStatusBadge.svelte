<script lang="ts">
    import type { StockStatus } from "$lib/types/inventory";

    type Props = {
        status: StockStatus;
        size?: "sm" | "md";
        showDot?: boolean;
    };

    let { status, size = "md", showDot = true }: Props = $props();

    const config = $derived(() => {
        switch (status) {
            case "NORMAL":
                return {
                    label: "Aman",
                    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    dotClass: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
                };
            case "LOW_STOCK":
                return {
                    label: "Stok Menipis",
                    classes: "bg-amber-500/10 text-amber-300 border-amber-500/20",
                    dotClass: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
                };
            case "OUT_OF_STOCK":
                return {
                    label: "Habis",
                    classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                    dotClass: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
                };
            default:
                return {
                    label: "Tidak Diketahui",
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
