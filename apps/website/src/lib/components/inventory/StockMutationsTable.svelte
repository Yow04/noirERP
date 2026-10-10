<script lang="ts">
    import type { StockMutation } from "$lib/types/inventory";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PackageReceiveIcon,
        PackageRemoveIcon,
        PackageProcessIcon,
        PackageOpenIcon,
    } from "@hugeicons/core-free-icons";

    type Props = {
        mutations: StockMutation[];
        loading?: boolean;
    };

    let { mutations, loading = false }: Props = $props();

    function formatDate(dateStr: string): string {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(d);
    }

    function getMutationBadge(type: StockMutation["type"]) {
        switch (type) {
            case "INITIAL":
                return {
                    label: "Stok Awal",
                    icon: PackageOpenIcon,
                    classes: "bg-purple-500/10 text-purple-300 border-purple-500/20",
                };
            case "IN":
                return {
                    label: "Masuk",
                    icon: PackageReceiveIcon,
                    classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                };
            case "OUT":
                return {
                    label: "Keluar",
                    icon: PackageRemoveIcon,
                    classes: "bg-rose-500/10 text-rose-300 border-rose-500/20",
                };
            case "ADJUSTMENT":
                return {
                    label: "Opname",
                    icon: PackageProcessIcon,
                    classes: "bg-blue-500/10 text-blue-300 border-blue-500/20",
                };
        }
    }
</script>

<div class="overflow-x-auto rounded-xl border border-white/8 bg-white/[0.01]">
    {#if loading}
        <div class="p-8 text-center text-sm text-zinc-400">
            <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-2"></div>
            <p>Memuat riwayat mutasi stok...</p>
        </div>
    {:else if mutations.length === 0}
        <div class="p-12 text-center">
            <p class="font-medium text-white">Belum ada riwayat mutasi stok</p>
            <p class="mt-1 text-xs text-zinc-400">
                Mutasi stok akan otomatis tercatat saat menambah produk atau melakukan mutasi.
            </p>
        </div>
    {:else}
        <table class="w-full text-left text-sm">
            <thead class="border-b border-white/8 bg-white/[0.02] text-xs font-semibold text-zinc-400">
                <tr>
                    <th class="px-4 py-3">Waktu</th>
                    <th class="px-4 py-3">Produk</th>
                    <th class="px-4 py-3">Tipe</th>
                    <th class="px-4 py-3">Perubahan Stok</th>
                    <th class="px-4 py-3">No. Referensi</th>
                    <th class="px-4 py-3">Keterangan</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/6 text-xs">
                {#each mutations as mut (mut.id)}
                    {@const badge = getMutationBadge(mut.type)}
                    {@const delta = mut.currentStock - mut.previousStock}
                    <tr class="hover:bg-white/[0.02] transition-colors">
                        <!-- Waktu -->
                        <td class="whitespace-nowrap px-4 py-3 text-zinc-400">
                            {formatDate(mut.createdAt)}
                        </td>

                        <!-- Produk -->
                        <td class="px-4 py-3">
                            <div class="font-medium text-white">{mut.productName}</div>
                            <div class="font-mono text-[11px] text-zinc-400">{mut.productSku}</div>
                        </td>

                        <!-- Tipe Mutasi -->
                        <td class="whitespace-nowrap px-4 py-3">
                            <span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium {badge.classes}">
                                <HugeiconsIcon icon={badge.icon} size={13} strokeWidth={2} />
                                <span>{badge.label}</span>
                            </span>
                        </td>

                        <!-- Perubahan Stok -->
                        <td class="whitespace-nowrap px-4 py-3 font-mono">
                            <span class="text-zinc-400">{mut.previousStock}</span>
                            <span class="mx-1 text-zinc-600">→</span>
                            <span class="font-bold {delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                                {mut.currentStock} unit
                            </span>
                            <span class="ml-1 text-[11px] text-zinc-500">
                                ({delta >= 0 ? `+${delta}` : delta})
                            </span>
                        </td>

                        <!-- Referensi -->
                        <td class="whitespace-nowrap px-4 py-3">
                            {#if mut.reference}
                                <span class="rounded bg-white/5 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                                    {mut.reference}
                                </span>
                            {:else}
                                <span class="text-zinc-600">—</span>
                            {/if}
                        </td>

                        <!-- Keterangan -->
                        <td class="px-4 py-3 text-zinc-400 max-w-xs truncate">
                            {mut.notes || "—"}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
