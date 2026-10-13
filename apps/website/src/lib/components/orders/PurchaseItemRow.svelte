<script lang="ts">
    import { Input } from "$lib/components/ui/input";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Delete02Icon } from "@hugeicons/core-free-icons";
    import { formatCurrency } from "$lib/utils";
    import type {
        CreatePurchaseOrderItemInput,
        PurchaseProductOption,
    } from "$lib/types/purchase";

    type Props = {
        item: CreatePurchaseOrderItemInput;
        products: PurchaseProductOption[];
        canRemove: boolean;
        onProductChange: (productId: string) => void;
        onRemove: () => void;
    };

    let {
        item = $bindable(),
        products,
        canRemove,
        onProductChange,
        onRemove,
    }: Props = $props();

    const subtotal = $derived((item.quantity || 0) * (item.unitPrice || 0));
</script>

<div
    class="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3
           rounded-xl bg-zinc-900/60 border border-zinc-800/80"
>
    <!-- Produk Dropdown -->
    <div class="flex-1 w-full sm:w-auto">
        <select
            value={item.productId}
            onchange={(e) =>
                onProductChange((e.target as HTMLSelectElement).value)
            }
            class="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-700/80
                   px-2.5 text-xs text-zinc-200 focus:border-violet-500"
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
            <span
                class="absolute right-2 top-2 text-[10px] text-zinc-500 pointer-events-none"
            >
                pcs
            </span>
        </div>
    </div>

    <!-- Harga Satuan Beli -->
    <div class="w-36 shrink-0">
        <div class="relative">
            <Input
                type="number"
                min="0"
                bind:value={item.unitPrice}
                placeholder="Harga Beli"
                class="h-9 bg-zinc-950 border-zinc-700/80 text-xs pl-7 text-right"
            />
            <span
                class="absolute left-2 top-2 text-[10px] text-zinc-500 pointer-events-none"
            >
                Rp
            </span>
        </div>
    </div>

    <!-- Subtotal -->
    <div class="w-28 text-right font-medium text-xs text-zinc-300 shrink-0">
        {formatCurrency(subtotal)}
    </div>

    <!-- Hapus Baris -->
    <button
        type="button"
        onclick={onRemove}
        disabled={!canRemove}
        class="p-2 text-zinc-500 hover:text-rose-400 disabled:opacity-30
               disabled:hover:text-zinc-500 transition-colors shrink-0"
        title="Hapus baris"
    >
        <HugeiconsIcon icon={Delete02Icon} size={15} />
    </button>
</div>
