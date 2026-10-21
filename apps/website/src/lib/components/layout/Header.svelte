<script lang="ts">
    import { page } from "$app/state";
    import { sidebarState } from "$lib/state/sidebar.svelte";
    import { authState } from "$lib/state/auth.svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

    import { onMount } from "svelte";
    import { apiFetch } from "$lib/api/client";

    let isApiConnected = $state(false);

    async function checkApiStatus() {
        try {
            const res = await apiFetch("/health", { skipAuth: true });
            isApiConnected = res.success;
        } catch {
            isApiConnected = false;
        }
    }

    onMount(checkApiStatus);

    let isExpanded = $derived.by(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            return sidebarState.mobileOpen;
        }
        return !sidebarState.collapsed;
    });

    const breadcrumbData = $derived.by(() => {
        const path = page.url.pathname;
        if (path === "/") {
            return {
                title: "Dashboard",
                parent: "Overview",
            };
        }
        if (path.startsWith("/sales")) {
            return {
                title: "Penjualan",
                parent: "Transaksi",
            };
        }
        if (path.startsWith("/purchases")) {
            return {
                title: "Pembelian",
                parent: "Transaksi",
            };
        }
        if (path.startsWith("/products/new")) {
            return {
                title: "Tambah Produk",
                parent: "Produk",
            };
        }
        if (path.startsWith("/products/")) {
            return {
                title: "Edit Produk",
                parent: "Produk",
            };
        }
        if (path.startsWith("/products")) {
            return {
                title: "Produk",
                parent: "Katalog",
            };
        }
        if (path.startsWith("/inventory")) {
            return {
                title: "Inventaris",
                parent: "Logistik",
            };
        }
        if (path.startsWith("/categories")) {
            return {
                title: "Kategori",
                parent: "Katalog",
            };
        }
        if (path.startsWith("/users")) {
            return {
                title: "Pengguna",
                parent: "Manajemen",
            };
        }
        return {
            title: "Halaman",
            parent: "noirERP",
        };
    });
</script>

<header class="header-root">
    <div class="header-left">
        <!-- Single Universal Toggle Button with Directional Icon -->
        <button
            type="button"
            class="sidebar-toggle-btn"
            aria-label={isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
            title={isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
            onclick={() => sidebarState.toggle()}
        >
            <span class="toggle-icon-wrap" class:is-expanded={isExpanded}>
                <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={18}
                    strokeWidth={2.2}
                />
            </span>
            <span class="sr-only">
                {isExpanded ? "Ciutkan Sidebar" : "Perluas Sidebar"}
            </span>
        </button>

        <div class="header-divider"></div>

        <!-- Breadcrumb Lokasi Bersih & Minimalis -->
        <nav class="breadcrumb-container" aria-label="Breadcrumb">
            <div class="breadcrumb-trail">
                <span class="trail-parent">{breadcrumbData.parent}</span>
                <span class="trail-sep">/</span>
                <span class="trail-current">{breadcrumbData.title}</span>
            </div>
        </nav>
    </div>

    <!-- Header Right: Indikator Status & Auth -->
    <div class="header-right">
        {#if isApiConnected}
            <div class="status-indicator-pill is-online" title="Terhubung ke Database & API backend">
                <span class="status-dot"></span>
                <span class="status-text hidden sm:inline">Online</span>
            </div>
        {:else}
            <div class="status-indicator-pill is-demo" title="Live Preview Mode: Data dummy aktif untuk deployment preview">
                <span class="status-dot-demo"></span>
                <span class="status-text hidden sm:inline">Live Preview</span>
            </div>
        {/if}

        {#if authState.isAuthenticated}
            <div class="user-header-chip hidden md:inline-flex" title="{authState.userName} ({authState.userRole})">
                <span class="user-chip-avatar">{authState.avatarInitials}</span>
                <span class="user-chip-name">{authState.userName}</span>
            </div>
        {:else}
            <a href="/login" class="login-header-chip">
                <span>Masuk</span>
            </a>
        {/if}
    </div>
</header>

<style>
    .header-root {
        position: sticky;
        top: 0;
        z-index: 30;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        height: 3.75rem; /* 60px */
        padding: 0 1.25rem;
        background: oklch(0.145 0 0 / 85%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-bottom: 1px solid oklch(1 0 0 / 8%);
    }

    @media (max-width: 768px) {
        .header-root {
            padding: 0 0.875rem;
            height: 3.5rem;
        }
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        min-width: 0;
    }

    /* Single Universal Sidebar Toggle Button */
    .sidebar-toggle-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.125rem; /* 34px */
        height: 2.125rem;
        border-radius: 0.5rem;
        background: oklch(1 0 0 / 4%);
        border: 1px solid oklch(1 0 0 / 9%);
        color: oklch(0.78 0 0);
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 0;
    }

    .sidebar-toggle-btn:hover {
        background: oklch(1 0 0 / 8%);
        border-color: oklch(1 0 0 / 18%);
        color: #ffffff;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    .sidebar-toggle-btn:active {
        transform: scale(0.94);
    }

    .sidebar-toggle-btn:focus-visible {
        outline: 2px solid oklch(0.75 0.18 270);
        outline-offset: 2px;
    }

    .toggle-icon-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* When expanded ("sudah meluas"), icon rotates 180deg facing opposite direction (left) */
    .toggle-icon-wrap.is-expanded {
        transform: rotate(180deg);
    }

    .header-divider {
        width: 1px;
        height: 1.125rem;
        background: oklch(1 0 0 / 8%);
        flex-shrink: 0;
    }

    /* Breadcrumbs */
    .breadcrumb-container {
        display: flex;
        align-items: center;
        min-width: 0;
        overflow: hidden;
    }

    .breadcrumb-trail {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.84375rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .trail-parent {
        color: oklch(0.55 0 0);
        font-weight: 500;
    }

    .trail-sep {
        color: oklch(0.35 0 0);
        font-size: 0.75rem;
    }

    .trail-current {
        color: oklch(0.95 0 0);
        font-weight: 600;
        letter-spacing: -0.01em;
    }

    /* Header Right */
    .header-right {
        display: flex;
        align-items: center;
        flex-shrink: 0;
    }

    .status-indicator-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
        font-size: 0.71875rem;
        font-weight: 500;
        user-select: none;
        transition: all 0.2s ease;
    }

    .status-indicator-pill.is-online {
        background: oklch(0.2 0.04 145 / 25%);
        border: 1px solid oklch(0.4 0.08 145 / 30%);
        color: oklch(0.85 0.1 145);
    }

    .status-indicator-pill.is-demo {
        background: oklch(0.25 0.08 275 / 30%);
        border: 1px solid oklch(0.5 0.15 275 / 40%);
        color: oklch(0.88 0.12 275);
    }

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
    }

    .status-dot-demo {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #a855f7;
        box-shadow: 0 0 6px rgba(168, 85, 247, 0.6);
    }

    .user-header-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.25rem 0.5rem 0.25rem 0.35rem;
        border-radius: 999px;
        background: oklch(1 0 0 / 4%);
        border: 1px solid oklch(1 0 0 / 8%);
        margin-left: 0.5rem;
    }

    .user-chip-avatar {
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 999px;
        background: oklch(0.3 0.1 270);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.5625rem;
        font-weight: 700;
        color: #fff;
    }

    .user-chip-name {
        font-size: 0.75rem;
        font-weight: 500;
        color: oklch(0.85 0 0);
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .login-header-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.65rem;
        border-radius: 999px;
        background: oklch(0.95 0 0);
        color: oklch(0.12 0 0);
        font-size: 0.75rem;
        font-weight: 600;
        text-decoration: none;
        margin-left: 0.5rem;
        transition: opacity 0.15s ease;
    }

    .login-header-chip:hover {
        opacity: 0.9;
    }
</style>

