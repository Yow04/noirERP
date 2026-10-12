<script lang="ts">
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Cancel01Icon,
        CheckmarkCircle02Icon,
        PackageReceiveIcon,
        AlertCircleIcon,
        Calendar03Icon,
        UserIcon,
        DocumentValidationIcon,
        Delete02Icon,
    } from "@hugeicons/core-free-icons";
    import type { PurchaseOrder } from "$lib/types/purchase";
    import OrderStatusBadge from "./OrderStatusBadge.svelte";
    import { formatCurrency, formatDateTime } from "$lib/utils";

    type Props = {
        orderId: string | null;
        isOpen: boolean;
        onClose: () => void;
        onOrderUpdated: () => void;
    };

    let { orderId, isOpen, onClose, onOrderUpdated }: Props = $props();

    let order = $state<PurchaseOrder | null>(null);
    let loading = $state(false);
    let error = $state("");
    let actionLoading = $state(false);
    let actionSuccessMsg = $state("");

    async function loadDetail() {
        if (!orderId) return;
        loading = true;
        error = "";
        actionSuccessMsg = "";
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/purchases/${orderId}`);
            const json = await res.json();
            if (res.ok && json.success) {
                order = json.data;
            } else {
                throw new Error(json.message || "Gagal memuat detail PO");
            }
        } catch (err) {
            error = err instanceof Error ? err.message : "Gagal memuat detail";
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        if (isOpen && orderId) {
            loadDetail();
        } else {
            order = null;
            error = "";
            actionSuccessMsg = "";
        }
    });

    // Terima barang (Status DRAFT -> RECEIVED)
    async function handleReceive() {
        if (!order) return;
        if (!confirm(`Konfirmasi penerimaan barang untuk ${order.orderNumber}? Stok inventaris akan otomatis bertambah sesuai kuantitas item.`)) {
            return;
        }

        actionLoading = true;
        error = "";
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/purchases/${order.id}/receive`, {
                method: "PATCH",
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Gagal memproses penerimaan barang");
            }

            actionSuccessMsg = json.message || "Barang berhasil diterima dan stok telah bertambah!";
            await loadDetail();
            onOrderUpdated();
        } catch (err) {
            error = err instanceof Error ? err.message : "Terjadi kesalahan saat menerima barang";
        } finally {
            actionLoading = false;
        }
    }

    // Batalkan PO
    async function handleCancel() {
        if (!order) return;
        if (!confirm(`Yakin ingin membatalkan PO ${order.orderNumber}?`)) {
            return;
        }

        actionLoading = true;
        error = "";
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/purchases/${order.id}/cancel`, {
                method: "PATCH",
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Gagal membatalkan PO");
            }

            actionSuccessMsg = json.message || "PO berhasil dibatalkan.";
            await loadDetail();
            onOrderUpdated();
        } catch (err) {
            error = err instanceof Error ? err.message : "Terjadi kesalahan saat membatalkan PO";
        } finally {
            actionLoading = false;
        }
    }
</script>

{#if isOpen}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop Blur -->
        <button
            type="button"
            class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onclick={onClose}
            aria-label="Tutup modal"
        ></button>

        <!-- Modal Box -->
        <div class="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl z-10 max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <HugeiconsIcon icon={DocumentValidationIcon} size={20} />
                    </div>
                    <div>
                        <div class="flex items-center gap-2.5">
                            <h2 class="text-base font-bold text-white tracking-wide">
                                {order?.orderNumber ?? "Detail Purchase Order"}
                            </h2>
                            {#if order}
                                <OrderStatusBadge status={order.status} size="sm" />
                            {/if}
                        </div>
                        <p class="text-xs text-zinc-400">Rincian pesanan dan penerimaan inventaris</p>
                    </div>
                </div>

                <button
                    type="button"
                    onclick={onClose}
                    class="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                {#if loading}
                    <div class="py-16 text-center space-y-3">
                        <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
                        <div class="text-xs text-zinc-400">Memuat rincian pesanan...</div>
                    </div>
                {:else if error && !order}
                    <div class="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} class="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                {:else if order}
                    <!-- Success banner -->
                    {#if actionSuccessMsg}
                        <div class="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-400">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} class="shrink-0 mt-0.5" />
                            <span>{actionSuccessMsg}</span>
                        </div>
                    {/if}

                    {#if error}
                        <div class="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400">
                            <HugeiconsIcon icon={AlertCircleIcon} size={16} class="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    {/if}

                    <!-- Status Notification Banner -->
                    {#if order.status === "RECEIVED"}
                        <div class="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} class="text-emerald-400 shrink-0" />
                            <div>
                                <span class="font-semibold">Barang Telah Diterima:</span> Stok inventaris untuk semua item telah otomatis ditambahkan pada {order.receivedAt ? formatDateTime(order.receivedAt) : "-"}.
                            </div>
                        </div>
                    {:else if order.status === "CANCELLED"}
                        <div class="flex items-center gap-3 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400">
                            <HugeiconsIcon icon={AlertCircleIcon} size={18} class="text-rose-400 shrink-0" />
                            <div>
                                <span class="font-semibold">Pesanan Dibatalkan:</span> Transaksi ini telah dibatalkan dan tidak mempengaruhi stok gudang.
                            </div>
                        </div>
                    {:else if order.status === "DRAFT"}
                        <div class="flex items-center justify-between p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300">
                            <div class="flex items-center gap-2.5">
                                <span class="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                                <span>Status <strong>DRAFT</strong> — Klik tombol <strong>Terima Barang</strong> bila fisik produk sudah tiba di gudang.</span>
                            </div>
                        </div>
                    {/if}

                    <!-- Info Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <!-- Supplier Info -->
                        <div class="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
                            <div class="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                <HugeiconsIcon icon={UserIcon} size={14} />
                                Supplier / Vendor
                            </div>
                            <div class="text-sm font-semibold text-white">
                                {order.supplierName ?? "Supplier Umum (Non-rekanan)"}
                            </div>
                            {#if order.supplierPhone || order.supplierEmail}
                                <div class="text-xs text-zinc-400 space-y-0.5">
                                    {#if order.supplierPhone}
                                        <div>Telp: {order.supplierPhone}</div>
                                    {/if}
                                    {#if order.supplierEmail}
                                        <div>Email: {order.supplierEmail}</div>
                                    {/if}
                                </div>
                            {/if}
                        </div>

                        <!-- Date & Timeline -->
                        <div class="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
                            <div class="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                                <HugeiconsIcon icon={Calendar03Icon} size={14} />
                                Timeline Pesanan
                            </div>
                            <div class="text-xs text-zinc-300 space-y-1">
                                <div class="flex justify-between">
                                    <span class="text-zinc-500">Dibuat pada:</span>
                                    <span>{formatDateTime(order.createdAt)}</span>
                                </div>
                                {#if order.receivedAt}
                                    <div class="flex justify-between">
                                        <span class="text-zinc-500">Diterima pada:</span>
                                        <span class="text-emerald-400 font-medium">{formatDateTime(order.receivedAt)}</span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>

                    <!-- Line Items Table -->
                    <div class="space-y-2.5">
                        <div class="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                            Rincian Item Pembelian ({order.items?.length ?? 0} Jenis Produk)
                        </div>

                        <div class="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
                            <table class="w-full text-left text-xs">
                                <thead>
                                    <tr class="border-b border-zinc-800 bg-zinc-900/60 text-zinc-400">
                                        <th class="py-2.5 px-3 font-medium">No</th>
                                        <th class="py-2.5 px-3 font-medium">Produk</th>
                                        <th class="py-2.5 px-3 font-medium">SKU</th>
                                        <th class="py-2.5 px-3 font-medium text-right">Kuantitas</th>
                                        <th class="py-2.5 px-3 font-medium text-right">Harga Beli</th>
                                        <th class="py-2.5 px-3 font-medium text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-zinc-800/60">
                                    {#each order.items ?? [] as item, i}
                                        <tr class="hover:bg-zinc-800/30 transition-colors">
                                            <td class="py-2.5 px-3 text-zinc-500">{i + 1}</td>
                                            <td class="py-2.5 px-3 font-medium text-white">{item.productName}</td>
                                            <td class="py-2.5 px-3 font-mono text-[11px] text-zinc-400">{item.productSku}</td>
                                            <td class="py-2.5 px-3 text-right text-zinc-200 font-semibold">{item.quantity} pcs</td>
                                            <td class="py-2.5 px-3 text-right text-zinc-300">{formatCurrency(item.unitPrice)}</td>
                                            <td class="py-2.5 px-3 text-right font-semibold text-emerald-400">{formatCurrency(item.subtotal)}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                                <tfoot>
                                    <tr class="border-t border-zinc-800 bg-zinc-900/70 font-semibold text-white">
                                        <td colspan="5" class="py-3 px-3 text-right text-zinc-400">Grand Total:</td>
                                        <td class="py-3 px-3 text-right text-sm text-violet-400">{formatCurrency(order.totalAmount)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <!-- Notes -->
                    {#if order.notes}
                        <div class="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-xs">
                            <span class="text-zinc-500 font-medium block mb-1">Catatan:</span>
                            <p class="text-zinc-300 leading-relaxed whitespace-pre-wrap">{order.notes}</p>
                        </div>
                    {/if}
                {/if}
            </div>

            <!-- Footer Actions -->
            <div class="flex items-center justify-between border-t border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
                <div>
                    {#if order?.status === "DRAFT"}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading}
                            onclick={handleCancel}
                            class="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 gap-1.5"
                        >
                            <HugeiconsIcon icon={Delete02Icon} size={14} />
                            Batalkan PO
                        </Button>
                    {/if}
                </div>

                <div class="flex items-center gap-2.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onclick={onClose}
                        class="text-xs text-zinc-400 hover:text-white"
                    >
                        Tutup
                    </Button>

                    {#if order?.status === "DRAFT"}
                        <Button
                            type="button"
                            size="sm"
                            disabled={actionLoading}
                            onclick={handleReceive}
                            class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 gap-2 shadow-lg shadow-emerald-600/20"
                        >
                            <HugeiconsIcon icon={PackageReceiveIcon} size={16} />
                            {actionLoading ? "Memproses..." : "Terima Barang & Masukkan ke Stok"}
                        </Button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}
