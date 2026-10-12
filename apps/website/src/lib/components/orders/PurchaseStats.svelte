<script lang="ts">
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        ShoppingCart01Icon,
        Clock01Icon,
        CheckmarkCircle02Icon,
        MoneyBag01Icon,
    } from "@hugeicons/core-free-icons";
    import type { PurchaseSummary } from "$lib/types/purchase";
    import { formatCurrency } from "$lib/utils";

    type Props = {
        summary: PurchaseSummary | null;
        loading?: boolean;
    };

    let { summary, loading = false }: Props = $props();

    function formatNumber(num: number): string {
        return new Intl.NumberFormat("id-ID").format(num);
    }
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Card 1: Total Purchase Orders -->
    <div class="stat-card group">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Pesanan (PO)</span>
            <div class="icon-wrap bg-violet-500/10 text-violet-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={ShoppingCart01Icon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-white">
                    {formatNumber(summary?.totalOrders ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-zinc-500">Semua pesanan pembelian</p>
        </div>
    </div>

    <!-- Card 2: PO Draft (Menunggu Penerimaan) -->
    <div class="stat-card group border-amber-500/20 bg-gradient-to-b from-amber-500/[0.04] to-transparent">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-300/90 uppercase tracking-wider">PO Menunggu</span>
            <div class="icon-wrap bg-amber-500/15 text-amber-300 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={Clock01Icon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-20 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-amber-300">
                    {formatNumber(summary?.draftOrders ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-amber-400/70">Status Draft / Belum Masuk Stok</p>
        </div>
    </div>

    <!-- Card 3: PO Diterima -->
    <div class="stat-card group border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.04] to-transparent">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-emerald-300/90 uppercase tracking-wider">PO Diterima</span>
            <div class="icon-wrap bg-emerald-500/15 text-emerald-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-20 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-emerald-400">
                    {formatNumber(summary?.receivedOrders ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-emerald-400/70">Barang sudah masuk inventaris</p>
        </div>
    </div>

    <!-- Card 4: Total Nilai Pembelian -->
    <div class="stat-card group">
        <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Pembelian</span>
            <div class="icon-wrap bg-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
                <HugeiconsIcon icon={MoneyBag01Icon} size={18} strokeWidth={2} />
            </div>
        </div>
        <div class="mt-3">
            {#if loading}
                <div class="h-8 w-32 bg-white/5 rounded animate-pulse"></div>
            {:else}
                <div class="text-2xl font-bold tracking-tight text-white">
                    {formatCurrency(summary?.totalPurchaseValue ?? 0)}
                </div>
            {/if}
            <p class="mt-1 text-xs text-zinc-500">Akumulasi PO diterima</p>
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
