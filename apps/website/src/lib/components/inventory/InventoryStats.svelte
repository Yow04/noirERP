<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PackageIcon,
        Layers01Icon,
        AlertCircleIcon,
        PackageOutOfStockIcon,
    } from "@hugeicons/core-free-icons";
    import type { InventorySummary } from "$lib/types/inventory";

    type Props = {
        summary: InventorySummary | null;
        loading?: boolean;
    };

    let { summary, loading = false }: Props = $props();

    function formatNumber(num: number): string {
        return new Intl.NumberFormat("id-ID").format(num);
    }
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Total SKU -->
    <div class="stat-card group">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total SKU</span>
            <div class="icon-wrap bg-violet-500/10 text-violet-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={PackageIcon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-white">
                    {formatNumber(summary?.totalSKUs ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-zinc-500">Produk aktif terdaftar</p>
        </div>
    </div>

    <!-- Card 2: Total Fisik Unit -->
    <div class="stat-card group">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Fisik Unit</span>
            <div class="icon-wrap bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={Layers01Icon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-28 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-white">
                    {formatNumber(summary?.totalStock ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-zinc-500">Unit tersedia di gudang</p>
        </div>
    </div>

    <!-- Card 3: Stok Menipis -->
    <div class="stat-card group border-amber-500/20 bg-gradient-to-b from-amber-500/[0.04] to-transparent">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-300/90 uppercase tracking-wider">Stok Menipis</span>
            <div class="icon-wrap bg-amber-500/15 text-amber-300 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={AlertCircleIcon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-16 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-amber-300">
                    {formatNumber(summary?.lowStockCount ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-amber-400/70">≤ batas stok minimum</p>
        </div>
    </div>

    <!-- Card 4: Stok Habis -->
    <div class="stat-card group border-rose-500/20 bg-gradient-to-b from-rose-500/[0.04] to-transparent">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-rose-300/90 uppercase tracking-wider">Stok Habis</span>
            <div class="icon-wrap bg-rose-500/15 text-rose-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={PackageOutOfStockIcon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-16 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-rose-400">
                    {formatNumber(summary?.outOfStockCount ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-rose-400/70">Perlu restock segera</p>
        </div>
    </div>
</div>

<style>
    .stat-card {
        border-radius: 1rem;
        background: oklch(0.18 0.008 260 / 60%);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid oklch(1 0 0 / 8%);
        padding: 1.25rem;
        transition: all 0.2s ease-in-out;
    }

    .stat-card:hover {
        border-color: oklch(1 0 0 / 14%);
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }

    .icon-wrap {
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
