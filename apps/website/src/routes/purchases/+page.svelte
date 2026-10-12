<script lang="ts">
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        ShoppingCart01Icon,
        PlusSignIcon,
        Search01Icon,
        RefreshIcon,
        AlertCircleIcon,
        PackageReceiveIcon,
        ArrowRight01Icon,
    } from "@hugeicons/core-free-icons";
    import type { PurchaseOrder, PurchaseSummary } from "$lib/types/purchase";
    import {
        PurchaseStats,
        OrderStatusBadge,
        CreatePurchaseModal,
        PurchaseDetailModal,
    } from "$lib/components/orders";
    import { formatCurrency, formatDate } from "$lib/utils";

    // State
    let summary = $state<PurchaseSummary | null>(null);
    let orders = $state<PurchaseOrder[]>([]);
    let loading = $state(true);
    let error = $state("");

    // Filters
    let searchQuery = $state("");
    let statusFilter = $state<"all" | "DRAFT" | "RECEIVED" | "CANCELLED">("all");

    // Modals
    let isCreateModalOpen = $state(false);
    let isDetailModalOpen = $state(false);
    let selectedOrderId = $state<string | null>(null);

    async function loadData() {
        loading = true;
        error = "";
        try {
            const [sumRes, ordRes] = await Promise.all([
                fetch(`${PUBLIC_API_BASE_URL}/purchases/summary`),
                fetch(`${PUBLIC_API_BASE_URL}/purchases?limit=100`),
            ]);

            const sumJson = await sumRes.json();
            const ordJson = await ordRes.json();

            if (sumRes.ok && sumJson.success) {
                summary = sumJson.data;
            }
            if (ordRes.ok && ordJson.success) {
                orders = ordJson.data ?? [];
            }
        } catch (err) {
            error = err instanceof Error ? err.message : "Gagal memuat data pembelian";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadData();
    });

    const filteredOrders = $derived(
        orders.filter((order) => {
            if (statusFilter !== "all" && order.status !== statusFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchNumber = order.orderNumber.toLowerCase().includes(q);
                const matchSupplier = (order.supplierName ?? "").toLowerCase().includes(q);
                if (!matchNumber && !matchSupplier) return false;
            }
            return true;
        })
    );

    function openDetail(id: string) {
        selectedOrderId = id;
        isDetailModalOpen = true;
    }
</script>

<div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2">
                <span class="inline-flex h-2 w-2 rounded-full bg-violet-500 animate-pulse"></span>
                <span class="text-xs font-semibold uppercase tracking-wider text-violet-400">Purchasing & Vendor</span>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-white mt-1">Pembelian (Purchase Orders)</h1>
            <p class="text-xs text-zinc-400 mt-0.5">
                Pesan barang ke supplier dan sinkronkan penambahan stok inventaris saat barang tiba.
            </p>
        </div>

        <div class="flex items-center gap-2.5">
            <Button
                variant="outline"
                size="sm"
                onclick={loadData}
                disabled={loading}
                class="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs h-9 gap-1.5"
            >
                <HugeiconsIcon icon={RefreshIcon} size={14} class={loading ? "animate-spin" : ""} />
                Muat Ulang
            </Button>

            <Button
                size="sm"
                onclick={() => (isCreateModalOpen = true)}
                class="bg-violet-600 hover:bg-violet-500 text-white text-xs h-9 gap-1.5 shadow-lg shadow-violet-600/20"
            >
                <HugeiconsIcon icon={PlusSignIcon} size={15} />
                Buat PO Baru
            </Button>
        </div>
    </div>

    <!-- Error Banner -->
    {#if error}
        <div class="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400">
            <HugeiconsIcon icon={AlertCircleIcon} size={18} class="shrink-0 mt-0.5" />
            <div class="flex-1">
                <span class="font-semibold">Terjadi Gangguan:</span> {error}
            </div>
            <button
                type="button"
                onclick={loadData}
                class="underline hover:text-white transition-colors"
            >
                Coba Lagi
            </button>
        </div>
    {/if}

    <!-- KPI Stats Cards -->
    <PurchaseStats {summary} {loading} />

    <!-- Table Section -->
    <div class="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md overflow-hidden">
        <!-- Filter Controls -->
        <div class="p-4 border-b border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/20">
            <!-- Search Input -->
            <div class="relative flex-1 max-w-sm">
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <HugeiconsIcon icon={Search01Icon} size={15} />
                </div>
                <Input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Cari nomor PO atau nama supplier..."
                    class="pl-9 h-9 bg-zinc-900/80 border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:border-violet-500"
                />
            </div>

            <!-- Status Tabs -->
            <div class="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80 text-xs">
                <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg font-medium transition-colors {statusFilter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
                    onclick={() => (statusFilter = 'all')}
                >
                    Semua ({orders.length})
                </button>
                <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg font-medium transition-colors {statusFilter === 'DRAFT' ? 'bg-amber-500/15 text-amber-300 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
                    onclick={() => (statusFilter = 'DRAFT')}
                >
                    Draft
                </button>
                <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg font-medium transition-colors {statusFilter === 'RECEIVED' ? 'bg-emerald-500/15 text-emerald-300 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
                    onclick={() => (statusFilter = 'RECEIVED')}
                >
                    Diterima
                </button>
                <button
                    type="button"
                    class="px-3 py-1.5 rounded-lg font-medium transition-colors {statusFilter === 'CANCELLED' ? 'bg-rose-500/15 text-rose-300 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}"
                    onclick={() => (statusFilter = 'CANCELLED')}
                >
                    Dibatalkan
                </button>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="border-b border-zinc-800/80 bg-zinc-900/50 text-zinc-400 font-medium">
                        <th class="py-3 px-4">No. Order</th>
                        <th class="py-3 px-4">Supplier</th>
                        <th class="py-3 px-4">Tanggal Pesan</th>
                        <th class="py-3 px-4 text-center">Status</th>
                        <th class="py-3 px-4 text-center">Total Item</th>
                        <th class="py-3 px-4 text-right">Nilai Pembelian</th>
                        <th class="py-3 px-4 text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-800/60">
                    {#if loading && orders.length === 0}
                        <tr>
                            <td colspan="7" class="py-16 text-center text-zinc-500">
                                <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-2"></div>
                                <div>Memuat data purchase orders...</div>
                            </td>
                        </tr>
                    {:else if filteredOrders.length === 0}
                        <tr>
                            <td colspan="7" class="py-16 text-center">
                                <div class="mx-auto w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
                                    <HugeiconsIcon icon={ShoppingCart01Icon} size={22} />
                                </div>
                                <div class="text-sm font-medium text-zinc-300">Belum ada Purchase Order</div>
                                <div class="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                                    {searchQuery ? "Tidak ada pesanan yang sesuai dengan filter pencarian Anda." : "Mulai dengan membuat PO pertama untuk mendata penerimaan barang ke gudang."}
                                </div>
                                {#if !searchQuery}
                                    <Button
                                        size="sm"
                                        class="mt-4 bg-violet-600 hover:bg-violet-500 text-white text-xs"
                                        onclick={() => (isCreateModalOpen = true)}
                                    >
                                        + Buat Purchase Order
                                    </Button>
                                {/if}
                            </td>
                        </tr>
                    {:else}
                        {#each filteredOrders as order}
                            <tr class="hover:bg-zinc-900/40 transition-colors group">
                                <td class="py-3.5 px-4 font-mono font-medium text-white">
                                    <button
                                        type="button"
                                        onclick={() => openDetail(order.id)}
                                        class="hover:text-violet-400 hover:underline text-left"
                                    >
                                        {order.orderNumber}
                                    </button>
                                </td>
                                <td class="py-3.5 px-4 text-zinc-300">
                                    {order.supplierName ?? "Supplier Umum"}
                                </td>
                                <td class="py-3.5 px-4 text-zinc-400">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td class="py-3.5 px-4 text-center">
                                    <OrderStatusBadge status={order.status} size="sm" />
                                </td>
                                <td class="py-3.5 px-4 text-center text-zinc-300">
                                    {order.totalItems ?? "-"} jenis
                                </td>
                                <td class="py-3.5 px-4 text-right font-semibold text-white">
                                    {formatCurrency(order.totalAmount)}
                                </td>
                                <td class="py-3.5 px-4 text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onclick={() => openDetail(order.id)}
                                        class="h-7 px-2.5 text-[11px] border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/10 text-zinc-300 hover:text-violet-300 gap-1"
                                    >
                                        {#if order.status === "DRAFT"}
                                            <HugeiconsIcon icon={PackageReceiveIcon} size={13} class="text-amber-400" />
                                            <span>Terima</span>
                                        {:else}
                                            <span>Detail</span>
                                            <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
                                        {/if}
                                    </Button>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modals -->
<CreatePurchaseModal
    isOpen={isCreateModalOpen}
    onClose={() => (isCreateModalOpen = false)}
    onSuccess={() => {
        loadData();
    }}
/>

<PurchaseDetailModal
    orderId={selectedOrderId}
    isOpen={isDetailModalOpen}
    onClose={() => {
        isDetailModalOpen = false;
        selectedOrderId = null;
    }}
    onOrderUpdated={() => {
        loadData();
    }}
/>
