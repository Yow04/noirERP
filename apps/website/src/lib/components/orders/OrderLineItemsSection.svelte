<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PlusSignIcon,
        Delete02Icon,
        AlertCircleIcon,
    } from "@hugeicons/core-free-icons";
    import { formatCurrency } from "$lib/utils";

    export type OrderItemInput = {
        productId: string;
        quantity: number;
        unitPrice: number;
    };

    export type OrderProductOption = {
        id: string;
        name: string;
        sku: string;
        stock: number;
        sellingPrice?: number | string;
        purchasePrice?: number | string;
    };

    type Props = {
        items: OrderItemInput[];
        products: OrderProductOption[];
        mode?: "sales" | "purchase";
        title?: string;
        priceLabel?: string;
    };

    let {
        items = $bindable(),
        products,
        mode = "sales",
        title = mode === "sales" ? "Daftar Produk yang Dijual" : "Daftar Produk yang Dipesan",
        priceLabel = mode === "sales" ? "Harga Jual" : "Harga Beli",
    }: Props = $props();

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
            const defaultPrice =
                mode === "sales"
                    ? Number(prod.sellingPrice ?? 0)
                    : Number(prod.purchasePrice ?? 0);
            items[index].unitPrice = defaultPrice;
        }
    }

    function getProductStock(prodId: string): number {
        const prod = products.find((p) => p.id === prodId);
        return prod ? prod.stock : 0;
    }
</script>

<div class="space-y-3">
    <!-- Header with Title and Counter -->
    <div class="flex items-center justify-between">
        <Label class="text-xs font-medium text-zinc-300">{title}</Label>
        <span class="text-xs text-zinc-500">{items.length} item</span>
    </div>

    <!-- Rows List -->
    <div class="space-y-2.5">
        {#each items as item, index}
            {@const availableStock = getProductStock(item.productId)}
            {@const isStockLow = mode === "sales" && item.productId && item.quantity > availableStock}
            <div
                class="p-3 rounded-xl bg-zinc-900/60 border {isStockLow
                    ? 'border-rose-500/40 bg-rose-500/[0.03]'
                    : 'border-zinc-800/80'} space-y-1.5 transition-colors"
            >
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <!-- Product Selector Dropdown -->
                    <div class="flex-1 w-full sm:w-auto">
                        <select
                            value={item.productId}
                            onchange={(e) =>
                                handleProductChange(
                                    index,
                                    (e.target as HTMLSelectElement).value,
                                )}
                            class="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-700/80 px-2.5 text-xs text-zinc-200 focus:border-violet-500 focus:outline-none transition-colors"
                        >
                            <option value="">-- Pilih Produk --</option>
                            {#each products as prod}
                                <option value={prod.id}>
                                    {prod.name} ({prod.sku}) — Stok: {prod.stock}
                                </option>
                            {/each}
                        </select>
                    </div>

                    <!-- Quantity Input -->
                    <div class="w-24 shrink-0">
                        <div class="relative">
                            <Input
                                type="number"
                                min="1"
                                bind:value={item.quantity}
                                placeholder="Qty"
                                class="h-9 bg-zinc-950 border-zinc-700/80 text-xs pr-7 text-right"
                            />
                            <span
                                class="absolute right-2 top-2 text-[10px] text-zinc-500 pointer-events-none"
                            >
                                pcs
                            </span>
                        </div>
                    </div>

                    <!-- Unit Price Input -->
                    <div class="w-36 shrink-0">
                        <div class="relative">
                            <Input
                                type="number"
                                min="0"
                                bind:value={item.unitPrice}
                                placeholder={priceLabel}
                                class="h-9 bg-zinc-950 border-zinc-700/80 text-xs pl-7 text-right"
                            />
                            <span
                                class="absolute left-2 top-2 text-[10px] text-zinc-500 pointer-events-none"
                            >
                                Rp
                            </span>
                        </div>
                    </div>

                    <!-- Subtotal Display -->
                    <div class="w-28 text-right font-medium text-xs text-zinc-300 shrink-0">
                        {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                    </div>

                    <!-- Delete Row Button -->
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

                <!-- Insufficient Stock Warning for Sales -->
                {#if isStockLow}
                    <div class="text-[11px] text-rose-400 flex items-center gap-1.5 pt-0.5">
                        <HugeiconsIcon icon={AlertCircleIcon} size={13} />
                        <span>
                            Stok tidak cukup! Tersedia hanya {availableStock} unit di gudang.
                        </span>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    <!-- Add Row Button -->
    <Button
        type="button"
        variant="outline"
        size="sm"
        onclick={addItem}
        class="w-full border-dashed border-zinc-700/80 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-300 text-xs h-9 gap-1.5 transition-colors"
    >
        <HugeiconsIcon icon={PlusSignIcon} size={14} />
        Tambah Baris Produk
    </Button>
</div>
