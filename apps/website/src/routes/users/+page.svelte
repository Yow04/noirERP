<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "$lib/components/ui/card";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { UserGroupIcon, PlusSignIcon, UserIcon } from "@hugeicons/core-free-icons";

    // Demo / default current users
    const sampleUsers = [
        {
            id: "1",
            name: "Admin noirERP",
            email: "admin@noirerp.dev",
            role: "Admin",
            status: "Aktif",
        },
        {
            id: "2",
            name: "Staff Gudang",
            email: "inventory@noirerp.dev",
            role: "Staff",
            status: "Aktif",
        },
    ];
</script>

<svelte:head>
    <title>Pengguna | noirERP</title>
    <meta name="description" content="Kelola pengguna dan hak akses noirERP" />
</svelte:head>

<div class="space-y-6 p-6 max-w-7xl">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <HugeiconsIcon icon={UserGroupIcon} size={18} strokeWidth={2} />
                </div>
                <h1 class="text-2xl font-bold tracking-tight">Pengguna</h1>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">
                Kelola akun tim dan hak akses untuk sistem operasional noirERP.
            </p>
        </div>

        <Button class="gap-1.5" disabled>
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.5} />
            Tambah Pengguna
        </Button>
    </div>

    <!-- Users List Table / Card -->
    <div class="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
        <table class="w-full text-left text-sm">
            <thead class="bg-white/[0.03] border-b border-white/5">
                <tr>
                    <th class="px-5 py-3 font-medium">Pengguna</th>
                    <th class="px-5 py-3 font-medium">Email</th>
                    <th class="px-5 py-3 font-medium">Peran</th>
                    <th class="px-5 py-3 font-medium">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
                {#each sampleUsers as user (user.id)}
                    <tr class="hover:bg-white/[0.02] transition-colors">
                        <td class="px-5 py-4 font-medium flex items-center gap-3">
                            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600/20 text-violet-300 font-semibold text-xs border border-violet-500/30">
                                {user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{user.name}</span>
                        </td>
                        <td class="px-5 py-4 text-muted-foreground font-mono text-xs">{user.email}</td>
                        <td class="px-5 py-4">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {user.role === 'Admin' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/10 text-white/80'}">
                                {user.role}
                            </span>
                        </td>
                        <td class="px-5 py-4">
                            <span class="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                {user.status}
                            </span>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
