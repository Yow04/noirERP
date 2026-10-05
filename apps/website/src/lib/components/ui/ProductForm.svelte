<script lang="ts">
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";

    type Product = {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        categoryId: string | null;
        purchasePrice: string | number;
        sellingPrice: string | number;
        stock: number;
    };

    type Category = {
        id: string;
        name: string;
    };

    type Props = {
        product?: Product;
    };

    let { product }: Props = $props();

    const isEdit = $derived(!!product);

    // Form fields
    let sku = $state(product?.sku ?? "");
    let name = $state(product?.name ?? "");
    let description = $state(product?.description ?? "");
    let categoryId = $state(product?.categoryId ?? "");
    let purchasePrice = $state(product?.purchasePrice?.toString() ?? "0");
    let sellingPrice = $state(product?.sellingPrice?.toString() ?? "0");
    let stock = $state(product?.stock?.toString() ?? "0");

    // UI state
    let submitting = $state(false);
    let error = $state("");
    let fieldErrors: Record<string, string> = $state({});
    let categories: Category[] = $state([]);
    let loadingCategories = $state(true);

    async function loadCategories() {
        try {
            const response = await fetch(
                `${PUBLIC_API_BASE_URL}/categories`,
            );
            const result = await response.json();

            if (response.ok && result.success) {
                categories = result.data ?? [];
            }
        } catch {
            // Categories are optional — silently fail
        } finally {
            loadingCategories = false;
        }
    }

    function validate(): boolean {
        const errors: Record<string, string> = {};

        if (!sku.trim()) errors.sku = "SKU wajib diisi";
        else if (sku.trim().length > 50) errors.sku = "SKU maksimal 50 karakter";

        if (!name.trim()) errors.name = "Nama produk wajib diisi";
        else if (name.trim().length > 150)
            errors.name = "Nama produk maksimal 150 karakter";

        if (description && description.length > 5000)
            errors.description = "Deskripsi maksimal 5000 karakter";

        const purchase = Number(purchasePrice);
        if (isNaN(purchase) || purchase < 0)
            errors.purchasePrice = "Harga beli harus angka positif";

        const selling = Number(sellingPrice);
        if (isNaN(selling) || selling < 0)
            errors.sellingPrice = "Harga jual harus angka positif";

        const stockNum = Number(stock);
        if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum))
            errors.stock = "Stok harus bilangan bulat positif";

        fieldErrors = errors;
        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        if (!validate()) return;

        submitting = true;
        error = "";

        const payload = {
            sku: sku.trim(),
            name: name.trim(),
            description: description.trim() || null,
            categoryId: categoryId || null,
            purchasePrice: Number(purchasePrice),
            sellingPrice: Number(sellingPrice),
            stock: Number(stock),
        };

        try {
            const url = isEdit
                ? `${PUBLIC_API_BASE_URL}/products/${product!.id}`
                : `${PUBLIC_API_BASE_URL}/products`;

            const response = await fetch(url, {
                method: isEdit ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ?? "Gagal menyimpan produk",
                );
            }

            await goto("/products");
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan saat menyimpan produk";
        } finally {
            submitting = false;
        }
    }

    import { onMount } from "svelte";
    onMount(loadCategories);
</script>

<form onsubmit={handleSubmit} class="space-y-6">
    <!-- Error Banner -->
    {#if error}
        <div
            role="alert"
            class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
            {error}
        </div>
    {/if}

    <div class="grid gap-6 sm:grid-cols-2">
        <!-- SKU -->
        <div class="space-y-2">
            <Label for="sku">SKU <span class="text-destructive">*</span></Label>
            <Input
                id="sku"
                bind:value={sku}
                placeholder="Contoh: PRD-001"
                aria-invalid={!!fieldErrors.sku}
            />
            {#if fieldErrors.sku}
                <p class="text-xs text-destructive">{fieldErrors.sku}</p>
            {/if}
        </div>

        <!-- Nama Produk -->
        <div class="space-y-2">
            <Label for="name">Nama Produk <span class="text-destructive">*</span></Label>
            <Input
                id="name"
                bind:value={name}
                placeholder="Nama produk"
                aria-invalid={!!fieldErrors.name}
            />
            {#if fieldErrors.name}
                <p class="text-xs text-destructive">{fieldErrors.name}</p>
            {/if}
        </div>

        <!-- Kategori -->
        <div class="space-y-2">
            <Label for="categoryId">Kategori</Label>
            <select
                id="categoryId"
                bind:value={categoryId}
                class="bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full min-w-0 rounded-4xl border px-3 py-1 text-base outline-none transition-colors focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
                <option value="">— Tanpa Kategori —</option>
                {#if loadingCategories}
                    <option disabled>Memuat kategori...</option>
                {:else}
                    {#each categories as cat (cat.id)}
                        <option value={cat.id}>{cat.name}</option>
                    {/each}
                {/if}
            </select>
        </div>

        <!-- Stok -->
        <div class="space-y-2">
            <Label for="stock">Stok <span class="text-destructive">*</span></Label>
            <Input
                id="stock"
                type="number"
                bind:value={stock}
                placeholder="0"
                min="0"
                step="1"
                aria-invalid={!!fieldErrors.stock}
            />
            {#if fieldErrors.stock}
                <p class="text-xs text-destructive">{fieldErrors.stock}</p>
            {/if}
        </div>

        <!-- Harga Beli -->
        <div class="space-y-2">
            <Label for="purchasePrice">Harga Beli <span class="text-destructive">*</span></Label>
            <Input
                id="purchasePrice"
                type="number"
                bind:value={purchasePrice}
                placeholder="0"
                min="0"
                step="0.01"
                aria-invalid={!!fieldErrors.purchasePrice}
            />
            {#if fieldErrors.purchasePrice}
                <p class="text-xs text-destructive">{fieldErrors.purchasePrice}</p>
            {/if}
        </div>

        <!-- Harga Jual -->
        <div class="space-y-2">
            <Label for="sellingPrice">Harga Jual <span class="text-destructive">*</span></Label>
            <Input
                id="sellingPrice"
                type="number"
                bind:value={sellingPrice}
                placeholder="0"
                min="0"
                step="0.01"
                aria-invalid={!!fieldErrors.sellingPrice}
            />
            {#if fieldErrors.sellingPrice}
                <p class="text-xs text-destructive">{fieldErrors.sellingPrice}</p>
            {/if}
        </div>
    </div>

    <!-- Deskripsi (full width) -->
    <div class="space-y-2">
        <Label for="description">Deskripsi</Label>
        <textarea
            id="description"
            bind:value={description}
            placeholder="Deskripsi produk (opsional)"
            rows="4"
            aria-invalid={!!fieldErrors.description}
            class="bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive w-full min-w-0 rounded-xl border px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-[3px] aria-invalid:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        ></textarea>
        {#if fieldErrors.description}
            <p class="text-xs text-destructive">{fieldErrors.description}</p>
        {/if}
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
            {#if submitting}
                Menyimpan...
            {:else}
                {isEdit ? "Perbarui Produk" : "Tambah Produk"}
            {/if}
        </Button>

        <Button variant="outline" href="/products">
            Batal
        </Button>
    </div>
</form>
