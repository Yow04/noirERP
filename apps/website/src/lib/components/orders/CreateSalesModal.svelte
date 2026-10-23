<script lang="ts">
    import { apiFetch, fetchWithFallback } from "$lib/api/client";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Cancel01Icon,
        PlusSignIcon,
        Delete02Icon,
        Invoice01Icon,
        AlertCircleIcon,
    } from "@hugeicons/core-free-icons";
    import { formatCurrency } from "$lib/utils";
    import OrderLineItemsSection from "./OrderLineItemsSection.svelte";

    type ProductOption = {
        id: string;
        name: string;
        sku: string;
        sellingPrice: number | string;
        stock: number;
    };

    type LineItem = {
        productId: string;
        quantity: number;
        unitPrice: number;
    };

    type Props = {
        isOpen: boolean;
        onClose: () => void;
        onSuccess: (newOrder: any) => void;
    };

    let { isOpen, onClose, onSuccess }: Props = $props();

    // Data lists
    let products: ProductOption[] = $state([]);
    let loadingData = $state(false);

    // Form state
    let customerName = $state("");
    let notes = $state("");
    let items = $state<LineItem[]>([
        { productId: "", quantity: 1, unitPrice: 0 },
    ]);

    let submitting = $state(false);
    let error = $state("");

    import { mockProducts } from "$lib/mockData";

    // Ambil data produk saat modal dibuka
    async function loadProducts() {
        loadingData = true;
        try {
            const fallback = mockProducts.map((p) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                sellingPrice: Number(p.sellingPrice),
                stock: p.stock,
            }));

            const res = await fetchWithFallback<any[]>(
                "/inventory/items",
                fallback,
            );
            products = (res.data ?? []).map((p: any) => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                sellingPrice: Number(p.sellingPrice ?? 0),
                stock: p.stock ?? 0,
            }));
        } finally {
            loadingData = false;
        }
    }

    $effect(() => {
        if (isOpen) {
            loadProducts();
            customerName = "";
            notes = "";
            items = [{ productId: "", quantity: 1, unitPrice: 0 }];
            error = "";
        }
    });

    // Helper untuk mengecek stok per baris saat submit
    function getProductStock(prodId: string): number {
        const prod = products.find((p) => p.id === prodId);
        return prod ? prod.stock : 0;
    }

    // Hitung total nilai SO
    const grandTotal = $derived(
        items.reduce(
            (sum, item) => sum + (item.quantity * item.unitPrice || 0),
            0,
        ),
    );

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        error = "";

        // Validasi
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.productId) {
                error = `Baris item ke-${i + 1}: Silakan pilih produk.`;
                return;
            }
            if (!item.quantity || item.quantity < 1) {
                error = `Baris item ke-${i + 1}: Kuantitas minimal 1.`;
                return;
            }
            const stockAvail = getProductStock(item.productId);
            if (item.quantity > stockAvail) {
                const prod = products.find((p) => p.id === item.productId);
                error = `Baris item ke-${i + 1}: Stok "${prod?.name}" tidak cukup (tersedia: ${stockAvail}, diminta: ${item.quantity}).`;
                return;
            }
            if (item.unitPrice < 0) {
                error = `Baris item ke-${i + 1}: Harga jual tidak boleh negatif.`;
                return;
            }
        }

        submitting = true;
        try {
            const payload = {
                customerName: customerName.trim() || null,
                notes: notes.trim() || null,
                items: items.map((it) => ({
                    productId: it.productId,
                    quantity: Number(it.quantity),
                    unitPrice: Number(it.unitPrice),
                })),
            };

            const res = await apiFetch.post("/sales", payload);

            if (!res.success) {
                throw new Error(res.message || "Gagal membuat Sales Order");
            }

            onSuccess(res.data);
            onClose();
        } catch (err) {
            // Live Preview Demo di Vercel: simulasikan sukses
            if (
                err instanceof TypeError ||
                (err instanceof Error && err.message.includes("fetch"))
            ) {
                const grandTotal = items.reduce(
                    (sum, item) => sum + (item.quantity * item.unitPrice || 0),
                    0,
                );
                const mockNewSO = {
                    id: `so-demo-${Date.now()}`,
                    orderNumber: `SO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-9999`,
                    customerName: customerName.trim() || "Pelanggan Demo",
                    status: "DRAFT",
                    notes: notes || "Pesanan dibuat dalam mode demo",
                    totalAmount: grandTotal,
                    totalItems: items.length,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                onSuccess(mockNewSO);
                onClose();
                return;
            }
            error =
                err instanceof Error ? err.message : "Terjadi kesalahan sistem";
        } finally {
            submitting = false;
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
        <div
            class="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
            <!-- Header -->
            <div
                class="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/40"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20"
                    >
                        <HugeiconsIcon icon={Invoice01Icon} size={20} />
                    </div>
                    <div>
                        <h2 class="text-base font-semibold text-white">
                            Buat Sales Order (SO)
                        </h2>
                        <p class="text-xs text-zinc-400">
                            Pencatatan transaksi penjualan (Status awal: Draft)
                        </p>
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

            <!-- Content Form -->
            <form
                onsubmit={handleSubmit}
                class="flex flex-col flex-1 overflow-hidden"
            >
                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    {#if error}
                        <div
                            class="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400"
                        >
                            <HugeiconsIcon
                                icon={AlertCircleIcon}
                                size={16}
                                class="shrink-0 mt-0.5"
                            />
                            <span>{error}</span>
                        </div>
                    {/if}

                    <!-- Section Pelanggan -->
                    <div class="space-y-2">
                        <Label class="text-xs font-medium text-zinc-300"
                            >Nama Pelanggan (Customer)</Label
                        >
                        <Input
                            bind:value={customerName}
                            placeholder="Contoh: Budi Santoso / Walk-in Customer"
                            class="bg-zinc-900 border-zinc-800 text-xs"
                        />
                    </div>

                    <!-- Line Items Section (Reusable Component) -->
                    <OrderLineItemsSection bind:items {products} mode="sales" />

                    <!-- Notes & Total Summary -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label
                                class="text-xs font-medium text-zinc-300 block mb-1.5"
                                >Catatan Penjualan (Opsional)</Label
                            >
                            <textarea
                                bind:value={notes}
                                rows="3"
                                placeholder="Contoh: Pembayaran tunai lunas, diantar kurir..."
                                class="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                            ></textarea>
                        </div>

                        <div
                            class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between"
                        >
                            <div class="space-y-1">
                                <div
                                    class="text-[11px] text-zinc-400 uppercase tracking-wider"
                                >
                                    Total Penjualan
                                </div>
                                <div class="text-2xl font-bold text-violet-400">
                                    {formatCurrency(grandTotal)}
                                </div>
                            </div>
                            <div class="text-[11px] text-zinc-500">
                                * Stok belum berkurang hingga transaksi
                                dikonfirmasi (Status: <strong>COMPLETED</strong
                                >).
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div
                    class="flex items-center justify-end gap-2.5 border-t border-zinc-800/80 px-6 py-4 bg-zinc-900/40"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onclick={onClose}
                        class="text-xs text-zinc-400 hover:text-white"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={submitting || items.length === 0}
                        class="bg-violet-600 hover:bg-violet-500 text-white text-xs px-5 shadow-lg shadow-violet-600/20"
                    >
                        {submitting ? "Membuat SO..." : "Buat Sales Order"}
                    </Button>
                </div>
            </form>
        </div>
    </div>
{/if}
