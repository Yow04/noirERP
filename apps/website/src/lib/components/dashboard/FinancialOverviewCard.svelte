<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
    } from "$lib/components/ui/card";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { MoneyBag02Icon } from "@hugeicons/core-free-icons";
    import { formatCurrency } from "$lib/utils";

    type Props = {
        inventoryValue: number;
        potentialRevenue: number;
    };

    let { inventoryValue, potentialRevenue }: Props = $props();

    const estimatedMargin = $derived(potentialRevenue - inventoryValue);
</script>

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
                <div class="financial-dot financial-dot-cost"></div>
                <div>
                    <p class="financial-label">Nilai Modal</p>
                    <p class="financial-value">
                        {formatCurrency(inventoryValue)}
                    </p>
                </div>
            </div>
            <div class="financial-divider"></div>
            <div class="financial-item">
                <div class="financial-dot financial-dot-revenue"></div>
                <div>
                    <p class="financial-label">Potensi Pendapatan</p>
                    <p class="financial-value">
                        {formatCurrency(potentialRevenue)}
                    </p>
                </div>
            </div>
            <div class="financial-divider"></div>
            <div class="financial-item">
                <div class="financial-dot financial-dot-profit"></div>
                <div>
                    <p class="financial-label">Est. Margin</p>
                    <p class="financial-value financial-profit">
                        {formatCurrency(estimatedMargin)}
                    </p>
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

    .financial-icon {
        background: oklch(0.55 0.15 140 / 12%);
        color: oklch(0.7 0.15 140);
    }

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
</style>
