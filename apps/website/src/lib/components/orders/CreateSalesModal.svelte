<script lang="ts">
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
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

    // Ambil data produk saat modal dibuka
    async function loadProducts() {
        loadingData = true;
        try {
            const res = await fetch(`${PUBLIC_API_BASE_URL}/inventory/items`);
            const json = await res.json();
            if (res.ok && json.success) {
                products = (json.data ?? []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    sellingPrice: Number(p.sellingPrice ?? 0),
                    stock: p.stock ?? 0,
                }));
            }
        } catch (err) {
            console.error("Gagal mengambil data produk untuk penjualan:", err);
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

    function addItem() {
        items = [...items, { productId: "", quantity: 1, unitPrice: 0 }];
    }

    function removeItem(index: number) {
        if (items.length > 1) {
            items = items.filter((_, i) => i !== index);
        }
    }

    function handleProductChange(index: number, prodId: string) {
        const prod = products.find((p) => p.id === prodId);
        items[index].productId = prodId;
        if (prod) {
            items[index].unitPrice = Number(prod.sellingPrice);
        }
    }

    // Helper untuk mengecek stok per baris
    function getProductStock(prodId: string): number {
        const prod = products.find((p) => p.id === prodId);
        return prod ? prod.stock : 0;
    }

    // Hitung total nilai SO
    const grandTotal = $derived(
        items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0)
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

            const res = await fetch(`${PUBLIC_API_BASE_URL}/sales`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Gagal membuat Sales Order");
            }

            onSuccess(json.data);
            onClose();
        } catch (err) {
            error = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
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
        <div class="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl z-10 max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <HugeiconsIcon icon={Invoice01Icon} size={20} />
                    </div>
                    <div>
                        <h2 class="text-base font-semibold text-white">Buat Sales Order (SO)</h2>
                        <p class="text-xs text-zinc-400">Pencatatan transaksi penjualan (Status awal: Draft)</p>
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
            <form onsubmit={handleSubmit} class="flex flex-col flex-1 overflow-hidden">
                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    {#if error}
                        <div class="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400">
                            <HugeiconsIcon icon={AlertCircleIcon} size={16} class="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    {/if}

                    <!-- Section Pelanggan -->
                    <div class="space-y-2">
                        <Label class="text-xs font-medium text-zinc-300">Nama Pelanggan (Customer)</Label>
                        <Input
                            bind:value={customerName}
                            placeholder="Contoh: Budi Santoso / Walk-in Customer"
                            class="bg-zinc-900 border-zinc-800 text-xs"
                        />
                    </div>

                    <!-- Line Items Section -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <Label class="text-xs font-medium text-zinc-300">Daftar Produk yang Dijual</Label>
                            <span class="text-xs text-zinc-500">{items.length} item</span>
                        </div>

                        <div class="space-y-2.5">
                            {#each items as item, index}
                                {@const availableStock = getProductStock(item.productId)}
                                {@const isStockLow = item.productId && item.quantity > availableStock}
                                <div class="p-3 rounded-xl bg-zinc-900/60 border {isStockLow ? 'border-rose-500/40 bg-rose-500/[0.03]' : 'border-zinc-800/80'} space-y-1.5">
                                    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <!-- Produk Dropdown -->
                                        <div class="flex-1 w-full sm:w-auto">
                                            <select
                                                value={item.productId}
                                                onchange={(e) => handleProductChange(index, (e.target as HTMLSelectElement).value)}
                                                class="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-700/80 px-2.5 text-xs text-zinc-200 focus:border-violet-500"
                                            >
                                                <option value="">-- Pilih Produk --</option>
                                                {#each products as prod}
                                                    <option value={prod.id}>
                                                        {prod.name} ({prod.sku}) — Stok: {prod.stock}
                                                    </option>
                                                {/each}
                                            </select>
                                        </div>

                                        <!-- Kuantitas -->
                                        <div class="w-24 shrink-0">
                                            <div class="relative">
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    bind:value={item.quantity}
                                                    placeholder="Qty"
                                                    class="h-9 bg-zinc-950 border-zinc-700/80 text-xs pr-7 text-right"
                                                />
                                                <span class="absolute right-2 top-2 text-[10px] text-zinc-500 pointer-events-none">pcs</span>
                                            </div>
                                        </div>

                                        <!-- Harga Satuan Jual -->
                                        <div class="w-36 shrink-0">
                                            <div class="relative">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    bind:value={item.unitPrice}
                                                    placeholder="Harga Jual"
                                                    class="h-9 bg-zinc-950 border-zinc-700/80 text-xs pl-7 text-right"
                                                />
                                                <span class="absolute left-2 top-2 text-[10px] text-zinc-500 pointer-events-none">Rp</span>
                                            </div>
                                        </div>

                                        <!-- Subtotal -->
                                        <div class="w-28 text-right font-medium text-xs text-zinc-300 shrink-0">
                                            {formatCurrency(item.quantity * item.unitPrice || 0)}
                                        </div>

                                        <!-- Hapus Baris -->
                                        <button
                                            type="button"
                                            onclick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            class="p-2 text-zinc-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors shrink-0"
                                            title="Hapus baris"
                                        >
                                            <HugeiconsIcon icon={Delete02Icon} size={15} />
                                        </button>
                                    </div>

                                    {#if item.productId && isStockLow}
                                        <div class="text-[11px] text-rose-400 flex items-center gap-1.5 pt-0.5">
                                            <HugeiconsIcon icon={AlertCircleIcon} size={13} />
                                            <span>Stok tidak cukup! Tersedia hanya {availableStock} unit di gudang.</span>
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>

                        <!-- Tombol Tambah Item -->
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onclick={addItem}
                            class="w-full border-dashed border-zinc-700/80 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-300 text-xs h-9 gap-1.5"
                        >
                            <HugeiconsIcon icon={PlusSignIcon} size={14} />
                            Tambah Baris Produk
                        </Button>
                    </div>

                    <!-- Notes & Total Summary -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label class="text-xs font-medium text-zinc-300 block mb-1.5">Catatan Penjualan (Opsional)</Label>
                            <textarea
                                bind:value={notes}
                                rows="3"
                                placeholder="Contoh: Pembayaran tunai lunas, diantar kurir..."
                                class="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                            ></textarea>
                        </div>

                        <div class="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
                            <div class="space-y-1">
                                <div class="text-[11px] text-zinc-400 uppercase tracking-wider">Total Penjualan</div>
                                <div class="text-2xl font-bold text-violet-400">
                                    {formatCurrency(grandTotal)}
                                </div>
                            </div>
                            <div class="text-[11px] text-zinc-500">
                                * Stok belum berkurang hingga transaksi dikonfirmasi (Status: <strong>COMPLETED</strong>).
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="flex items-center justify-end gap-2.5 border-t border-zinc-800/80 px-6 py-4 bg-zinc-900/40">
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
