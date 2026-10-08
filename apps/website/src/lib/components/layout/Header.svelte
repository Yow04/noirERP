<script lang="ts">
    import { page } from "$app/state";
    import { sidebarState } from "$lib/state/sidebar.svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import { Menu01Icon } from "@hugeicons/core-free-icons";

    const breadcrumbData = $derived.by(() => {
        const path = page.url.pathname;
        if (path === "/") {
            return {
                title: "Dashboard",
                parent: "Overview",
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
        <!-- Universal Toggle Button "Garis 3" -->
        <button
            type="button"
            class="hamburger-btn"
            aria-label="Toggle Sidebar Navigasi"
            title={sidebarState.collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            onclick={() => sidebarState.toggle()}
        >
            <HugeiconsIcon
                icon={Menu01Icon}
                size={19}
                strokeWidth={2}
            />
            <span class="sr-only">Toggle Sidebar</span>
        </button>

        <div class="header-divider"></div>

        <!-- Breadcrumb Ringkas & Bersih -->
        <nav class="breadcrumb-container" aria-label="Breadcrumb">
            <div class="breadcrumb-trail">
                <span class="trail-parent">{breadcrumbData.parent}</span>
                <span class="trail-sep">/</span>
                <span class="trail-current">{breadcrumbData.title}</span>
            </div>
        </nav>
    </div>

    <!-- Header Right: Minimalis & Esensial -->
    <div class="header-right">
        <div class="status-indicator-pill" title="Koneksi Sistem Aktif">
            <span class="status-dot"></span>
            <span class="status-text hidden sm:inline">Online</span>
        </div>
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
            padding: 0 1rem;
            height: 3.5rem;
        }
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        min-width: 0;
    }

    /* "Garis 3" Toggle Button */
    .hamburger-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.125rem;
        height: 2.125rem;
        border-radius: 0.5rem;
        background: oklch(1 0 0 / 4%);
        border: 1px solid oklch(1 0 0 / 8%);
        color: oklch(0.85 0 0);
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s ease;
    }

    .hamburger-btn:hover {
        background: oklch(1 0 0 / 8%);
        border-color: oklch(1 0 0 / 14%);
        color: #ffffff;
    }

    .hamburger-btn:active {
        transform: scale(0.96);
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
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        background: oklch(0.2 0.04 145 / 25%);
        border: 1px solid oklch(0.4 0.08 145 / 30%);
        font-size: 0.71875rem;
        font-weight: 500;
        color: oklch(0.85 0.1 145);
        user-select: none;
    }

    .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
    }
</style>
