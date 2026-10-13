<script lang="ts">
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Cancel01Icon,
        PlusSignIcon,
        ShoppingCart01Icon,
        AlertCircleIcon,
        Add01Icon,
    } from "@hugeicons/core-free-icons";
    import type {
        Supplier,
        PurchaseProductOption,
        CreatePurchaseOrderItemInput,
    } from "$lib/types/purchase";
    import { formatCurrency } from "$lib/utils";
    import QuickAddSupplierForm from "./QuickAddSupplierForm.svelte";
    import PurchaseItemRow from "./PurchaseItemRow.svelte";

    type Props = {
        isOpen: boolean;
        onClose: () => void;
        onSuccess: (newOrder: any) => void;
    };

    let { isOpen, onClose, onSuccess }: Props = $props();

    // Data lists
    let suppliers = $state<Supplier[]>([]);
    let products = $state<PurchaseProductOption[]>([]);
    let loadingData = $state(false);

    // Form state
    let selectedSupplierId = $state("");
    let notes = $state("");
    let items = $state<CreatePurchaseOrderItemInput[]>([
        { productId: "", quantity: 1, unitPrice: 0 },
    ]);
    let showAddSupplier = $state(false);
    let submitting = $state(false);
    let error = $state("");

    // Total kalkulasi
    const grandTotal = $derived(
        items.reduce(
            (sum, item) => sum + (item.quantity * item.unitPrice || 0),
            0
        )
    );

    async function loadInitialData() {
        loadingData = true;
        try {
            const [supRes, prodRes] = await Promise.all([
                fetch(`${PUBLIC_API_BASE_URL}/purchases/suppliers`),
                fetch(`${PUBLIC_API_BASE_URL}/inventory/items`),
            ]);

            const supJson = await supRes.json();
            const prodJson = await prodRes.json();

            if (supRes.ok && supJson.success) {
                suppliers = supJson.data ?? [];
            }
            if (prodRes.ok && prodJson.success) {
                products = (prodJson.data ?? []).map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    purchasePrice: Number(p.purchasePrice ?? 0),
                    stock: p.stock ?? 0,
                }));
            }
        } catch (err) {
            console.error("Gagal mengambil data untuk form PO:", err);
        } finally {
            loadingData = false;
        }
    }

    $effect(() => {
        if (isOpen) {
            loadInitialData();
            items = [{ productId: "", quantity: 1, unitPrice: 0 }];
            selectedSupplierId = "";
            notes = "";
            error = "";
            showAddSupplier = false;
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
            items[index].unitPrice = Number(prod.purchasePrice);
        }
    }

    function handleSupplierCreated(newSupplier: Supplier) {
        suppliers = [...suppliers, newSupplier];
        selectedSupplierId = newSupplier.id;
        showAddSupplier = false;
    }

    function validateItems(): boolean {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.productId) {
                error = `Baris item ke-${i + 1}: Silakan pilih produk.`;
                return false;
            }
            if (!item.quantity || item.quantity < 1) {
                error = `Baris item ke-${i + 1}: Kuantitas minimal 1.`;
                return false;
            }
            if (item.unitPrice < 0) {
                error = `Baris item ke-${i + 1}: Harga beli tidak boleh negatif.`;
                return false;
            }
        }
        return true;
    }

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();
        error = "";

        if (!validateItems()) return;

        submitting = true;
        try {
            const payload = {
                supplierId: selectedSupplierId || null,
                notes: notes.trim() || null,
                items: items.map((it) => ({
                    productId: it.productId,
                    quantity: Number(it.quantity),
                    unitPrice: Number(it.unitPrice),
                })),
            };

            const res = await fetch(`${PUBLIC_API_BASE_URL}/purchases`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || "Gagal membuat Purchase Order");
            }

            onSuccess(json.data);
            onClose();
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan sistem";
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
            class="relative w-full max-w-3xl overflow-hidden rounded-2xl
                   bg-zinc-950 border border-zinc-800 shadow-2xl z-10
                   max-h-[90vh] flex flex-col"
        >
            <!-- Header -->
            <div
                class="flex items-center justify-between border-b
                       border-zinc-800/80 px-6 py-4 bg-zinc-900/40"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="flex h-10 w-10 items-center justify-center
                               rounded-xl bg-violet-500/10 text-violet-400
                               border border-violet-500/20"
                    >
                        <HugeiconsIcon icon={ShoppingCart01Icon} size={20} />
                    </div>
                    <div>
                        <h2 class="text-base font-semibold text-white">
                            Buat Purchase Order (PO)
                        </h2>
                        <p class="text-xs text-zinc-400">
                            Pemesanan barang ke supplier (Status awal: Draft)
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onclick={onClose}
                    class="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800
                           hover:text-white transition-colors"
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
                            class="flex items-start gap-3 rounded-xl border
                                   border-rose-500/20 bg-rose-500/10 p-3.5
                                   text-xs text-rose-400"
                        >
                            <HugeiconsIcon
                                icon={AlertCircleIcon}
                                size={16}
                                class="shrink-0 mt-0.5"
                            />
                            <span>{error}</span>
                        </div>
                    {/if}

                    <!-- Section Supplier -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <Label class="text-xs font-medium text-zinc-300">
                                Supplier / Vendor
                            </Label>
                            <button
                                type="button"
                                class="text-xs text-violet-400 hover:text-violet-300
                                       flex items-center gap-1 font-medium"
                                onclick={() =>
                                    (showAddSupplier = !showAddSupplier)}
                            >
                                <HugeiconsIcon icon={Add01Icon} size={13} />
                                {showAddSupplier
                                    ? "Pilih dari daftar"
                                    : "+ Supplier Baru"}
                            </button>
                        </div>

                        {#if showAddSupplier}
                            <QuickAddSupplierForm
                                onSuccess={handleSupplierCreated}
                                onCancel={() => (showAddSupplier = false)}
                            />
                        {:else}
                            <select
                                bind:value={selectedSupplierId}
                                class="w-full h-10 rounded-xl bg-zinc-900 border
                                       border-zinc-800 px-3 text-xs text-zinc-200
                                       focus:outline-none focus:border-violet-500
                                       focus:ring-1 focus:ring-violet-500 transition-colors"
                            >
                                <option value="">
                                    -- Pilih Supplier (Opsional / Umum) --
                                </option>
                                {#each suppliers as sup}
                                    <option value={sup.id}>
                                        {sup.name} {sup.phone ? `(${sup.phone})` : ""}
                                    </option>
                                {/each}
                            </select>
                        {/if}
                    </div>

                    <!-- Line Items Section -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <Label class="text-xs font-medium text-zinc-300">
                                Daftar Produk yang Dipesan
                            </Label>
                            <span class="text-xs text-zinc-500">
                                {items.length} item
                            </span>
                        </div>

                        <div class="space-y-2.5">
                            {#each items as _, index}
                                <PurchaseItemRow
                                    bind:item={items[index]}
                                    {products}
                                    canRemove={items.length > 1}
                                    onProductChange={(prodId) =>
                                        handleProductChange(index, prodId)}
                                    onRemove={() => removeItem(index)}
                                />
                            {/each}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onclick={addItem}
                            class="w-full border-dashed border-zinc-700/80
                                   hover:border-violet-500/50 hover:bg-violet-500/5
                                   text-zinc-300 text-xs h-9 gap-1.5"
                        >
                            <HugeiconsIcon icon={PlusSignIcon} size={14} />
                            Tambah Baris Produk
                        </Button>
                    </div>

                    <!-- Notes & Total Summary -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label class="text-xs font-medium text-zinc-300 block mb-1.5">
                                Catatan PO (Opsional)
                            </Label>
                            <textarea
                                bind:value={notes}
                                rows="3"
                                placeholder="Contoh: Estimasi pengiriman hari Jumat, vendor minta DP 50%..."
                                class="w-full rounded-xl bg-zinc-900 border
                                       border-zinc-800 p-2.5 text-xs text-zinc-200
                                       placeholder-zinc-500 focus:outline-none
                                       focus:border-violet-500"
                            ></textarea>
                        </div>

                        <div
                            class="p-4 rounded-xl bg-zinc-900/60 border
                                   border-zinc-800/80 flex flex-col justify-between"
                        >
                            <div class="space-y-1">
                                <div class="text-[11px] text-zinc-400 uppercase tracking-wider">
                                    Total Nilai Pembelian
                                </div>
                                <div class="text-2xl font-bold text-violet-400">
                                    {formatCurrency(grandTotal)}
                                </div>
                            </div>
                            <div class="text-[11px] text-zinc-500">
                                * Stok belum bertambah hingga status diubah ke
                                <strong>RECEIVED</strong> (Terima Barang).
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div
                    class="flex items-center justify-end gap-2.5 border-t
                           border-zinc-800/80 px-6 py-4 bg-zinc-900/40"
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
                        class="bg-violet-600 hover:bg-violet-500 text-white text-xs px-5
                               shadow-lg shadow-violet-600/20"
                    >
                        {submitting ? "Membuat PO..." : "Buat Purchase Order"}
                    </Button>
                </div>
            </form>
        </div>
    </div>
{/if}
