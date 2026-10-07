<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PackageIcon,
        ArrowRight02Icon,
        DashboardSpeed02Icon,
    } from "@hugeicons/core-free-icons";

    type Props = {
        greeting?: string;
    };

    let { greeting }: Props = $props();

    function defaultGreeting(): string {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 17) return "Selamat Siang";
        if (hour < 19) return "Selamat Sore";
        return "Selamat Malam";
    }

    const currentGreeting = $derived(greeting ?? defaultGreeting());
</script>

<header class="dashboard-header">
    <div class="header-glow"></div>
    <div class="header-content">
        <div class="header-text">
            <div class="header-badge">
                <HugeiconsIcon
                    icon={DashboardSpeed02Icon}
                    size={14}
                    strokeWidth={2}
                />
                <span>Dashboard</span>
            </div>
            <h1>{currentGreeting} 👋</h1>
            <p>Pantau ringkasan bisnis dan kelola inventori Anda dari sini.</p>
        </div>
        <div class="header-actions">
            <Button href="/products/new">
                <HugeiconsIcon
                    icon={PackageIcon}
                    size={16}
                    strokeWidth={2}
                />
                Tambah Produk
            </Button>
            <Button variant="outline" href="/products">
                Lihat Semua Produk
                <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={16}
                    strokeWidth={2}
                />
            </Button>
        </div>
    </div>
</header>

<style>
    .dashboard-header {
        position: relative;
        border-radius: 1rem;
        padding: 2rem 2.5rem;
        background: linear-gradient(
            135deg,
            oklch(0.22 0.02 280) 0%,
            oklch(0.18 0.01 260) 50%,
            oklch(0.15 0 0) 100%
        );
        overflow: hidden;
        border: 1px solid oklch(1 0 0 / 6%);
    }

    .header-glow {
        position: absolute;
        top: -50%;
        right: -20%;
        width: 400px;
        height: 400px;
        background: radial-gradient(
            circle,
            oklch(0.55 0.15 280 / 15%) 0%,
            transparent 70%
        );
        pointer-events: none;
    }

    .header-content {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        background: oklch(1 0 0 / 8%);
        border: 1px solid oklch(1 0 0 / 10%);
        font-size: 0.75rem;
        font-weight: 500;
        color: oklch(0.8 0.08 280);
        margin-bottom: 0.75rem;
        backdrop-filter: blur(8px);
    }

    .header-text h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: oklch(0.97 0 0);
        letter-spacing: -0.025em;
        line-height: 1.2;
    }

    .header-text p {
        margin-top: 0.5rem;
        color: oklch(0.7 0 0);
        font-size: 0.9rem;
        max-width: 400px;
    }

    .header-actions {
        display: flex;
        gap: 0.625rem;
        flex-shrink: 0;
        align-items: center;
    }

    @media (max-width: 768px) {
        .dashboard-header {
            padding: 1.5rem;
        }

        .header-content {
            flex-direction: column;
        }

        .header-text h1 {
            font-size: 1.375rem;
        }

        .header-actions {
            width: 100%;
        }
    }
</style>
