<script lang="ts">
    import { apiFetch } from "$lib/api/client";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Alert } from "$lib/components/ui/alert";
    import type { Supplier } from "$lib/types/purchase";

    type Props = {
        onSuccess: (supplier: Supplier) => void;
        onCancel: () => void;
    };

    let { onSuccess, onCancel }: Props = $props();

    let name = $state("");
    let phone = $state("");
    let contactPerson = $state("");
    let loading = $state(false);
    let errorMessage = $state("");

    async function handleSave() {
        if (!name.trim()) {
            errorMessage = "Nama supplier wajib diisi.";
            return;
        }

        loading = true;
        errorMessage = "";

        try {
            const res = await apiFetch.post("/purchases/suppliers", {
                name: name.trim(),
                phone: phone.trim() || undefined,
                contactPerson: contactPerson.trim() || undefined,
            });

            if (!res.success) {
                throw new Error(res.message || "Gagal membuat supplier.");
            }

            onSuccess(res.data);
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Gagal menambah supplier";
        } finally {
            loading = false;
        }
    }
</script>

<div class="rounded-xl border border-violet-500/25 bg-violet-500/5 p-4 space-y-3">
    <div class="text-xs font-semibold text-violet-300">
        Tambah Supplier Cepat
    </div>

    <Alert variant="destructive" bind:message={errorMessage} dismissible />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
            <label for="quick-supplier-name" class="block text-[11px] text-zinc-400 mb-1">
                Nama Supplier *
            </label>
            <Input
                id="quick-supplier-name"
                bind:value={name}
                placeholder="PT Sumber Makmur"
                class="bg-zinc-900 border-zinc-700 text-xs"
            />
        </div>

        <div>
            <label for="quick-supplier-contact" class="block text-[11px] text-zinc-400 mb-1">
                Contact Person
            </label>
            <Input
                id="quick-supplier-contact"
                bind:value={contactPerson}
                placeholder="Budi Santoso"
                class="bg-zinc-900 border-zinc-700 text-xs"
            />
        </div>

        <div>
            <label for="quick-supplier-phone" class="block text-[11px] text-zinc-400 mb-1">
                Nomor Telepon
            </label>
            <Input
                id="quick-supplier-phone"
                bind:value={phone}
                placeholder="08123456789"
                class="bg-zinc-900 border-zinc-700 text-xs"
            />
        </div>
    </div>

    <div class="flex justify-end gap-2 pt-1">
        <Button
            type="button"
            variant="outline"
            size="sm"
            class="text-xs"
            onclick={onCancel}
        >
            Batal
        </Button>
        <Button
            type="button"
            size="sm"
            class="bg-violet-600 hover:bg-violet-500 text-white text-xs"
            disabled={loading}
            onclick={handleSave}
        >
            {loading ? "Menyimpan..." : "Simpan Supplier"}
        </Button>
    </div>
</div>
