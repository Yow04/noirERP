<script lang="ts">
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        AlertCircleIcon,
        Invoice01Icon,
        ShoppingCart01Icon,
        ArrowRight01Icon,
    } from "@hugeicons/core-free-icons";
    import type { DashboardData } from "$lib/types/dashboard";
    import type { PurchaseSummary } from "$lib/types/purchase";
    import type { SalesSummary } from "$lib/types/sales";
    import { formatCurrency } from "$lib/utils";
    import {
        DashboardHero,
        DashboardStats,
        FinancialOverviewCard,
        StockAlertsCard,
        RecentProductsCard,
        DashboardSkeleton,
    } from "$lib/components/dashboard";

    let data: DashboardData | null = $state(null);
    let purchaseSummary: PurchaseSummary | null = $state(null);
    let salesSummary: SalesSummary | null = $state(null);
    let loading = $state(true);
    let error = $state("");

    async function loadDashboard() {
        loading = true;
        error = "";
        try {
            const [dashRes, purRes, salRes] = await Promise.all([
                fetch(`${PUBLIC_API_BASE_URL}/dashboard`),
                fetch(`${PUBLIC_API_BASE_URL}/purchases/summary`).catch(() => null),
                fetch(`${PUBLIC_API_BASE_URL}/sales/summary`).catch(() => null),
            ]);

            const result = await dashRes.json();

            if (!dashRes.ok || !result.success) {
                throw new Error(result.message || "Failed to load dashboard");
            }

            data = result.data;

            if (purRes && purRes.ok) {
                const pj = await purRes.json();
                if (pj.success) purchaseSummary = pj.data;
            }
            if (salRes && salRes.ok) {
                const sj = await salRes.json();
                if (sj.success) salesSummary = sj.data;
            }
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Gagal memuat dashboard";
        } finally {
            loading = false;
        }
    }

    onMount(loadDashboard);
</script>

<svelte:head>
    <title>Dashboard | noirERP</title>
    <meta
        name="description"
        content="Dashboard overview noirERP — lihat ringkasan produk, stok, dan performa bisnis."
    />
</svelte:head>

<div class="dashboard-root">
    <!-- Hero Header -->
    <DashboardHero />

    <!-- Error Banner -->
    {#if error}
        <div role="alert" class="error-banner">
            <HugeiconsIcon
                icon={AlertCircleIcon}
                size={18}
                strokeWidth={2}
            />
            <span>{error}</span>
        </div>
    {/if}

    <!-- Content State -->
    {#if loading}
        <DashboardSkeleton />
    {:else if data}
        <!-- Primary Stats Grid -->
        <DashboardStats
            totalProducts={data.totalProducts}
            totalCategories={data.totalCategories}
            totalUsers={data.totalUsers}
            totalStock={data.totalStock}
        />

        <!-- Operations & Commerce Quick Overview -->
        <section class="commerce-section">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Sales Quick Card -->
                <div class="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md hover:border-zinc-700/80 transition-all group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                                <HugeiconsIcon icon={Invoice01Icon} size={20} />
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold text-white">Transaksi Penjualan (SO)</h3>
                                <p class="text-xs text-zinc-400">Pencatatan kasir & pemotongan stok otomatis</p>
                            </div>
                        </div>
                        <a href="/sales" class="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Buka Penjualan <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                        </a>
                    </div>
                    <div class="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800/60">
                        <div>
                            <span class="text-[11px] text-zinc-500 block">Total SO</span>
                            <span class="text-base font-bold text-white">{salesSummary?.totalOrders ?? 0}</span>
                        </div>
                        <div>
                            <span class="text-[11px] text-zinc-500 block">Hari Ini</span>
                            <span class="text-base font-bold text-sky-400">{salesSummary?.todayTransactions ?? 0} trx</span>
                        </div>
                        <div>
                            <span class="text-[11px] text-zinc-500 block">Total Omset</span>
                            <span class="text-base font-bold text-emerald-400">{formatCurrency(salesSummary?.totalRevenue ?? 0)}</span>
                        </div>
                    </div>
                </div>

                <!-- Purchase Quick Card -->
                <div class="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md hover:border-zinc-700/80 transition-all group">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                                <HugeiconsIcon icon={ShoppingCart01Icon} size={20} />
                            </div>
                            <div>
                                <h3 class="text-sm font-semibold text-white">Pesanan Pembelian (PO)</h3>
                                <p class="text-xs text-zinc-400">Pengadaan barang dari vendor ke gudang</p>
                            </div>
                        </div>
                        <a href="/purchases" class="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Buka Pembelian <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                        </a>
                    </div>
                    <div class="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-800/60">
                        <div>
                            <span class="text-[11px] text-zinc-500 block">Total PO</span>
                            <span class="text-base font-bold text-white">{purchaseSummary?.totalOrders ?? 0}</span>
                        </div>
                        <div>
                            <span class="text-[11px] text-zinc-500 block">Menunggu Terima</span>
                            <span class="text-base font-bold text-amber-300">{purchaseSummary?.draftOrders ?? 0} draft</span>
                        </div>
                        <div>
                            <span class="text-[11px] text-zinc-500 block">Total Pembelian</span>
                            <span class="text-base font-bold text-violet-400">{formatCurrency(purchaseSummary?.totalPurchaseValue ?? 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Financial & Stock Alerts Section -->
        <section class="detail-section">
            <div class="detail-grid">
                <FinancialOverviewCard
                    inventoryValue={data.inventoryValue}
                    potentialRevenue={data.potentialRevenue}
                />
                <StockAlertsCard
                    lowStockCount={data.lowStockCount}
                    outOfStockCount={data.outOfStockCount}
                />
            </div>
        </section>

        <!-- Recent Products Section -->
        <section class="recent-section">
            <RecentProductsCard products={data.recentProducts} />
        </section>
    {/if}
</div>

<style>
    .dashboard-root {
        width: 100%;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 1360px;
        margin: 0 auto;
    }

    .error-banner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        background: oklch(0.25 0.08 25);
        border: 1px solid oklch(0.4 0.12 25);
        color: oklch(0.85 0.1 25);
        font-size: 0.875rem;
    }

    .detail-section {
        width: 100%;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.25rem;
    }

    .recent-section {
        width: 100%;
    }

    @media (max-width: 768px) {
        .dashboard-root {
            padding: 1rem;
            gap: 1.25rem;
        }

        .detail-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }
</style>
