<script lang="ts">
    import {
        PackageIcon,
        TagsIcon,
        UserMultipleIcon,
        WarehouseIcon,
    } from "@hugeicons/core-free-icons";
    import { HugeiconsIcon } from "@hugeicons/svelte";

    type Props = {
        totalProducts: number;
        totalCategories: number;
        totalUsers: number;
        totalStock: number;
    };

    let {
        totalProducts,
        totalCategories,
        totalUsers,
        totalStock,
    }: Props = $props();
</script>

<section class="stats-section">
    <div class="stats-bar">
        <!-- Item 1: Total Produk -->
        <div class="stat-item group">
            <div class="stat-icon-wrap stat-icon-products">
                <HugeiconsIcon icon={PackageIcon} size={20} strokeWidth={1.8} />
            </div>
            <div>
                <p class="stat-label">Total Produk</p>
                <p class="stat-value">{totalProducts}</p>
            </div>
        </div>

        <div class="stat-divider"></div>

        <!-- Item 2: Kategori -->
        <div class="stat-item group">
            <div class="stat-icon-wrap stat-icon-categories">
                <HugeiconsIcon icon={TagsIcon} size={20} strokeWidth={1.8} />
            </div>
            <div>
                <p class="stat-label">Kategori</p>
                <p class="stat-value">{totalCategories}</p>
            </div>
        </div>

        <div class="stat-divider"></div>

        <!-- Item 3: Pengguna -->
        <div class="stat-item group">
            <div class="stat-icon-wrap stat-icon-users">
                <HugeiconsIcon icon={UserMultipleIcon} size={20} strokeWidth={1.8} />
            </div>
            <div>
                <p class="stat-label">Pengguna</p>
                <p class="stat-value">{totalUsers}</p>
            </div>
        </div>

        <div class="stat-divider"></div>

        <!-- Item 4: Total Stok -->
        <div class="stat-item group">
            <div class="stat-icon-wrap stat-icon-stock">
                <HugeiconsIcon icon={WarehouseIcon} size={20} strokeWidth={1.8} />
            </div>
            <div>
                <p class="stat-label">Total Stok Fisik</p>
                <p class="stat-value text-emerald-400">
                    {totalStock.toLocaleString("id-ID")} <span class="text-xs font-normal text-zinc-400">unit</span>
                </p>
            </div>
        </div>
    </div>
</section>

<style>
    .stats-bar {
        background: rgba(9, 9, 11, 0.65);
        border: 1px solid rgba(39, 39, 42, 0.8);
        backdrop-filter: blur(12px);
        border-radius: 1rem;
        padding: 1rem 1.5rem;
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
        align-items: center;
        gap: 1rem;
    }

    .stat-item {
        display: flex;
        align-items: center;
        gap: 0.875rem;
    }

    .stat-icon-wrap {
        width: 40px;
        height: 40px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.2s ease;
    }

    .stat-item:hover .stat-icon-wrap {
        transform: scale(1.05);
    }

    .stat-icon-products {
        background: oklch(0.65 0.15 250 / 12%);
        color: oklch(0.75 0.15 250);
        border: 1px solid oklch(0.65 0.15 250 / 25%);
    }

    .stat-icon-categories {
        background: oklch(0.7 0.15 170 / 12%);
        color: oklch(0.8 0.15 170);
        border: 1px solid oklch(0.7 0.15 170 / 25%);
    }

    .stat-icon-users {
        background: oklch(0.65 0.18 310 / 12%);
        color: oklch(0.75 0.18 310);
        border: 1px solid oklch(0.65 0.18 310 / 25%);
    }

    .stat-icon-stock {
        background: oklch(0.65 0.16 140 / 12%);
        color: oklch(0.75 0.16 140);
        border: 1px solid oklch(0.65 0.16 140 / 25%);
    }

    .stat-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: #a1a1aa;
        margin-bottom: 0.125rem;
    }

    .stat-value {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #ffffff;
        line-height: 1.2;
    }

    .stat-divider {
        width: 1px;
        height: 36px;
        background: rgba(39, 39, 42, 0.8);
    }

    @media (max-width: 1024px) {
        .stats-bar {
            grid-template-columns: 1fr 1fr;
            padding: 1.25rem;
        }

        .stat-divider {
            display: none;
        }
    }

    @media (max-width: 640px) {
        .stats-bar {
            grid-template-columns: 1fr;
            gap: 1.25rem;
        }
    }
</style>
