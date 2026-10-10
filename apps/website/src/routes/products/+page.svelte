<script lang="ts">
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { StockStatusBadge } from "$lib/components/inventory";

    type Product = {
        id: string;
        sku: string;
        name: string;
        description: string | null;
        purchasePrice: string | number;
        sellingPrice: string | number;
        stock: number;
        minStock?: number;
        category: string | number;
        createdAt: string;
    };

    let products: Product[] = $state([]);
    let loading = $state(true);
    let error: string = $state("");
    let deletingId: string | null = $state(null);

    async function loadProducts() {
        loading = true;
        error = "";
        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/products`);
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to load products");
            }

            products = result.data;
        } catch (err) {
            error =
                err instanceof Error ? err.message : "Failed to load products";
        } finally {
            loading = false;
        }
    }

    async function deleteProduct(id: string) {
        const confirmed = confirm(
            "Are you sure to delete this specific product?",
        );
        if (!confirmed) return;

        deletingId = id;
        error = "";

        try {
            const response = await fetch(
                `${PUBLIC_API_BASE_URL}/products/${id}`,
                {
                    method: "DELETE",
                },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ?? "Failed to delete this product",
                );
            }

            products = products.filter((products) => products.id !== id);
        } catch (err) {
            error =
                err instanceof Error
                    ? err.message
                    : "There's an error while deleting this product";
        } finally {
            deletingId = null;
        }
    }

    function formatCurrency(value: string | number) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 2,
        }).format(Number(value));
    }

    onMount(loadProducts);
</script>

<svelte:head>
    <title>Products | noirERP</title>
    <meta name="description" content="Manage your products, stock, prices" />
</svelte:head>

<div class="space-y-6 p-6">
    <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Products</h1>
            <p class="text-sm text-muted-foreground">
                Manage product and information and stock.
            </p>
        </div>

        <div class="flex items-center gap-2">
            <Button variant="outline" href="/inventory">Kelola Inventaris</Button>
            <Button href="/products/new">Add Products</Button>
        </div>
    </div>

    {#if error}
        <div
            role="alert"
            class="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
            {error}
        </div>
    {/if}

    <div class="overflow-x-auto rounded-lg border">
        {#if loading}
            <p class="p-6 text-sm text-muted-foreground">
                Loading Products Data...
            </p>
        {:else if products.length === 0}
            <div class="p-8 text-center">
                <p class="font-medium">No product data</p>
                <p class="mt-1 text-sm text-muted-foreground">
                    Add the first product to start using noirERP.
                </p>
            </div>
        {:else}
            <table class="w-full text-left text-sm">
                <thead class="bg-muted/50">
                    <tr>
                        <th class="px-4 py-3 font-medium">SKU</th>
                        <th class="px-4 py-3 font-medium">Products Name</th>
                        <th class="px-4 py-3 font-medium">Buy Prices</th>
                        <th class="px-4 py-3 font-medium">Sell Price</th>
                        <th class="px-4 py-3 font-medium">Stock</th>
                        <th class="px-4 py-3 text-right font-medium">Actions</th
                        >
                    </tr>
                </thead>

                <tbody class="divide-y">
                    {#each products as product (product.id)}
                        <tr>
                            <td
                                class="whitespace-nowrap px-4 py-3 font-mono text-xs"
                            >
                                {product.sku}
                            </td>
                            <td class="min-w-40 px-4 py-3 font-medium">
                                {product.name}
                                {#if product.description}
                                    <p
                                        class="mt-1 max-w-xs truncate text-xs text-muted-foreground"
                                    >
                                        {product.description}
                                    </p>
                                {/if}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3">
                                {formatCurrency(product.purchasePrice)}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3">
                                {formatCurrency(product.sellingPrice)}
                            </td>
                            <td class="whitespace-nowrap px-4 py-3">
                                <div class="flex items-center gap-2">
                                    <span class="font-mono">{product.stock}</span>
                                    <StockStatusBadge
                                        status={product.stock === 0 ? "OUT_OF_STOCK" : product.stock <= (product.minStock ?? 5) ? "LOW_STOCK" : "NORMAL"}
                                        size="sm"
                                    />
                                </div>
                            </td>
                            <td class="whitespace-nowrap px-4 py-3">
                                <div class="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        href={`/products/${product.id}`}
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        disabled={deletingId === product.id}
                                        onclick={() =>
                                            deleteProduct(product.id)}
                                    >
                                        {deletingId === product.id
                                            ? "Deleting..."
                                            : "Delete"}
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>

    <p class="text-xs text-muted-foreground">
        Total Product: {products.length}
    </p>
</div>
