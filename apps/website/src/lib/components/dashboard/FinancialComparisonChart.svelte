<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Chart, registerables } from "chart.js";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Coins01Icon,
        ArrowUpRight01Icon,
        PackageCheckIcon,
        SaleTag02Icon,
    } from "@hugeicons/core-free-icons";
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
    import type { FinancialComparison } from "$lib/types/dashboard";
    import { formatCurrency } from "$lib/utils";

    Chart.register(...registerables);

    type Props = {
        comparison: FinancialComparison;
    };

    let { comparison }: Props = $props();

    let canvasElement: HTMLCanvasElement | null = $state(null);
    let chartInstance: Chart | null = null;

    const estimatedProfit = $derived(comparison.potentialRevenue - comparison.inventoryValue);
    const profitMarginPercent = $derived(
        comparison.inventoryValue > 0
            ? ((estimatedProfit / comparison.inventoryValue) * 100).toFixed(1)
            : "0.0"
    );
    const realizationRate = $derived(
        comparison.potentialRevenue > 0
            ? ((comparison.realizedRevenue / comparison.potentialRevenue) * 100).toFixed(1)
            : "0.0"
    );

    function createChart() {
        if (!canvasElement) return;

        const ctx = canvasElement.getContext("2d");
        if (!ctx) return;

        // Gradients for bars
        const modalGrad = ctx.createLinearGradient(0, 0, 0, 240);
        modalGrad.addColorStop(0, "rgba(167, 139, 250, 0.9)");
        modalGrad.addColorStop(1, "rgba(124, 58, 237, 0.4)");

        const potensiGrad = ctx.createLinearGradient(0, 0, 0, 240);
        potensiGrad.addColorStop(0, "rgba(56, 189, 248, 0.9)");
        potensiGrad.addColorStop(1, "rgba(14, 165, 233, 0.4)");

        const realisasiGrad = ctx.createLinearGradient(0, 0, 0, 240);
        realisasiGrad.addColorStop(0, "rgba(52, 211, 153, 0.9)");
        realisasiGrad.addColorStop(1, "rgba(16, 185, 129, 0.4)");

        chartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Modal Inventori", "Potensi Omset", "Realisasi Penjualan"],
                datasets: [
                    {
                        data: [
                            comparison.inventoryValue,
                            comparison.potentialRevenue,
                            comparison.realizedRevenue,
                        ],
                        backgroundColor: [modalGrad, potensiGrad, realisasiGrad],
                        borderColor: ["#a78bfa", "#38bdf8", "#34d399"],
                        borderWidth: 1.5,
                        borderRadius: 10,
                        borderSkipped: false,
                        maxBarThickness: 54,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: "rgba(9, 9, 11, 0.95)",
                        titleColor: "#f4f4f5",
                        bodyColor: "#d4d4d8",
                        borderColor: "rgba(63, 63, 70, 0.8)",
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        callbacks: {
                            label(context) {
                                const val = Number(context.raw ?? 0);
                                return `  Nominal: ${formatCurrency(val)}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                        },
                        ticks: {
                            color: "#d4d4d8",
                            font: {
                                size: 12,
                                weight: "bold",
                                family: "Figtree, sans-serif",
                            },
                        },
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(255, 255, 255, 0.06)",
                        },
                        ticks: {
                            color: "#a1a1aa",
                            font: {
                                size: 11,
                                family: "Figtree, sans-serif",
                            },
                            callback(value) {
                                const val = Number(value);
                                if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}jt`;
                                if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}rb`;
                                return `Rp ${val}`;
                            },
                        },
                    },
                },
            },
        });
    }

    function updateChart() {
        if (!chartInstance) return;
        chartInstance.data.datasets[0].data = [
            comparison.inventoryValue,
            comparison.potentialRevenue,
            comparison.realizedRevenue,
        ];
        chartInstance.update();
    }

    onMount(() => {
        createChart();
    });

    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    });

    $effect(() => {
        if (comparison && chartInstance) {
            updateChart();
        }
    });
</script>

<Card class="financial-comp-card">
    <CardHeader class="pb-2">
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Coins01Icon} size={20} strokeWidth={1.8} />
                </div>
                <div>
                    <CardTitle class="text-base font-semibold text-white">Komparasi Finansial & Potensi</CardTitle>
                    <CardDescription class="text-xs text-zinc-400">
                        Perbandingan modal inventori, proyeksi penjualan, dan realisasi
                    </CardDescription>
                </div>
            </div>

            <!-- Estimated Profit Margin Badge -->
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
                <span class="text-xs font-semibold">Potensi Margin +{profitMarginPercent}%</span>
            </div>
        </div>
    </CardHeader>

    <CardContent class="pt-2">
        <!-- Visual Comparison Chart -->
        <div class="w-full h-[220px]">
            <canvas bind:this={canvasElement}></canvas>
        </div>

        <!-- Metric Details Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-2 border-t border-zinc-800/60">
            <!-- Modal Inventori Card -->
            <div class="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/70 hover:border-violet-500/40 transition-colors">
                <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-2.5 h-2.5 rounded-full bg-violet-400"></div>
                    <span class="text-[11px] font-medium text-zinc-400">Modal Inventori (HPP)</span>
                </div>
                <div class="text-sm font-bold text-white mb-1">
                    {formatCurrency(comparison.inventoryValue)}
                </div>
                <p class="text-[11px] text-zinc-500">Nilai aset barang di gudang</p>
            </div>

            <!-- Potensi Omset Card -->
            <div class="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/70 hover:border-sky-500/40 transition-colors">
                <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
                    <span class="text-[11px] font-medium text-zinc-400">Potensi Nilai Jual</span>
                </div>
                <div class="text-sm font-bold text-sky-400 mb-1">
                    {formatCurrency(comparison.potentialRevenue)}
                </div>
                <p class="text-[11px] text-zinc-500">Estimasi margin: {formatCurrency(estimatedProfit)}</p>
            </div>

            <!-- Realisasi Penjualan Card -->
            <div class="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/70 hover:border-emerald-500/40 transition-colors">
                <div class="flex items-center gap-2 mb-1.5">
                    <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    <span class="text-[11px] font-medium text-zinc-400">Realisasi Penjualan</span>
                </div>
                <div class="text-sm font-bold text-emerald-400 mb-1">
                    {formatCurrency(comparison.realizedRevenue)}
                </div>
                <p class="text-[11px] text-zinc-500">Tercapai {realizationRate}% dari target stok</p>
            </div>
        </div>
    </CardContent>
</Card>

<style>
    :global(.financial-comp-card) {
        background: rgba(9, 9, 11, 0.7) !important;
        border: 1px solid rgba(39, 39, 42, 0.8) !important;
        backdrop-filter: blur(12px);
    }
</style>
