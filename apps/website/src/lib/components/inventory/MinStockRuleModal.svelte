<script lang="ts">
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Settings02Icon, Cancel01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons";
    import type { InventoryItem } from "$lib/types/inventory";

    type Props = {
        item: InventoryItem | null;
        isOpen: boolean;
        onClose: () => void;
        onSuccess: (updatedItem: any) => void;
    };

    let { item, isOpen, onClose, onSuccess }: Props = $props();

    let minStockValue = $state(5);
    let saving = $state(false);
    let error = $state("");

    $effect(() => {
        if (item) {
            minStockValue = item.minStock ?? 5;
            error = "";
        }
    });

    async function handleSave() {
        if (!item) return;

        if (minStockValue < 0 || !Number.isInteger(Number(minStockValue))) {
            error = "Stok minimum harus berupa bilangan bulat positif (>= 0).";
            return;
        }

        saving = true;
        error = "";

        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/inventory/items/${item.id}/min-stock`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ minStock: Number(minStockValue) }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Gagal memperbarui aturan stok minimum.");
            }

            onSuccess(result.data);
            onClose();
        } catch (err) {
            error = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan aturan.";
        } finally {
            saving = false;
        }
    }
</script>

{#if isOpen && item}
    <!-- Backdrop -->
    <div
        class="modal-backdrop"
        role="presentation"
        onclick={onClose}
    >
        <!-- Modal Dialog -->
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
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                        <HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={2} />
                    </div>
                    <div>
                        <h3 class="text-base font-semibold text-white">Aturan Stok Minimum</h3>
                        <p class="text-xs text-zinc-400">Tentukan batas ambang reorder point produk</p>
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

            <!-- Body -->
            <div class="space-y-4 py-4">
                {#if error}
                    <div class="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                        <HugeiconsIcon icon={AlertCircleIcon} size={16} strokeWidth={2} />
                        <span>{error}</span>
                    </div>
                {/if}

                <!-- Product Summary Card -->
                <div class="rounded-xl border border-white/8 bg-white/[0.02] p-3.5 text-xs space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-zinc-400">SKU:</span>
                        <span class="font-mono font-medium text-white">{item.sku}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-zinc-400">Nama Produk:</span>
                        <span class="font-medium text-white text-right max-w-[200px] truncate">{item.name}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-zinc-400">Stok Fisik Saat Ini:</span>
                        <span class="font-bold text-emerald-400">{item.stock} unit</span>
                    </div>
                </div>

                <!-- Input Min Stock -->
                <div class="space-y-2">
                    <Label for="minStockInput">Batas Stok Minimum (Unit)</Label>
                    <Input
                        id="minStockInput"
                        type="number"
                        min="0"
                        step="1"
                        bind:value={minStockValue}
                        placeholder="Contoh: 10"
                        class="text-base md:text-sm font-semibold"
                    />
                    <p class="text-[11px] leading-relaxed text-zinc-400">
                        🔔 Sistem akan memunculkan status <strong class="text-amber-300">Stok Menipis</strong> ketika stok produk berada di bawah atau sama dengan batas ini.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">
                <Button variant="outline" onclick={onClose} disabled={saving}>
                    Batal
                </Button>
                <Button onclick={handleSave} disabled={saving}>
                    {saving ? "Menyimpan..." : "Simpan Aturan"}
                </Button>
            </div>
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
        max-width: 28rem;
        border-radius: 1.25rem;
        background: oklch(0.18 0.008 260);
        border: 1px solid oklch(1 0 0 / 12%);
        padding: 1.5rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75);
        animation: scaleUp 0.15s ease-out;
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
