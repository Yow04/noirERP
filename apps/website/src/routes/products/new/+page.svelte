<script lang="ts">
    import ProductForm from "$lib/components/ui/ProductForm.svelte";
</script>

<svelte:head>
    <title>Tambah Produk | noirERP</title>
    <meta name="description" content="Tambah produk baru ke dalam sistem noirERP" />
</svelte:head>

<div class="space-y-6 p-6">
    <div>
        <h1 class="text-2xl font-bold tracking-tight">Tambah Produk</h1>
        <p class="text-sm text-muted-foreground">
            Isi informasi produk baru di bawah ini.
        </p>
    </div>

    <div class="mx-auto max-w-2xl">
        <ProductForm />
    </div>
</div>
