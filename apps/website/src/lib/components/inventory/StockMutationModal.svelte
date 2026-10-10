<script lang="ts">
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PackageReceiveIcon,
        PackageRemoveIcon,
        PackageProcessIcon,
        Cancel01Icon,
        AlertCircleIcon,
    } from "@hugeicons/core-free-icons";
    import type { InventoryItem, StockMutationType } from "$lib/types/inventory";

    type Props = {
        productsList: InventoryItem[];
        preselectedProduct?: InventoryItem | null;
        isOpen: boolean;
        onClose: () => void;
        onSuccess: (result: any) => void;
    };

    let { productsList, preselectedProduct = null, isOpen, onClose, onSuccess }: Props = $props();

    let selectedProductId = $state("");
    let mutationType: StockMutationType = $state("IN");
    let quantity = $state("1");
    let reference = $state("");
    let notes = $state("");

    let submitting = $state(false);
    let error = $state("");

    // Temukan produk yang sedang aktif
    const activeProduct = $derived(
        productsList.find((p) => p.id === selectedProductId) ?? preselectedProduct
    );

    $effect(() => {
        if (preselectedProduct) {
            selectedProductId = preselectedProduct.id;
        } else if (productsList.length > 0 && !selectedProductId) {
            selectedProductId = productsList[0].id;
        }
    });

    // Kalkulasi preview perubahan stok
    const preview = $derived(() => {
        if (!activeProduct) {
            return { valid: false, previous: 0, next: 0, delta: 0, warning: "" };
        }

        const qtyNum = Number(quantity);
        if (isNaN(qtyNum) || !Number.isInteger(qtyNum)) {
            return { valid: false, previous: activeProduct.stock, next: activeProduct.stock, delta: 0, warning: "Jumlah harus berupa bilangan bulat." };
        }

        const prev = activeProduct.stock;
        let next = prev;
        let delta = 0;
        let warning = "";

        if (mutationType === "IN") {
            if (qtyNum <= 0) return { valid: false, previous: prev, next: prev, delta: 0, warning: "Jumlah masuk harus lebih dari 0." };
            next = prev + qtyNum;
            delta = qtyNum;
        } else if (mutationType === "OUT") {
            if (qtyNum <= 0) return { valid: false, previous: prev, next: prev, delta: 0, warning: "Jumlah keluar harus lebih dari 0." };
            if (qtyNum > prev) {
                return { valid: false, previous: prev, next: prev - qtyNum, delta: -qtyNum, warning: `Stok tidak mencukupi! Maksimal pengurangan: ${prev} unit.` };
            }
            next = prev - qtyNum;
            delta = -qtyNum;
        } else if (mutationType === "ADJUSTMENT") {
            if (qtyNum < 0) return { valid: false, previous: prev, next: prev, delta: 0, warning: "Stok fisik hasil opname tidak boleh negatif." };
            next = qtyNum;
            delta = next - prev;
        }

        if (next <= activeProduct.minStock && next > 0) {
            warning = `⚠️ Perhatian: Stok akan berada di bawah atau sama dengan batas minimum (${activeProduct.minStock} unit).`;
        } else if (next === 0) {
            warning = `🚨 Perhatian: Stok produk akan menjadi HABIS (0 unit).`;
        }

        return { valid: true, previous: prev, next, delta, warning };
    });

    async function handleSubmit(e: SubmitEvent) {
        e.preventDefault();

        if (!activeProduct) {
            error = "Pilih produk terlebih dahulu.";
            return;
        }

        const p = preview();
        if (!p.valid) {
            error = p.warning || "Periksa kembali input kuantitas.";
            return;
        }

        submitting = true;
        error = "";

        const payload = {
            productId: activeProduct.id,
            type: mutationType,
            quantity: Number(quantity),
            adjustmentMode: mutationType === "ADJUSTMENT" ? "SET" : undefined,
            reference: reference.trim() || null,
            notes: notes.trim() || null,
        };

        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/inventory/mutations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Gagal mencatat mutasi stok.");
            }

            onSuccess(result.data);
            onClose();
        } catch (err) {
            error = err instanceof Error ? err.message : "Terjadi kesalahan saat mencatat mutasi.";
        } finally {
            submitting = false;
        }
    }
</script>

{#if isOpen}
    <div
        class="modal-backdrop"
        role="presentation"
        onclick={onClose}
    >
        <div
            class="modal-box"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.key === 'Escape' && onClose()}
        >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-white/10 pb-4">
                <div class="flex items-center gap-2.5">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                        <HugeiconsIcon icon={PackageReceiveIcon} size={18} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 class="text-base font-semibold text-white">Catat Mutasi Stok</h3>
                        <p class="text-xs text-zinc-400">Rekam mutasi masuk, keluar, atau opname fisik</p>
                    </div>
                </div>
                <button
                    type="button"
                    class="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                    onclick={onClose}
                    aria-label="Tutup"
                >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
                </button>
            </div>

            <form onsubmit={handleSubmit} class="space-y-4 py-4">
                {#if error}
                    <div class="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={2} />
                        <span>{error}</span>
                    </div>
                {/if}

                <!-- Pilih Produk -->
                <div class="space-y-1.5">
                    <Label for="productSelect">Pilih Produk <span class="text-destructive">*</span></Label>
                    {#if preselectedProduct}
                        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
                            <div class="flex justify-between">
                                <span class="font-medium text-white">{preselectedProduct.name}</span>
                                <span class="font-mono text-zinc-400">{preselectedProduct.sku}</span>
                            </div>
                            <div class="mt-1 text-zinc-400">
                                Stok Saat Ini: <strong class="text-emerald-400">{preselectedProduct.stock} unit</strong> (Batas Min: {preselectedProduct.minStock})
                            </div>
                        </div>
                    {:else}
                        <select
                            id="productSelect"
                            bind:value={selectedProductId}
                            class="select-input"
                        >
                            {#each productsList as prod (prod.id)}
                                <option value={prod.id}>
                                    {prod.sku} — {prod.name} (Stok: {prod.stock})
                                </option>
                            {/each}
                        </select>
                    {/if}
                </div>

                <!-- Tipe Mutasi Tabs -->
                <div class="space-y-1.5">
                    <Label>Tipe Mutasi <span class="text-destructive">*</span></Label>
                    <div class="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            class="type-btn {mutationType === 'IN' ? 'active-in' : ''}"
                            onclick={() => (mutationType = 'IN')}
                        >
                            <HugeiconsIcon icon={PackageReceiveIcon} size={16} strokeWidth={2} />
                            <span>Stok Masuk</span>
                        </button>
                        <button
                            type="button"
                            class="type-btn {mutationType === 'OUT' ? 'active-out' : ''}"
                            onclick={() => (mutationType = 'OUT')}
                        >
                            <HugeiconsIcon icon={PackageRemoveIcon} size={16} strokeWidth={2} />
                            <span>Stok Keluar</span>
                        </button>
                        <button
                            type="button"
                            class="type-btn {mutationType === 'ADJUSTMENT' ? 'active-adj' : ''}"
                            onclick={() => (mutationType = 'ADJUSTMENT')}
                        >
                            <HugeiconsIcon icon={PackageProcessIcon} size={16} strokeWidth={2} />
                            <span>Opname Fisik</span>
                        </button>
                    </div>
                </div>

                <!-- Kuantitas -->
                <div class="space-y-1.5">
                    <Label for="mutationQty">
                        {mutationType === 'ADJUSTMENT' ? 'Jumlah Fisik Aktual (Opname)' : 'Kuantitas Unit'} <span class="text-destructive">*</span>
                    </Label>
                    <Input
                        id="mutationQty"
                        type="number"
                        min={mutationType === 'ADJUSTMENT' ? '0' : '1'}
                        step="1"
                        bind:value={quantity}
                        placeholder={mutationType === 'ADJUSTMENT' ? 'Hitungan fisik riil di gudang' : 'Jumlah unit'}
                        class="text-base md:text-sm font-semibold"
                    />
                </div>

                <!-- Live Preview Perubahan Stok -->
                {#if activeProduct}
                    {@const p = preview()}
                    <div class="rounded-xl border border-white/8 bg-white/[0.02] p-3.5 text-xs space-y-2">
                        <div class="flex items-center justify-between text-zinc-400">
                            <span>Perubahan Stok:</span>
                            <div class="flex items-center gap-2 font-mono">
                                <span class="text-zinc-300">{p.previous}</span>
                                <span>→</span>
                                <span class="font-bold {p.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                                    {p.next} unit
                                </span>
                                <span class="text-[11px] text-zinc-500">
                                    ({p.delta >= 0 ? `+${p.delta}` : p.delta})
                                </span>
                            </div>
                        </div>

                        {#if p.warning}
                            <p class="text-[11px] text-amber-300/90 leading-tight">
                                {p.warning}
                            </p>
                        {/if}
                    </div>
                {/if}

                <!-- Referensi & Catatan -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                        <Label for="mutationRef">No. Referensi (Opsional)</Label>
                        <Input
                            id="mutationRef"
                            bind:value={reference}
                            placeholder="Contoh: PO-001, OPNAME-01"
                        />
                    </div>
                    <div class="space-y-1.5">
                        <Label for="mutationNotes">Keterangan / Alasan</Label>
                        <Input
                            id="mutationNotes"
                            bind:value={notes}
                            placeholder="Contoh: Penerimaan restock"
                        />
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">
                    <Button variant="outline" type="button" onclick={onClose} disabled={submitting}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={submitting || !preview().valid}>
                        {submitting ? "Memproses..." : "Simpan Mutasi"}
                    </Button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 70;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }

    .modal-box {
        width: 100%;
        max-width: 32rem;
        border-radius: 1.25rem;
        background: oklch(0.18 0.008 260);
        border: 1px solid oklch(1 0 0 / 12%);
        padding: 1.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
        animation: scaleUp 0.15s ease-out;
    }

    .select-input {
        width: 100%;
        height: 2.25rem;
        border-radius: 0.625rem;
        border: 1px solid oklch(1 0 0 / 14%);
        background: oklch(0.15 0 0);
        color: white;
        padding: 0 0.75rem;
        font-size: 0.875rem;
        outline: none;
    }

    .select-input:focus {
        border-color: oklch(0.65 0.18 270);
    }

    .type-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.625rem 0.5rem;
        border-radius: 0.75rem;
        border: 1px solid oklch(1 0 0 / 10%);
        background: oklch(1 0 0 / 3%);
        color: oklch(0.7 0 0);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .type-btn:hover {
        background: oklch(1 0 0 / 6%);
        color: white;
    }

    .active-in {
        border-color: oklch(0.65 0.18 150 / 40%);
        background: oklch(0.65 0.18 150 / 15%);
        color: oklch(0.85 0.18 150);
    }

    .active-out {
        border-color: oklch(0.65 0.18 25 / 40%);
        background: oklch(0.65 0.18 25 / 15%);
        color: oklch(0.85 0.18 25);
    }

    .active-adj {
        border-color: oklch(0.65 0.18 250 / 40%);
        background: oklch(0.65 0.18 250 / 15%);
        color: oklch(0.85 0.18 250);
    }

    @keyframes scaleUp {
        from {
            opacity: 0;
            transform: scale(0.96);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>
