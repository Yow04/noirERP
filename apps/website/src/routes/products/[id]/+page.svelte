<script lang="ts">
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { fetchWithFallback } from "$lib/api/client";
    import ProductForm from "$lib/components/ui/ProductForm.svelte";
    import { Alert } from "$lib/components/ui/alert";

    import { mockProducts } from "$lib/mockData";

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

        const fallback = (mockProducts.find((p) => p.id === id) || mockProducts[0]) as unknown as Product;
        const res = await fetchWithFallback<Product>(`/products/${id}`, fallback);
        product = res.data;
        if (res.error && !res.isDemo) {
            error = res.error;
        }
        loading = false;
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
        <Alert variant="destructive" bind:message={error} dismissible />
    {:else if product}
        <div class="mx-auto max-w-2xl">
            <ProductForm {product} />
        </div>
    {/if}
</div>
