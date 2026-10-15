<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Chart, registerables } from "chart.js";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Analytics02Icon,
        ArrowUpRight01Icon,
        ArrowDownRight01Icon,
        Calendar03Icon,
    } from "@hugeicons/core-free-icons";
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$lib/components/ui/card";
    import type { DailyTrend } from "$lib/types/dashboard";
    import { formatCurrency } from "$lib/utils";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";

    Chart.register(...registerables);

    type Props = {
        initialTrend: DailyTrend[];
        initialDays?: number;
    };

    let { initialTrend, initialDays = 7 }: Props = $props();

    let canvasElement: HTMLCanvasElement | null = $state(null);
    let chartInstance: Chart | null = null;
    let selectedDays = $state(7);
    let trendData: DailyTrend[] = $state([]);
    let loading = $state(false);

    const totalSales = $derived(trendData.reduce((acc, curr) => acc + curr.sales, 0));
    const totalPurchases = $derived(trendData.reduce((acc, curr) => acc + curr.purchases, 0));
    const netCashflow = $derived(totalSales - totalPurchases);

    async function changePeriod(days: number) {
        if (days === selectedDays && trendData.length > 0) return;
        selectedDays = days;
        loading = true;
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/dashboard/analytics?days=${days}`);
            const json = await res.json();
            if (json.success && json.data) {
                trendData = json.data.trend;
                updateChart();
            }
        } catch (err) {
            console.error("Gagal mengambil data analitik:", err);
        } finally {
            loading = false;
        }
    }

    function createChart() {
        if (!canvasElement) return;

        const ctx = canvasElement.getContext("2d");
        if (!ctx) return;

        // Gradient for Sales (Sky)
        const salesGradient = ctx.createLinearGradient(0, 0, 0, 260);
        salesGradient.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        salesGradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");

        // Gradient for Purchases (Violet)
        const purchaseGradient = ctx.createLinearGradient(0, 0, 0, 260);
        purchaseGradient.addColorStop(0, "rgba(167, 139, 250, 0.28)");
        purchaseGradient.addColorStop(1, "rgba(167, 139, 250, 0.0)");

        const labels = trendData.map((d) => `${d.dayName}, ${d.label}`);
        const salesValues = trendData.map((d) => d.sales);
        const purchaseValues = trendData.map((d) => d.purchases);

        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "Penjualan (Sales)",
                        data: salesValues,
                        borderColor: "#38bdf8",
                        backgroundColor: salesGradient,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.38,
                        pointBackgroundColor: "#0284c7",
                        pointBorderColor: "#38bdf8",
                        pointBorderWidth: 2,
                        pointRadius: 3.5,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: "#38bdf8",
                        pointHoverBorderColor: "#ffffff",
                        pointHoverBorderWidth: 2,
                    },
                    {
                        label: "Pembelian (Purchases)",
                        data: purchaseValues,
                        borderColor: "#a78bfa",
                        backgroundColor: purchaseGradient,
                        borderWidth: 2,
                        borderDash: [5, 4],
                        fill: true,
                        tension: 0.38,
                        pointBackgroundColor: "#7c3aed",
                        pointBorderColor: "#a78bfa",
                        pointBorderWidth: 2,
                        pointRadius: 3.5,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: "#a78bfa",
                        pointHoverBorderColor: "#ffffff",
                        pointHoverBorderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false,
                },
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
                        usePointStyle: true,
                        callbacks: {
                            label(context) {
                                const val = Number(context.raw ?? 0);
                                return `  ${context.dataset.label}: ${formatCurrency(val)}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)",
                        },
                        ticks: {
                            color: "#a1a1aa",
                            font: {
                                size: 11,
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
        if (!chartInstance) {
            createChart();
            return;
        }

        const labels = trendData.map((d) => `${d.dayName}, ${d.label}`);
        const salesValues = trendData.map((d) => d.sales);
        const purchaseValues = trendData.map((d) => d.purchases);

        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = salesValues;
        chartInstance.data.datasets[1].data = purchaseValues;
        chartInstance.update();
    }

    onMount(() => {
        trendData = initialTrend;
        selectedDays = initialDays;
        createChart();
    });

    onDestroy(() => {
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    });

    $effect(() => {
        if (initialTrend) {
            trendData = initialTrend;
            if (chartInstance) {
                updateChart();
            }
        }
    });
</script>

<Card class="trend-card">
    <CardHeader class="pb-2">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Analytics02Icon} size={20} strokeWidth={1.8} />
                </div>
                <div>
                    <CardTitle class="text-base font-semibold text-white">Tren Transaksi Operasional</CardTitle>
                    <CardDescription class="text-xs text-zinc-400">
                        Perbandingan omset penjualan vs belanja pengadaan barang
                    </CardDescription>
                </div>
            </div>

            <!-- Time Filter Pills -->
            <div class="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/90 border border-zinc-800 self-start sm:self-auto">
                <button
                    type="button"
                    class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all {selectedDays === 7 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm' : 'text-zinc-400 hover:text-white'}"
                    onclick={() => changePeriod(7)}
                    disabled={loading}
                >
                    7 Hari
                </button>
                <button
                    type="button"
                    class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all {selectedDays === 14 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm' : 'text-zinc-400 hover:text-white'}"
                    onclick={() => changePeriod(14)}
                    disabled={loading}
                >
                    14 Hari
                </button>
                <button
                    type="button"
                    class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all {selectedDays === 30 ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm' : 'text-zinc-400 hover:text-white'}"
                    onclick={() => changePeriod(30)}
                    disabled={loading}
                >
                    30 Hari
                </button>
            </div>
        </div>

        <!-- Period Summary Row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-2 border-t border-zinc-800/60">
            <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                <div class="w-3 h-3 rounded-full bg-sky-400 shadow-sm shadow-sky-500/50"></div>
                <div>
                    <span class="text-[11px] text-zinc-400 block font-medium">Total Penjualan</span>
                    <span class="text-sm font-bold text-sky-400">{formatCurrency(totalSales)}</span>
                </div>
            </div>

            <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                <div class="w-3 h-3 rounded-full bg-violet-400 shadow-sm shadow-violet-500/50"></div>
                <div>
                    <span class="text-[11px] text-zinc-400 block font-medium">Total Pembelian (PO)</span>
                    <span class="text-sm font-bold text-violet-400">{formatCurrency(totalPurchases)}</span>
                </div>
            </div>

            <div class="flex items-center gap-2.5 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                <div class="w-2.5 h-2.5 flex items-center justify-center">
                    {#if netCashflow >= 0}
                        <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} class="text-emerald-400" />
                    {:else}
                        <HugeiconsIcon icon={ArrowDownRight01Icon} size={16} class="text-rose-400" />
                    {/if}
                </div>
                <div>
                    <span class="text-[11px] text-zinc-400 block font-medium">Arus Kas Bersih</span>
                    <span class="text-sm font-bold {netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                        {formatCurrency(netCashflow)}
                    </span>
                </div>
            </div>
        </div>
    </CardHeader>

    <CardContent class="pt-2">
        <div class="relative w-full h-[260px]">
            {#if loading}
                <div class="absolute inset-0 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                    <span class="text-xs text-zinc-400 flex items-center gap-2">
                        <span class="inline-block w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                        Memperbarui grafik...
                    </span>
                </div>
            {/if}

            <canvas bind:this={canvasElement}></canvas>
        </div>
    </CardContent>
</Card>

<style>
    :global(.trend-card) {
        background: rgba(9, 9, 11, 0.7) !important;
        border: 1px solid rgba(39, 39, 42, 0.8) !important;
        backdrop-filter: blur(12px);
    }
</style>
