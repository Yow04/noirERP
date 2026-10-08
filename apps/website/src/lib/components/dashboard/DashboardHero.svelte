<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        PlusSignIcon,
        ArrowRight02Icon,
        PackageIcon,
        ChartLineData02Icon,
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

<section class="hero-banner">
    <div class="banner-ambient-glow"></div>
    <div class="banner-grid-pattern"></div>

    <div class="banner-content">
        <div class="banner-text">
            <div class="system-status-pill">
                <span class="status-pulse-dot"></span>
                <span>Inventori & Finansial Terpantau</span>
            </div>
            <h1 class="banner-title">
                {currentGreeting}, <span class="gradient-name">Administrator</span> 👋
            </h1>
            <p class="banner-desc">
                Pantau pergerakan stok, estimasi valuasi aset, dan kelola katalog produk Anda dalam satu tampilan terpadu.
            </p>
        </div>

        <div class="banner-actions">
            <Button href="/products/new" class="hero-primary-btn">
                <HugeiconsIcon
                    icon={PlusSignIcon}
                    size={16}
                    strokeWidth={2.5}
                />
                Tambah Produk
            </Button>
            <Button variant="outline" href="/products" class="hero-outline-btn">
                <HugeiconsIcon
                    icon={PackageIcon}
                    size={15}
                    strokeWidth={2}
                />
                Katalog Produk
                <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={14}
                    strokeWidth={2}
                />
            </Button>
        </div>
    </div>
</section>

<style>
    .hero-banner {
        position: relative;
        border-radius: 1rem;
        padding: 1.75rem 2rem;
        background: linear-gradient(
            135deg,
            oklch(0.2 0.03 270) 0%,
            oklch(0.16 0.015 260) 60%,
            oklch(0.145 0 0) 100%
        );
        border: 1px solid oklch(1 0 0 / 8%);
        overflow: hidden;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);
    }

    .banner-ambient-glow {
        position: absolute;
        top: -40%;
        right: -10%;
        width: 360px;
        height: 360px;
        background: radial-gradient(
            circle,
            oklch(0.5 0.2 270 / 18%) 0%,
            oklch(0.4 0.15 280 / 5%) 50%,
            transparent 75%
        );
        pointer-events: none;
    }

    .banner-grid-pattern {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
            oklch(1 0 0 / 5%) 1px,
            transparent 1px
        );
        background-size: 24px 24px;
        opacity: 0.6;
        pointer-events: none;
    }

    .banner-content {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
    }

    .banner-text {
        max-width: 600px;
    }

    .system-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.2rem 0.65rem;
        border-radius: 999px;
        background: oklch(1 0 0 / 6%);
        border: 1px solid oklch(1 0 0 / 10%);
        font-size: 0.71875rem;
        font-weight: 500;
        color: oklch(0.8 0.08 270);
        margin-bottom: 0.625rem;
        backdrop-filter: blur(8px);
    }

    .status-pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: oklch(0.75 0.18 270);
        box-shadow: 0 0 6px oklch(0.75 0.18 270);
    }

    .banner-title {
        font-size: 1.625rem;
        font-weight: 700;
        color: oklch(0.98 0 0);
        letter-spacing: -0.025em;
        line-height: 1.25;
    }

    .gradient-name {
        background: linear-gradient(135deg, oklch(0.95 0.05 270) 0%, oklch(0.8 0.15 280) 100%);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .banner-desc {
        margin-top: 0.5rem;
        color: oklch(0.7 0 0);
        font-size: 0.875rem;
        line-height: 1.5;
    }

    .banner-actions {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        flex-shrink: 0;
    }

    :global(.hero-primary-btn) {
        background: linear-gradient(135deg, oklch(0.45 0.2 270) 0%, oklch(0.38 0.18 260) 100%) !important;
        border: 1px solid oklch(0.55 0.2 270 / 40%) !important;
        color: #ffffff !important;
        box-shadow: 0 4px 14px oklch(0.35 0.15 270 / 30%) !important;
    }

    :global(.hero-primary-btn:hover) {
        background: linear-gradient(135deg, oklch(0.5 0.22 270) 0%, oklch(0.42 0.2 260) 100%) !important;
        transform: translateY(-1px);
    }

    :global(.hero-outline-btn) {
        background: oklch(1 0 0 / 4%) !important;
        border: 1px solid oklch(1 0 0 / 12%) !important;
        color: oklch(0.9 0 0) !important;
    }

    :global(.hero-outline-btn:hover) {
        background: oklch(1 0 0 / 8%) !important;
        color: #ffffff !important;
    }

    @media (max-width: 768px) {
        .hero-banner {
            padding: 1.25rem 1.25rem;
        }

        .banner-title {
            font-size: 1.35rem;
        }

        .banner-content {
            flex-direction: column;
            align-items: flex-start;
        }

        .banner-actions {
            width: 100%;
            flex-direction: column;
        }

        :global(.hero-primary-btn),
        :global(.hero-outline-btn) {
            width: 100%;
            justify-content: center;
        }
    }
</style>
