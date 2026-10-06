<script lang="ts">
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
    } from "$lib/components/ui/card";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PackageIcon,
        TagsIcon,
        UserMultipleIcon,
        WarehouseIcon,
        MoneyBag02Icon,
        ChartLineData02Icon,
        AlertCircleIcon,
        PackageRemoveIcon,
        ArrowRight02Icon,
        DashboardSpeed02Icon,
        Calendar03Icon,
    } from "@hugeicons/core-free-icons";

    type RecentProduct = {
        id: string;
        sku: string;
        name: string;
        sellingPrice: string | number;
        stock: number;
        createdAt: string;
    };

    type DashboardData = {
        totalProducts: number;
        totalCategories: number;
        totalUsers: number;
        totalStock: number;
        inventoryValue: number;
        potentialRevenue: number;
        lowStockCount: number;
        outOfStockCount: number;
        recentProducts: RecentProduct[];
    };

    let data: DashboardData | null = $state(null);
    let loading = $state(true);
    let error = $state("");

    function formatCurrency(value: string | number) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(Number(value));
    }

    function formatDate(dateStr: string) {
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(dateStr));
    }

    function getGreeting(): string {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 17) return "Selamat Siang";
        if (hour < 19) return "Selamat Sore";
        return "Selamat Malam";
    }

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
    <header class="dashboard-header">
        <div class="header-glow"></div>
        <div class="header-content">
            <div class="header-text">
                <div class="header-badge">
                    <HugeiconsIcon
                        icon={DashboardSpeed02Icon}
                        size={14}
                        strokeWidth={2}
                    />
                    <span>Dashboard</span>
                </div>
                <h1>{getGreeting()} 👋</h1>
                <p>Pantau ringkasan bisnis dan kelola inventori Anda dari sini.</p>
            </div>
            <div class="header-actions">
                <Button href="/products/new">
                    <HugeiconsIcon
                        icon={PackageIcon}
                        size={16}
                        strokeWidth={2}
                    />
                    Tambah Produk
                </Button>
                <Button variant="outline" href="/products">
                    Lihat Semua Produk
                    <HugeiconsIcon
                        icon={ArrowRight02Icon}
                        size={16}
                        strokeWidth={2}
                    />
                </Button>
            </div>
        </div>
    </header>

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

    {#if loading}
        <div class="loading-state">
            <div class="loading-grid">
                {#each Array(4) as _}
                    <div class="skeleton-card">
                        <div class="skeleton-line skeleton-sm"></div>
                        <div class="skeleton-line skeleton-lg"></div>
                        <div class="skeleton-line skeleton-md"></div>
                    </div>
                {/each}
            </div>
        </div>
    {:else if data}
        <!-- Primary Stats -->
        <section class="stats-section">
            <div class="stats-grid">
                <Card class="stat-card stat-card-products">
                    <CardContent class="stat-card-inner">
                        <div class="stat-icon stat-icon-products">
                            <HugeiconsIcon
                                icon={PackageIcon}
                                size={22}
                                strokeWidth={1.8}
                            />
                        </div>
                        <div class="stat-data">
                            <p class="stat-label">Total Produk</p>
                            <p class="stat-value">{data.totalProducts}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card class="stat-card stat-card-categories">
                    <CardContent class="stat-card-inner">
                        <div class="stat-icon stat-icon-categories">
                            <HugeiconsIcon
                                icon={TagsIcon}
                                size={22}
                                strokeWidth={1.8}
                            />
                        </div>
                        <div class="stat-data">
                            <p class="stat-label">Kategori</p>
                            <p class="stat-value">{data.totalCategories}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card class="stat-card stat-card-users">
                    <CardContent class="stat-card-inner">
                        <div class="stat-icon stat-icon-users">
                            <HugeiconsIcon
                                icon={UserMultipleIcon}
                                size={22}
                                strokeWidth={1.8}
                            />
                        </div>
                        <div class="stat-data">
                            <p class="stat-label">Pengguna</p>
                            <p class="stat-value">{data.totalUsers}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card class="stat-card stat-card-stock">
                    <CardContent class="stat-card-inner">
                        <div class="stat-icon stat-icon-stock">
                            <HugeiconsIcon
                                icon={WarehouseIcon}
                                size={22}
                                strokeWidth={1.8}
                            />
                        </div>
                        <div class="stat-data">
                            <p class="stat-label">Total Stok</p>
                            <p class="stat-value">
                                {data.totalStock.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>

        <!-- Financial + Alert Section -->
        <section class="detail-section">
            <div class="detail-grid">
                <!-- Financial Overview -->
                <Card class="financial-card">
                    <CardHeader>
                        <div class="card-header-row">
                            <div>
                                <CardTitle>Ringkasan Keuangan</CardTitle>
                                <CardDescription>
                                    Nilai inventori berdasarkan stok saat ini
                                </CardDescription>
                            </div>
                            <div class="card-header-icon financial-icon">
                                <HugeiconsIcon
                                    icon={MoneyBag02Icon}
                                    size={20}
                                    strokeWidth={1.8}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="financial-metrics">
                            <div class="financial-item">
                                <div class="financial-dot financial-dot-cost">
                                </div>
                                <div>
                                    <p class="financial-label">Nilai Modal</p>
                                    <p class="financial-value">
                                        {formatCurrency(data.inventoryValue)}
                                    </p>
                                </div>
                            </div>
                            <div class="financial-divider"></div>
                            <div class="financial-item">
                                <div
                                    class="financial-dot financial-dot-revenue"
                                ></div>
                                <div>
                                    <p class="financial-label">
                                        Potensi Pendapatan
                                    </p>
                                    <p class="financial-value">
                                        {formatCurrency(data.potentialRevenue)}
                                    </p>
                                </div>
                            </div>
                            <div class="financial-divider"></div>
                            <div class="financial-item">
                                <div
                                    class="financial-dot financial-dot-profit"
                                ></div>
                                <div>
                                    <p class="financial-label">Est. Margin</p>
                                    <p class="financial-value financial-profit">
                                        {formatCurrency(
                                            data.potentialRevenue -
                                                data.inventoryValue,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Stock Alerts -->
                <Card class="alert-card">
                    <CardHeader>
                        <div class="card-header-row">
                            <div>
                                <CardTitle>Peringatan Stok</CardTitle>
                                <CardDescription>
                                    Produk yang memerlukan perhatian segera
                                </CardDescription>
                            </div>
                            <div class="card-header-icon alert-icon">
                                <HugeiconsIcon
                                    icon={AlertCircleIcon}
                                    size={20}
                                    strokeWidth={1.8}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="alert-grid">
                            <div class="alert-item alert-item-warning">
                                <div class="alert-item-icon">
                                    <HugeiconsIcon
                                        icon={ChartLineData02Icon}
                                        size={20}
                                        strokeWidth={1.8}
                                    />
                                </div>
                                <div class="alert-item-data">
                                    <p class="alert-item-value">
                                        {data.lowStockCount}
                                    </p>
                                    <p class="alert-item-label">Stok Rendah</p>
                                    <p class="alert-item-sub">≤ 5 unit</p>
                                </div>
                            </div>

                            <div class="alert-item alert-item-danger">
                                <div class="alert-item-icon">
                                    <HugeiconsIcon
                                        icon={PackageRemoveIcon}
                                        size={20}
                                        strokeWidth={1.8}
                                    />
                                </div>
                                <div class="alert-item-data">
                                    <p class="alert-item-value">
                                        {data.outOfStockCount}
                                    </p>
                                    <p class="alert-item-label">Habis</p>
                                    <p class="alert-item-sub">0 unit</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>

        <!-- Recent Products -->
        <section class="recent-section">
            <Card class="recent-card">
                <CardHeader>
                    <div class="card-header-row">
                        <div>
                            <CardTitle>Produk Terbaru</CardTitle>
                            <CardDescription>
                                5 produk terakhir yang ditambahkan
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" href="/products">
                            Lihat Semua
                            <HugeiconsIcon
                                icon={ArrowRight02Icon}
                                size={14}
                                strokeWidth={2}
                            />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {#if data.recentProducts.length === 0}
                        <div class="empty-state">
                            <HugeiconsIcon
                                icon={PackageIcon}
                                size={40}
                                strokeWidth={1.2}
                            />
                            <p class="empty-title">Belum ada produk</p>
                            <p class="empty-sub">
                                Mulai tambahkan produk pertama Anda.
                            </p>
                            <Button href="/products/new" size="sm">
                                Tambah Produk
                            </Button>
                        </div>
                    {:else}
                        <div class="recent-list">
                            {#each data.recentProducts as product (product.id)}
                                <a
                                    href={`/products/${product.id}`}
                                    class="recent-item"
                                >
                                    <div class="recent-item-left">
                                        <div class="recent-item-avatar">
                                            {product.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>
                                        <div class="recent-item-info">
                                            <p class="recent-item-name">
                                                {product.name}
                                            </p>
                                            <p class="recent-item-sku">
                                                {product.sku}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="recent-item-right">
                                        <p class="recent-item-price">
                                            {formatCurrency(
                                                product.sellingPrice,
                                            )}
                                        </p>
                                        <div class="recent-item-meta">
                                            <span
                                                class="stock-badge"
                                                class:stock-ok={product.stock >
                                                    5}
                                                class:stock-low={product.stock >
                                                    0 && product.stock <= 5}
                                                class:stock-out={product.stock ===
                                                    0}
                                            >
                                                {product.stock} stok
                                            </span>
                                            <span class="recent-item-date">
                                                <HugeiconsIcon
                                                    icon={Calendar03Icon}
                                                    size={12}
                                                    strokeWidth={2}
                                                />
                                                {formatDate(product.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            {/each}
                        </div>
                    {/if}
                </CardContent>
            </Card>
        </section>
    {/if}
</div>

<style>
    /* ─── Root Layout ─── */
    .dashboard-root {
        min-height: 100dvh;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 1280px;
        margin: 0 auto;
    }

    /* ─── Hero Header ─── */
    .dashboard-header {
        position: relative;
        border-radius: 1rem;
        padding: 2rem 2.5rem;
        background: linear-gradient(
            135deg,
            oklch(0.22 0.02 280) 0%,
            oklch(0.18 0.01 260) 50%,
            oklch(0.15 0 0) 100%
        );
        overflow: hidden;
        border: 1px solid oklch(1 0 0 / 6%);
    }

    .header-glow {
        position: absolute;
        top: -50%;
        right: -20%;
        width: 400px;
        height: 400px;
        background: radial-gradient(
            circle,
            oklch(0.55 0.15 280 / 15%) 0%,
            transparent 70%
        );
        pointer-events: none;
    }

    .header-content {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        background: oklch(1 0 0 / 8%);
        border: 1px solid oklch(1 0 0 / 10%);
        font-size: 0.75rem;
        font-weight: 500;
        color: oklch(0.8 0.08 280);
        margin-bottom: 0.75rem;
        backdrop-filter: blur(8px);
    }

    .header-text h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: oklch(0.97 0 0);
        letter-spacing: -0.025em;
        line-height: 1.2;
    }

    .header-text p {
        margin-top: 0.5rem;
        color: oklch(0.7 0 0);
        font-size: 0.9rem;
        max-width: 400px;
    }

    .header-actions {
        display: flex;
        gap: 0.625rem;
        flex-shrink: 0;
        align-items: center;
    }

    /* ─── Error Banner ─── */
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

    /* ─── Loading Skeleton ─── */
    .loading-state {
        padding: 0;
    }

    .loading-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
    }

    .skeleton-card {
        border-radius: 0.75rem;
        background: oklch(0.2 0 0);
        border: 1px solid oklch(1 0 0 / 6%);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .skeleton-line {
        border-radius: 0.375rem;
        background: linear-gradient(
            90deg,
            oklch(0.25 0 0) 25%,
            oklch(0.3 0 0) 50%,
            oklch(0.25 0 0) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-sm {
        height: 0.75rem;
        width: 40%;
    }
    .skeleton-lg {
        height: 1.75rem;
        width: 60%;
    }
    .skeleton-md {
        height: 0.625rem;
        width: 80%;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }

    /* ─── Stats Grid ─── */
    .stats-section {
        /* no extra padding */
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
    }

    :global(.stat-card) {
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        cursor: default;
    }

    :global(.stat-card:hover) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px oklch(0 0 0 / 30%);
    }

    :global(.stat-card-inner) {
        display: flex !important;
        align-items: center !important;
        gap: 1rem !important;
        padding: 1.25rem !important;
    }

    .stat-icon {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon-products {
        background: oklch(0.45 0.15 280 / 15%);
        color: oklch(0.7 0.15 280);
    }
    .stat-icon-categories {
        background: oklch(0.55 0.15 170 / 15%);
        color: oklch(0.7 0.15 170);
    }
    .stat-icon-users {
        background: oklch(0.55 0.12 50 / 15%);
        color: oklch(0.75 0.12 50);
    }
    .stat-icon-stock {
        background: oklch(0.55 0.15 140 / 15%);
        color: oklch(0.7 0.15 140);
    }

    .stat-label {
        font-size: 0.8rem;
        color: var(--muted-foreground);
        font-weight: 500;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        margin-top: 0.125rem;
    }

    /* ─── Detail Section ─── */
    .detail-section {
        /* none */
    }

    .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }

    .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }

    .card-header-icon {
        flex-shrink: 0;
        width: 38px;
        height: 38px;
        border-radius: 0.625rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .financial-icon {
        background: oklch(0.55 0.15 140 / 12%);
        color: oklch(0.7 0.15 140);
    }

    .alert-icon {
        background: oklch(0.6 0.18 50 / 12%);
        color: oklch(0.75 0.18 50);
    }

    /* Financial Metrics */
    .financial-metrics {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .financial-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .financial-dot {
        flex-shrink: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-top: 0.375rem;
    }

    .financial-dot-cost {
        background: oklch(0.65 0.12 250);
    }
    .financial-dot-revenue {
        background: oklch(0.7 0.15 140);
    }
    .financial-dot-profit {
        background: oklch(0.75 0.18 150);
    }

    .financial-label {
        font-size: 0.8rem;
        color: var(--muted-foreground);
        font-weight: 500;
    }

    .financial-value {
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: -0.015em;
        margin-top: 0.125rem;
    }

    .financial-profit {
        color: oklch(0.7 0.15 150);
    }

    .financial-divider {
        height: 1px;
        background: var(--border);
    }

    /* Alert Grid */
    .alert-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
    }

    .alert-item {
        border-radius: 0.75rem;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        transition: transform 0.2s ease;
    }

    .alert-item:hover {
        transform: translateY(-1px);
    }

    .alert-item-warning {
        background: oklch(0.55 0.15 80 / 8%);
        border: 1px solid oklch(0.55 0.15 80 / 15%);
        color: oklch(0.8 0.12 80);
    }

    .alert-item-danger {
        background: oklch(0.55 0.18 25 / 8%);
        border: 1px solid oklch(0.55 0.18 25 / 15%);
        color: oklch(0.8 0.15 25);
    }

    .alert-item-icon {
        opacity: 0.7;
    }

    .alert-item-value {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        line-height: 1;
    }

    .alert-item-label {
        font-size: 0.85rem;
        font-weight: 600;
    }

    .alert-item-sub {
        font-size: 0.75rem;
        opacity: 0.6;
    }

    /* ─── Recent Products ─── */
    .recent-section {
        /* none */
    }

    .recent-list {
        display: flex;
        flex-direction: column;
    }

    .recent-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.875rem 0.25rem;
        border-bottom: 1px solid var(--border);
        text-decoration: none;
        color: inherit;
        transition:
            background-color 0.15s ease,
            padding-left 0.15s ease;
        border-radius: 0.375rem;
        gap: 1rem;
    }

    .recent-item:last-child {
        border-bottom: none;
    }

    .recent-item:hover {
        background: oklch(1 0 0 / 3%);
        padding-left: 0.75rem;
        padding-right: 0.75rem;
    }

    .recent-item-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 0;
    }

    .recent-item-avatar {
        flex-shrink: 0;
        width: 38px;
        height: 38px;
        border-radius: 0.625rem;
        background: linear-gradient(
            135deg,
            oklch(0.4 0.12 280),
            oklch(0.3 0.08 260)
        );
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        font-weight: 700;
        color: oklch(0.9 0.05 280);
    }

    .recent-item-info {
        min-width: 0;
    }

    .recent-item-name {
        font-weight: 600;
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .recent-item-sku {
        font-size: 0.75rem;
        color: var(--muted-foreground);
        font-family: ui-monospace, monospace;
        margin-top: 0.125rem;
    }

    .recent-item-right {
        text-align: right;
        flex-shrink: 0;
    }

    .recent-item-price {
        font-weight: 600;
        font-size: 0.875rem;
    }

    .recent-item-meta {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        margin-top: 0.25rem;
        justify-content: flex-end;
    }

    .stock-badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.125rem 0.5rem;
        border-radius: 999px;
    }

    .stock-ok {
        background: oklch(0.5 0.12 150 / 12%);
        color: oklch(0.7 0.14 150);
    }

    .stock-low {
        background: oklch(0.55 0.15 80 / 12%);
        color: oklch(0.8 0.12 80);
    }

    .stock-out {
        background: oklch(0.55 0.18 25 / 12%);
        color: oklch(0.8 0.15 25);
    }

    .recent-item-date {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.7rem;
        color: var(--muted-foreground);
    }

    /* ─── Empty State ─── */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        color: var(--muted-foreground);
        gap: 0.5rem;
    }

    .empty-title {
        font-weight: 600;
        color: var(--foreground);
        margin-top: 0.5rem;
    }

    .empty-sub {
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
    }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
        .dashboard-root {
            padding: 1rem;
        }

        .dashboard-header {
            padding: 1.5rem;
        }

        .header-content {
            flex-direction: column;
        }

        .header-text h1 {
            font-size: 1.375rem;
        }

        .header-actions {
            width: 100%;
        }

        .stats-grid {
            grid-template-columns: 1fr 1fr;
        }

        .detail-grid {
            grid-template-columns: 1fr;
        }

        .alert-grid {
            grid-template-columns: 1fr 1fr;
        }

        .recent-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        .recent-item-right {
            text-align: left;
            padding-left: 3.25rem;
        }
    }

    @media (max-width: 480px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }

        .alert-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
