<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
    } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PackageIcon,
        ArrowRight02Icon,
        Calendar03Icon,
    } from "@hugeicons/core-free-icons";
    import type { RecentProduct } from "$lib/types/dashboard";
    import { formatCurrency, formatDate } from "$lib/utils";

    type Props = {
        products: RecentProduct[];
    };

    let { products = [] }: Props = $props();
</script>

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
        {#if products.length === 0}
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
                {#each products as product (product.id)}
                    <a
                        href={`/products/${product.id}`}
                        class="recent-item"
                    >
                        <div class="recent-item-left">
                            <div class="recent-item-avatar">
                                {product.name.charAt(0).toUpperCase()}
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
                                {formatCurrency(product.sellingPrice)}
                            </p>
                            <div class="recent-item-meta">
                                <span
                                    class="stock-badge"
                                    class:stock-ok={product.stock > 5}
                                    class:stock-low={product.stock > 0 &&
                                        product.stock <= 5}
                                    class:stock-out={product.stock === 0}
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

<style>
    .card-header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
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

    @media (max-width: 768px) {
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
</style>
