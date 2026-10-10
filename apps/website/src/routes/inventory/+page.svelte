<script lang="ts">
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PackageReceiveIcon,
        Search01Icon,
        Settings02Icon,
        RefreshIcon,
        AlertCircleIcon,
        PackageMovingIcon,
    } from "@hugeicons/core-free-icons";
    import type {
        InventoryItem,
        StockMutation,
        InventorySummary,
        StockStatus,
    } from "$lib/types/inventory";
    import {
        StockStatusBadge,
        InventoryStats,
        MinStockRuleModal,
        StockMutationModal,
        StockMutationsTable,
    } from "$lib/components/inventory";

    // State Data
    let summary: InventorySummary | null = $state(null);
    let items: InventoryItem[] = $state([]);
    let mutations: StockMutation[] = $state([]);

    // UI State
    let activeTab: "items" | "mutations" = $state("items");
    let loading = $state(true);
    let loadingMutations = $state(false);
    let error = $state("");

    // Filters
    let searchQuery = $state("");
    let statusFilter: "all" | "normal" | "low" | "out" = $state("all");
    let mutationTypeFilter = $state("all");

    // Modals
    let isMutationModalOpen = $state(false);
    let isMinStockModalOpen = $state(false);
    let selectedItemForAction: InventoryItem | null = $state(null);

    // Ambil data ringkasan dan produk inventaris
    async function loadInventoryData() {
        loading = true;
        error = "";
        try {
            const [sumRes, itemsRes] = await Promise.all([
                fetch(`${PUBLIC_API_BASE_URL}/inventory/summary`),
                fetch(`${PUBLIC_API_BASE_URL}/inventory/items`),
            ]);

            const sumJson = await sumRes.json();
            const itemsJson = await itemsRes.json();

            if (sumRes.ok && sumJson.success) {
                summary = sumJson.data;
            }
            if (itemsRes.ok && itemsJson.success) {
                items = itemsJson.data ?? [];
            }
        } catch (err) {
            error = err instanceof Error ? err.message : "Gagal memuat data inventaris";
        } finally {
            loading = false;
        }
    }

    // Ambil riwayat mutasi stok
    async function loadMutations() {
        loadingMutations = true;
        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/inventory/mutations`);
            const result = await response.json();
            if (response.ok && result.success) {
                mutations = result.data ?? [];
            }
        } catch (err) {
            console.error("Gagal memuat mutasi:", err);
        } finally {
            loadingMutations = false;
        }
    }

    // Filter daftar item di frontend
    const filteredItems = $derived(
        items.filter((item) => {
            // Filter status
            if (statusFilter === "normal" && item.status !== "NORMAL") return false;
            if (statusFilter === "low" && item.status !== "LOW_STOCK") return false;
            if (statusFilter === "out" && item.status !== "OUT_OF_STOCK") return false;

            // Search query
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchName = item.name.toLowerCase().includes(q);
                const matchSku = item.sku.toLowerCase().includes(q);
                return matchName || matchSku;
            }

            return true;
        })
    );

    // Filter mutasi
    const filteredMutations = $derived(
        mutations.filter((m) => {
            if (mutationTypeFilter !== "all" && m.type !== mutationTypeFilter) {
                return false;
            }
            return true;
        })
    );

    function openMutationModal(item?: InventoryItem) {
        selectedItemForAction = item ?? null;
        isMutationModalOpen = true;
    }

    function openMinStockModal(item: InventoryItem) {
        selectedItemForAction = item;
        isMinStockModalOpen = true;
    }

    function handleMutationSuccess() {
        loadInventoryData();
        loadMutations();
    }

    function handleMinStockSuccess(updatedData: any) {
        items = items.map((it) => (it.id === updatedData.id ? { ...it, ...updatedData } : it));
        loadInventoryData();
    }

    function formatNumber(val: number) {
        return new Intl.NumberFormat("id-ID").format(val);
    }

    onMount(() => {
        loadInventoryData();
        loadMutations();
    });
</script>

<svelte:head>
    <title>Inventaris & Stok | noirERP</title>
    <meta name="description" content="Manajemen stok produk, aturan stok minimum, dan audit mutasi stok noirERP." />
</svelte:head>

<div class="inventory-root">
    <!-- Header Page -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <div class="flex items-center gap-2">
                <span class="rounded-lg bg-violet-500/10 p-2 text-violet-400">
                    <HugeiconsIcon icon={PackageMovingIcon} size={22} strokeWidth={2} />
                </span>
                <div>
                    <h1 class="text-2xl font-bold tracking-tight text-white">Inventaris & Stok</h1>
                    <p class="text-xs text-zinc-400">
                        Pantau saldo stok fisik, aturan stok minimum (reorder point), dan log mutasi stok.
                    </p>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-2.5">
            <Button
                variant="outline"
                size="sm"
                onclick={() => {
                    loadInventoryData();
                    loadMutations();
                }}
            >
                <HugeiconsIcon icon={RefreshIcon} size={15} strokeWidth={2} />
                <span>Segarkan</span>
            </Button>

            <Button onclick={() => openMutationModal()}>
                <HugeiconsIcon icon={PackageReceiveIcon} size={16} strokeWidth={2} />
                <span>Catat Mutasi Stok</span>
            </Button>
        </div>
    </div>

    <!-- Error Banner -->
    {#if error}
        <div role="alert" class="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300">
            <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={2} />
            <span>{error}</span>
        </div>
    {/if}

    <!-- KPI Stats Cards -->
    <InventoryStats {summary} {loading} />

    <!-- Tab Navigation & Action Bar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/8 pb-3">
        <!-- Tab Buttons -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
            <button
                type="button"
                class="tab-btn {activeTab === 'items' ? 'active-tab' : ''}"
                onclick={() => (activeTab = 'items')}
            >
                <span>Status Stok & Aturan</span>
                <span class="tab-badge">{items.length}</span>
            </button>
            <button
                type="button"
                class="tab-btn {activeTab === 'mutations' ? 'active-tab' : ''}"
                onclick={() => (activeTab = 'mutations')}
            >
                <span>Riwayat Mutasi Stok</span>
                <span class="tab-badge">{mutations.length}</span>
            </button>
        </div>

        <!-- Filter Controls per Tab -->
        {#if activeTab === 'items'}
            <div class="flex flex-wrap items-center gap-2">
                <!-- Search Input -->
                <div class="relative w-full sm:w-60">
                    <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        <HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={2} />
                    </span>
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Cari SKU atau nama..."
                        class="h-9 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
                    />
                </div>

                <!-- Status Filter Pills -->
                <div class="flex items-center gap-1">
                    <button
                        type="button"
                        class="pill-btn {statusFilter === 'all' ? 'active-pill' : ''}"
                        onclick={() => (statusFilter = 'all')}
                    >
                        Semua
                    </button>
                    <button
                        type="button"
                        class="pill-btn {statusFilter === 'low' ? 'active-pill-amber' : ''}"
                        onclick={() => (statusFilter = 'low')}
                    >
                        ⚠️ Menipis ({summary?.lowStockCount ?? 0})
                    </button>
                    <button
                        type="button"
                        class="pill-btn {statusFilter === 'out' ? 'active-pill-rose' : ''}"
                        onclick={() => (statusFilter = 'out')}
                    >
                        🚨 Habis ({summary?.outOfStockCount ?? 0})
                    </button>
                </div>
            </div>
        {:else}
            <!-- Filter Mutasi Tipe -->
            <div class="flex items-center gap-1.5">
                <span class="text-xs text-zinc-400">Filter Tipe:</span>
                <select
                    bind:value={mutationTypeFilter}
                    class="h-8 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-xs text-white outline-none"
                >
                    <option value="all">Semua Tipe</option>
                    <option value="INITIAL">Stok Awal</option>
                    <option value="IN">Stok Masuk</option>
                    <option value="OUT">Stok Keluar</option>
                    <option value="ADJUSTMENT">Opname Fisik</option>
                </select>
            </div>
        {/if}
    </div>

    <!-- TAB 1: Status Stok & Aturan Minimum -->
    {#if activeTab === 'items'}
        <div class="overflow-x-auto rounded-xl border border-white/8 bg-white/[0.01]">
            {#if loading}
                <div class="p-8 text-center text-sm text-zinc-400">
                    <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-2"></div>
                    <p>Memuat data stok inventaris...</p>
                </div>
            {:else if filteredItems.length === 0}
                <div class="p-12 text-center">
                    <p class="font-medium text-white">Tidak ada produk ditemukan</p>
                    <p class="mt-1 text-xs text-zinc-400">
                        {searchQuery ? "Coba ubah kata kunci pencarian Anda." : "Daftarkan produk pertama di menu Produk."}
                    </p>
                </div>
            {:else}
                <table class="w-full text-left text-sm">
                    <thead class="border-b border-white/8 bg-white/[0.02] text-xs font-semibold text-zinc-400">
                        <tr>
                            <th class="px-4 py-3">SKU</th>
                            <th class="px-4 py-3">Nama Produk</th>
                            <th class="px-4 py-3 text-right">Stok Fisik</th>
                            <th class="px-4 py-3 text-right">Aturan Min Stok</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/6 text-xs">
                        {#each filteredItems as item (item.id)}
                            <tr class="hover:bg-white/[0.02] transition-colors">
                                <!-- SKU -->
                                <td class="whitespace-nowrap px-4 py-3 font-mono font-medium text-zinc-300">
                                    {item.sku}
                                </td>

                                <!-- Nama & Kategori -->
                                <td class="px-4 py-3 min-w-[200px]">
                                    <div class="font-medium text-white">{item.name}</div>
                                    {#if item.categoryName}
                                        <div class="text-[11px] text-zinc-500">{item.categoryName}</div>
                                    {/if}
                                </td>

                                <!-- Stok Fisik -->
                                <td class="whitespace-nowrap px-4 py-3 text-right font-mono text-sm font-bold {item.stock === 0 ? 'text-rose-400' : item.isBelowMinStock ? 'text-amber-300' : 'text-emerald-400'}">
                                    {formatNumber(item.stock)}
                                    <span class="text-[11px] font-normal text-zinc-500">unit</span>
                                </td>

                                <!-- Aturan Min Stok -->
                                <td class="whitespace-nowrap px-4 py-3 text-right">
                                    <div class="inline-flex items-center gap-1.5 font-mono">
                                        <span class="font-medium text-zinc-300">{item.minStock} unit</span>
                                        <button
                                            type="button"
                                            title="Ubah aturan batas stok minimum"
                                            class="rounded p-1 text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                                            onclick={() => openMinStockModal(item)}
                                        >
                                            <HugeiconsIcon icon={Settings02Icon} size={13} strokeWidth={2} />
                                        </button>
                                    </div>
                                </td>

                                <!-- Status Badge -->
                                <td class="whitespace-nowrap px-4 py-3">
                                    <StockStatusBadge status={item.status} size="sm" />
                                </td>

                                <!-- Actions -->
                                <td class="whitespace-nowrap px-4 py-3 text-right">
                                    <div class="flex items-center justify-end gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onclick={() => openMutationModal(item)}
                                        >
                                            <HugeiconsIcon icon={PackageReceiveIcon} size={14} strokeWidth={2} />
                                            <span>Mutasi</span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onclick={() => openMinStockModal(item)}
                                        >
                                            <span>Atur Min</span>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    {/if}

    <!-- TAB 2: Riwayat Mutasi Stok -->
    {#if activeTab === 'mutations'}
        <StockMutationsTable mutations={filteredMutations} loading={loadingMutations} />
    {/if}

    <!-- Modals -->
    <StockMutationModal
        productsList={items}
        preselectedProduct={selectedItemForAction}
        isOpen={isMutationModalOpen}
        onClose={() => {
            isMutationModalOpen = false;
            selectedItemForAction = null;
        }}
        onSuccess={handleMutationSuccess}
    />

    <MinStockRuleModal
        item={selectedItemForAction}
        isOpen={isMinStockModalOpen}
        onClose={() => {
            isMinStockModalOpen = false;
            selectedItemForAction = null;
        }}
        onSuccess={handleMinStockSuccess}
    />
</div>

<style>
    .inventory-root {
        width: 100%;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 1360px;
        margin: 0 auto;
    }

    .tab-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.85rem;
        border-radius: 0.625rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: oklch(0.65 0 0);
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .tab-btn:hover {
        color: white;
    }

    .active-tab {
        background: oklch(1 0 0 / 8%);
        color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }

    .tab-badge {
        font-size: 0.6875rem;
        padding: 0.1rem 0.4rem;
        border-radius: 999px;
        background: oklch(1 0 0 / 8%);
        color: oklch(0.8 0 0);
    }

    .pill-btn {
        padding: 0.35rem 0.7rem;
        border-radius: 0.5rem;
        font-size: 0.6875rem;
        font-weight: 600;
        border: 1px solid oklch(1 0 0 / 8%);
        background: oklch(1 0 0 / 2%);
        color: oklch(0.65 0 0);
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .pill-btn:hover {
        background: oklch(1 0 0 / 6%);
        color: white;
    }

    .active-pill {
        background: oklch(1 0 0 / 12%);
        color: white;
        border-color: oklch(1 0 0 / 18%);
    }

    .active-pill-amber {
        background: oklch(0.55 0.15 80 / 15%);
        color: oklch(0.85 0.15 80);
        border-color: oklch(0.55 0.15 80 / 30%);
    }

    .active-pill-rose {
        background: oklch(0.55 0.18 25 / 15%);
        color: oklch(0.85 0.18 25);
        border-color: oklch(0.55 0.18 25 / 30%);
    }

    @media (max-width: 768px) {
        .inventory-root {
            padding: 1rem;
            gap: 1.25rem;
        }
    }
</style>
