<script lang="ts">
    import StatCard from "./StatCard.svelte";
    import {
        PackageIcon,
        TagsIcon,
        UserMultipleIcon,
        WarehouseIcon,
    } from "@hugeicons/core-free-icons";

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
    <div class="stats-grid">
        <StatCard
            label="Total Produk"
            value={totalProducts}
            icon={PackageIcon}
            variant="products"
        />
        <StatCard
            label="Kategori"
            value={totalCategories}
            icon={TagsIcon}
            variant="categories"
        />
        <StatCard
            label="Pengguna"
            value={totalUsers}
            icon={UserMultipleIcon}
            variant="users"
        />
        <StatCard
            label="Total Stok"
            value={totalStock.toLocaleString("id-ID")}
            icon={WarehouseIcon}
            variant="stock"
        />
    </div>
</section>

<style>
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr 1fr;
        }
    }

    @media (max-width: 480px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
