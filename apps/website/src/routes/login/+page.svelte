<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { authState } from "$lib/state/auth.svelte";
    import type { DemoAccount } from "$lib/types/auth";
    import { BrandHeader, DemoAccountSelector } from "$lib/components/auth";
    import { Button } from "$lib/components/ui/button";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Mail01Icon,
        LockPasswordIcon,
        ViewIcon,
        ViewOffSlashIcon,
        ArrowRight01Icon,
        AlertCircleIcon,
        CheckmarkCircle02Icon,
        ShieldCheckIcon,
    } from "@hugeicons/core-free-icons";

    let email = $state("admin@noirerp.dev");
    let password = $state("password123");
    let rememberMe = $state(true);
    let showPassword = $state(false);

    let isSubmitting = $state(false);
    let isSuccess = $state(false);
    let errorMessage = $state("");
    let selectedDemoId = $state("admin");

    function handleDemoSelect(acc: DemoAccount) {
        email = acc.email;
        password = acc.password;
        selectedDemoId = acc.id;
        errorMessage = "";
    }

    async function handleLogin(e?: SubmitEvent) {
        if (e) e.preventDefault();
        if (isSubmitting || isSuccess) return;

        errorMessage = "";
        if (!email.trim()) {
            errorMessage = "Silakan masukkan alamat email resmi Anda.";
            return;
        }
        if (!password) {
            errorMessage = "Silakan masukkan kata sandi akun.";
            return;
        }

        isSubmitting = true;
        const result = await authState.login({ email, password, rememberMe });

        if (result.success) {
            isSuccess = true;
            setTimeout(() => {
                const targetUrl = page.url.searchParams.get("from") || "/";
                goto(targetUrl);
            }, 600);
        } else {
            errorMessage = result.message || "Email atau kata sandi tidak sesuai.";
            isSubmitting = false;
        }
    }
</script>

<svelte:head>
    <title>Masuk | noirERP Enterprise</title>
    <meta
        name="description"
        content="Portal autentikasi aman noirERP — Akses sistem manajemen enterprise terintegrasi."
    />
</svelte:head>

<div class="relative min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 overflow-hidden font-sans">
    <!-- Ambient Lighting & Subtle Grid Background -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-white/[0.04] rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 right-10 w-[500px] h-[350px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        <!-- Brand Header Component -->
        <BrandHeader />

        <!-- Main Minimalist Card -->
        <div class="w-full bg-zinc-900/75 border border-white/10 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            <!-- 1-Click Demo Preset Component -->
            <DemoAccountSelector selectedId={selectedDemoId} onSelect={handleDemoSelect} />

            <!-- Error Banner -->
            {#if errorMessage}
                <div role="alert" class="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs mb-4">
                    <HugeiconsIcon icon={AlertCircleIcon} size={16} class="shrink-0 text-red-400 mt-0.5" />
                    <p class="leading-relaxed">{errorMessage}</p>
                </div>
            {/if}

            <!-- Login Form -->
            <form onsubmit={handleLogin} class="flex flex-col gap-4" novalidate>
                <!-- Email Field -->
                <div class="flex flex-col gap-1.5">
                    <Label for="login-email" class="text-xs font-medium text-zinc-200">Email Resmi</Label>
                    <div class="relative flex items-center">
                        <HugeiconsIcon icon={Mail01Icon} size={18} class="absolute left-3 text-zinc-500 pointer-events-none" />
                        <Input
                            id="login-email"
                            type="email"
                            bind:value={email}
                            placeholder="nama@perusahaan.com"
                            required
                            autocomplete="username"
                            disabled={isSubmitting || isSuccess}
                            class="h-11 pl-9 rounded-xl bg-black/40 border-white/10 text-white placeholder:text-zinc-500 focus-visible:border-white/35 focus-visible:ring-white/10"
                            oninput={() => (errorMessage = "")}
                        />
                    </div>
                </div>

                <!-- Password Field -->
                <div class="flex flex-col gap-1.5">
                    <div class="flex items-center justify-between">
                        <Label for="login-password" class="text-xs font-medium text-zinc-200">Kata Sandi</Label>
                        <button
                            type="button"
                            class="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                            onclick={() => (errorMessage = "Hubungi Administrator sistem (admin@noirerp.dev) untuk pemulihan akun.")}
                        >
                            Lupa sandi?
                        </button>
                    </div>
                    <div class="relative flex items-center">
                        <HugeiconsIcon icon={LockPasswordIcon} size={18} class="absolute left-3 text-zinc-500 pointer-events-none" />
                        <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            bind:value={password}
                            placeholder="••••••••"
                            required
                            autocomplete="current-password"
                            disabled={isSubmitting || isSuccess}
                            class="h-11 pl-9 pr-10 rounded-xl bg-black/40 border-white/10 text-white placeholder:text-zinc-500 focus-visible:border-white/35 focus-visible:ring-white/10"
                            oninput={() => (errorMessage = "")}
                        />
                        <button
                            type="button"
                            class="absolute right-2.5 p-1 text-zinc-500 hover:text-zinc-200 transition-colors"
                            onclick={() => (showPassword = !showPassword)}
                            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        >
                            <HugeiconsIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} size={18} />
                        </button>
                    </div>
                </div>

                <!-- Remember Me & Security Status -->
                <div class="flex items-center justify-between pt-1">
                    <label class="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300">
                        <input type="checkbox" bind:checked={rememberMe} class="size-4 rounded border-white/20 bg-black/40 text-white accent-white cursor-pointer" />
                        <span>Ingat perangkat ini</span>
                    </label>
                    <div class="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                        <HugeiconsIcon icon={ShieldCheckIcon} size={13} class="text-emerald-400" />
                        <span>TLS 1.3 Terproteksi</span>
                    </div>
                </div>

                <!-- Submit Button -->
                <Button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    class="w-full h-11 mt-2 rounded-xl font-semibold text-sm transition-all {isSuccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white text-zinc-950 hover:bg-zinc-200'}"
                >
                    {#if isSuccess}
                        <div class="inline-flex items-center gap-2 text-emerald-400">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                            <span>Otorisasi Berhasil...</span>
                        </div>
                    {:else if isSubmitting}
                        <div class="inline-flex items-center gap-2">
                            <span class="size-4 rounded-full border-2 border-zinc-950/20 border-t-zinc-950 animate-spin"></span>
                            <span>Memverifikasi Kredensial...</span>
                        </div>
                    {:else}
                        <div class="inline-flex items-center gap-2">
                            <span>Masuk ke Konsol</span>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                        </div>
                    {/if}
                </Button>
            </form>

            <!-- Guest Mode Quick Link -->
            <div class="mt-5 pt-4 border-t border-white/5 flex justify-center">
                <button
                    type="button"
                    class="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1 px-2 rounded-md hover:bg-white/[0.04]"
                    onclick={() => goto("/")}
                >
                    <span>Lanjutkan sebagai Tamu (Mode Preview)</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                </button>
            </div>
        </div>

        <!-- Footer -->
        <footer class="mt-6 text-center flex flex-col items-center gap-1 text-[11px] text-zinc-400">
            <p>noirERP Enterprise Architecture &bull; Akses Terenkripsi</p>
            <div class="inline-flex items-center gap-2 text-zinc-400">
                <span class="hover:text-zinc-300 cursor-pointer transition-colors">Privasi</span>
                <span>&bull;</span>
                <span class="hover:text-zinc-300 cursor-pointer transition-colors">Kepatuhan Audit</span>
                <span>&bull;</span>
                <span class="hover:text-zinc-300 cursor-pointer transition-colors">Bantuan IT</span>
            </div>
        </footer>
    </div>
</div>
