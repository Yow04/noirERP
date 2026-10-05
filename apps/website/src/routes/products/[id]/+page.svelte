<script lang="ts">
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import ProductForm from "$lib/components/ui/ProductForm.svelte";

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

    let product: Product | null = $state(null);
    let loading = $state(true);
    let error = $state("");

    async function loadProduct() {
        const id = page.params.id;
        loading = true;
        error = "";

        try {
            const response = await fetch(
                `${PUBLIC_API_BASE_URL}/products/${id}`,
            );
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message ?? "Produk tidak ditemukan");
            }

            product = result.data;
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Gagal memuat data produk";
        } finally {
            loading = false;
        }
    }

    onMount(loadProduct);
</script>

<svelte:head>
    <title>{product ? `Edit: ${product.name}` : "Edit Produk"} | noirERP</title>
    <meta name="description" content="Edit informasi produk" />
</svelte:head>

<div class="space-y-6 p-6">
    <div>
        <h1 class="text-2xl font-bold tracking-tight">Edit Produk</h1>
        <p class="text-sm text-muted-foreground">
            Perbarui informasi produk di bawah ini.
        </p>
    </div>

    {#if loading}
        <p class="text-sm text-muted-foreground">Memuat data produk...</p>
    {:else if error}
        <div
            role="alert"
            class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
            {error}
        </div>
    {:else if product}
        <div class="mx-auto max-w-2xl">
            <ProductForm {product} />
        </div>
    {/if}
</div>
