<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
    } from "$lib/components/ui/card";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        AlertCircleIcon,
        ChartLineData02Icon,
        PackageRemoveIcon,
    } from "@hugeicons/core-free-icons";

    type Props = {
        lowStockCount: number;
        outOfStockCount: number;
    };

    let { lowStockCount, outOfStockCount }: Props = $props();
</script>

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
                        {lowStockCount}
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
                        {outOfStockCount}
                    </p>
                    <p class="alert-item-label">Habis</p>
                    <p class="alert-item-sub">0 unit</p>
                </div>
            </div>
        </div>
    </CardContent>
</Card>

<style>
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

    .alert-icon {
        background: oklch(0.6 0.18 50 / 12%);
        color: oklch(0.75 0.18 50);
    }

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

    @media (max-width: 480px) {
        .alert-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
