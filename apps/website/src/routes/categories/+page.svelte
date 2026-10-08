<script lang="ts">
    import { onMount } from "svelte";
    import { PUBLIC_API_BASE_URL } from "$env/static/public";
    import { Button } from "$lib/components/ui/button";
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Tag01Icon, PlusSignIcon, PackageIcon } from "@hugeicons/core-free-icons";

    type Category = {
        id: string;
        name: string;
        description: string;
        createdAt?: string;
    };

    let categories: Category[] = $state([]);
    let loading = $state(true);
    let error = $state("");

    async function loadCategories() {
        loading = true;
        error = "";
        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/categories`);
            const result = await response.json();
            if (response.ok && result.success) {
                categories = result.data ?? [];
            }
        } catch (err) {
            // API endpoint might not be ready yet
        } finally {
            loading = false;
        }
    }

    onMount(loadCategories);
</script>

<svelte:head>
    <title>Kategori | noirERP</title>
    <meta name="description" content="Kelola kategori produk dan inventori noirERP" />
</svelte:head>

<div class="space-y-6 p-6 max-w-7xl">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <HugeiconsIcon icon={Tag01Icon} size={18} strokeWidth={2} />
                </div>
                <h1 class="text-2xl font-bold tracking-tight">Kategori</h1>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">
                Klasifikasikan produk dan inventori untuk pelaporan yang lebih tertata.
            </p>
        </div>

        <Button class="gap-1.5" disabled>
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.5} />
            Tambah Kategori
        </Button>
    </div>

    {#if loading}
        <div class="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-muted-foreground">
            Memuat daftar kategori...
        </div>
    {:else if categories.length > 0}
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each categories as cat (cat.id)}
                <Card class="border-white/10 bg-white/[0.02] hover:border-white/20 transition-all">
                    <CardHeader>
                        <CardTitle class="flex items-center gap-2 text-base">
                            <HugeiconsIcon icon={Tag01Icon} size={16} class="text-violet-400" />
                            {cat.name}
                        </CardTitle>
                        <CardDescription>{cat.description}</CardDescription>
                    </CardHeader>
                </Card>
            {/each}
        </div>
    {:else}
        <div class="rounded-xl border border-white/5 bg-white/[0.02] p-12 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <HugeiconsIcon icon={Tag01Icon} size={24} strokeWidth={1.5} />
            </div>
            <h3 class="mt-4 text-base font-semibold">Belum Ada Kategori</h3>
            <p class="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                Data kategori akan segera terhubung dengan API manajemen kategori noirERP.
            </p>
            <div class="mt-6">
                <Button variant="outline" href="/products">
                    <HugeiconsIcon icon={PackageIcon} size={15} />
                    Lihat Daftar Produk
                </Button>
            </div>
        </div>
    {/if}
</div>
