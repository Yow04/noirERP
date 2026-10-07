<script lang="ts">
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { AlertCircleIcon } from "@hugeicons/core-free-icons";
    import type { DashboardData } from "$lib/types/dashboard";
    import {
        DashboardHero,
        DashboardStats,
        FinancialOverviewCard,
        StockAlertsCard,
        RecentProductsCard,
        DashboardSkeleton,
    } from "$lib/components/dashboard";

    let data: DashboardData | null = $state(null);
    let loading = $state(true);
    let error = $state("");

    async function loadDashboard() {
        loading = true;
        error = "";
        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/dashboard`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to load dashboard");
            }

            data = result.data;
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
        min-height: 100dvh;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 1280px;
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
        gap: 1rem;
    }

    .recent-section {
        width: 100%;
    }

    @media (max-width: 768px) {
        .dashboard-root {
            padding: 1rem;
        }

        .detail-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
