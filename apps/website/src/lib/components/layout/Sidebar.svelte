<script lang="ts">
    import { page } from "$app/state";
    import { sidebarState } from "$lib/state/sidebar.svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        DashboardSpeed02Icon,
        PackageIcon,
        PackageMovingIcon,
        Tag01Icon,
        UserGroupIcon,
        ShoppingCart01Icon,
        Invoice01Icon,
    } from "@hugeicons/core-free-icons";

    type NavItem = {
        title: string;
        href: string;
        icon: any;
        matchExact?: boolean;
    };

    const navItems: NavItem[] = [
        {
            title: "Dashboard",
            href: "/",
            icon: DashboardSpeed02Icon,
            matchExact: true,
        },
        {
            title: "Penjualan",
            href: "/sales",
            icon: Invoice01Icon,
        },
        {
            title: "Pembelian",
            href: "/purchases",
            icon: ShoppingCart01Icon,
        },
        {
            title: "Produk",
            href: "/products",
            icon: PackageIcon,
        },
        {
            title: "Inventaris",
            href: "/inventory",
            icon: PackageMovingIcon,
        },
        {
            title: "Kategori",
            href: "/categories",
            icon: Tag01Icon,
        },
    ];

    const managementItems: NavItem[] = [
        {
            title: "Pengguna",
            href: "/users",
            icon: UserGroupIcon,
        },
    ];

    function isActive(item: NavItem): boolean {
        const currentPath = page.url.pathname;
        if (item.matchExact) {
            return currentPath === item.href;
        }
        return currentPath.startsWith(item.href);
    }

    let isResizing = $state(false);

    function startResize(e: PointerEvent) {
        e.preventDefault();
        isResizing = true;
        sidebarState.isDragging = true;

        const startX = e.clientX;
        const wasCollapsed = sidebarState.collapsed;
        const startWidth = sidebarState.width;

        function onPointerMove(moveEvent: PointerEvent) {
            const deltaX = moveEvent.clientX - startX;
            if (wasCollapsed) {
                if (deltaX > 40) {
                    sidebarState.setCollapsed(false);
                    sidebarState.setWidth(Math.max(sidebarState.MIN_WIDTH, startWidth + deltaX));
                }
            } else {
                const newWidth = startWidth + deltaX;
                if (newWidth < 130) {
                    sidebarState.setCollapsed(true);
                } else {
                    sidebarState.setWidth(newWidth);
                }
            }
        }

        function stopResize() {
            isResizing = false;
            sidebarState.isDragging = false;
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", stopResize);
            window.removeEventListener("pointercancel", stopResize);
        }

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", stopResize);
        window.addEventListener("pointercancel", stopResize);
    }

    function resetWidth() {
        if (sidebarState.collapsed) {
            sidebarState.setCollapsed(false);
            sidebarState.setWidth(sidebarState.DEFAULT_WIDTH);
        } else {
            sidebarState.setWidth(sidebarState.DEFAULT_WIDTH);
        }
    }
</script>

<!-- Mobile Overlay Backdrop -->
{#if sidebarState.mobileOpen}
    <div
        class="mobile-backdrop"
        onclick={() => sidebarState.closeMobile()}
        onkeydown={(e) => e.key === "Escape" && sidebarState.closeMobile()}
        role="button"
        tabindex="-1"
        aria-label="Tutup Menu Sidebar"
    ></div>
{/if}

<!-- Collapsible / Resizable Sidebar -->
<aside
    class="sidebar-root"
    class:collapsed={sidebarState.collapsed}
    class:mobile-open={sidebarState.mobileOpen}
    class:is-resizing={isResizing}
    aria-label="Navigasi Utama"
>
    <!-- Brand Header -->
    <div class="sidebar-header">
        <a href="/" class="brand-link group" aria-label="noirERP Home">
            <div class="logo-box">
                <svg
                    class="logo-icon"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        width="32"
                        height="32"
                        rx="8"
                        class="fill-violet-600/25 stroke-violet-500/40"
                        stroke-width="1.5"
                    />
                    <path
                        d="M9 23V9L17 19V9H23V23L15 13V23H9Z"
                        class="fill-violet-400"
                    />
                    <circle cx="23" cy="9" r="2" class="fill-indigo-300" />
                </svg>
            </div>

            {#if !sidebarState.collapsed}
                <div class="brand-info">
                    <span class="brand-title">noir<span class="brand-accent">ERP</span></span>
                    <span class="brand-badge">PRO</span>
                </div>
            {:else}
                <!-- Floating Tooltip for collapsed mode -->
                <span class="rail-tooltip">noirERP</span>
            {/if}
        </a>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
        <!-- Main Navigation Section -->
        {#if !sidebarState.collapsed}
            <div class="nav-section-label">Menu Utama</div>
        {/if}

        <ul class="nav-list">
            {#each navItems as item}
                {@const active = isActive(item)}
                <li class="nav-item">
                    <a
                        href={item.href}
                        class="nav-link group"
                        class:active
                        aria-label={item.title}
                        onclick={() => {
                            if (sidebarState.mobileOpen) sidebarState.closeMobile();
                        }}
                    >
                        <span class="icon-wrap" class:active-icon={active}>
                            <HugeiconsIcon
                                icon={item.icon}
                                size={20}
                                strokeWidth={active ? 2.2 : 1.8}
                            />
                        </span>

                        {#if !sidebarState.collapsed}
                            <span class="nav-text">{item.title}</span>
                            {#if active}
                                <span class="active-dot"></span>
                            {/if}
                        {:else}
                            {#if active}
                                <span class="active-pill-bar"></span>
                            {/if}
                            <!-- Floating Tooltip -->
                            <span class="rail-tooltip">{item.title}</span>
                        {/if}
                    </a>
                </li>
            {/each}
        </ul>

        <div class="nav-divider"></div>

        <!-- Management Section -->
        {#if !sidebarState.collapsed}
            <div class="nav-section-label">Manajemen</div>
        {/if}

        <ul class="nav-list">
            {#each managementItems as item}
                {@const active = isActive(item)}
                <li class="nav-item">
                    <a
                        href={item.href}
                        class="nav-link group"
                        class:active
                        aria-label={item.title}
                        onclick={() => {
                            if (sidebarState.mobileOpen) sidebarState.closeMobile();
                        }}
                    >
                        <span class="icon-wrap" class:active-icon={active}>
                            <HugeiconsIcon
                                icon={item.icon}
                                size={20}
                                strokeWidth={active ? 2.2 : 1.8}
                            />
                        </span>

                        {#if !sidebarState.collapsed}
                            <span class="nav-text">{item.title}</span>
                            {#if active}
                                <span class="active-dot"></span>
                            {/if}
                        {:else}
                            {#if active}
                                <span class="active-pill-bar"></span>
                            {/if}
                            <!-- Floating Tooltip -->
                            <span class="rail-tooltip">{item.title}</span>
                        {/if}
                    </a>
                </li>
            {/each}
        </ul>
    </nav>

    <!-- Footer: User Profile -->
    <div class="sidebar-footer">
        <div class="user-card group" tabindex="0" role="button" aria-label="Profil Admin">
            <div class="user-avatar">
                <span class="avatar-text">AD</span>
                <span class="online-dot"></span>
            </div>

            {#if !sidebarState.collapsed}
                <div class="user-details">
                    <span class="user-name">Admin noirERP</span>
                    <span class="user-role">Administrator</span>
                </div>
            {:else}
                <!-- Floating Tooltip -->
                <span class="rail-tooltip">Admin noirERP</span>
            {/if}
        </div>
    </div>

    <!-- Edge Drag/Resize Handle -->
    <div
        class="sidebar-resizer"
        role="separator"
        aria-orientation="vertical"
        aria-label="Tarik untuk geser lebar sidebar"
        title="Tarik untuk geser lebar sidebar (Klik 2x untuk reset)"
        onpointerdown={startResize}
        ondblclick={resetWidth}
    >
        <span class="resizer-visual-line"></span>
    </div>
</aside>

<style>
    /* Mobile Backdrop */
    .mobile-backdrop {
        position: fixed;
        inset: 0;
        z-index: 45;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transition: opacity 0.25s ease;
    }

    /* Collapsible / Resizable Sidebar Container */
    .sidebar-root {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 50;
        width: var(--sidebar-width, 16rem);
        display: flex;
        flex-direction: column;
        background: oklch(0.155 0.005 260 / 96%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-right: 1px solid oklch(1 0 0 / 8%);
        transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        overflow: hidden;
    }

    .sidebar-root.is-resizing {
        transition: none; /* Instant feedback when dragging */
    }

    /* Collapsed Rail on Desktop */
    @media (min-width: 769px) {
        .sidebar-root.collapsed {
            width: 4.5rem !important; /* 72px */
            align-items: center;
        }
    }

    /* Mobile Drawer */
    @media (max-width: 768px) {
        .sidebar-root {
            width: 16.5rem !important;
            transform: translateX(-100%);
            box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.85);
        }

        .sidebar-root.mobile-open {
            transform: translateX(0);
        }
    }

    /* Header */
    .sidebar-header {
        height: 3.75rem; /* 60px */
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0 1.25rem;
        border-bottom: 1px solid oklch(1 0 0 / 7%);
        flex-shrink: 0;
        overflow: hidden;
    }

    .sidebar-root.collapsed .sidebar-header {
        justify-content: center;
        padding: 0;
    }

    .brand-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        position: relative;
        min-width: 0;
    }

    .logo-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        flex-shrink: 0;
        transition: transform 0.2s ease;
    }

    .brand-link:hover .logo-box {
        transform: scale(1.08);
    }

    .logo-icon {
        width: 2.25rem;
        height: 2.25rem;
    }

    .brand-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }

    .brand-title {
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: oklch(0.98 0 0);
    }

    .brand-accent {
        color: oklch(0.75 0.18 280);
        font-weight: 800;
    }

    .brand-badge {
        font-size: 0.625rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        padding: 0.125rem 0.375rem;
        border-radius: 4px;
        background: oklch(0.4 0.18 270 / 25%);
        border: 1px solid oklch(0.6 0.18 270 / 35%);
        color: oklch(0.85 0.15 270);
    }

    /* Navigation */
    .sidebar-nav {
        flex: 1;
        width: 100%;
        padding: 1rem 0.625rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .sidebar-root.collapsed .sidebar-nav {
        padding: 1rem 0;
        align-items: center;
    }

    .sidebar-nav::-webkit-scrollbar {
        width: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
        background: oklch(1 0 0 / 12%);
        border-radius: 3px;
    }

    .nav-section-label {
        font-size: 0.65625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: oklch(0.48 0 0);
        padding: 0.5rem 0.75rem 0.25rem 0.75rem;
        white-space: nowrap;
    }

    .nav-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
    }

    .sidebar-root.collapsed .nav-list {
        align-items: center;
        gap: 0.375rem;
    }

    .nav-item {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .sidebar-root.collapsed .nav-item {
        justify-content: center;
    }

    /* Link in Expanded Mode */
    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.5625rem 0.75rem;
        border-radius: 0.5rem;
        color: oklch(0.68 0 0);
        text-decoration: none;
        font-size: 0.84375rem;
        font-weight: 500;
        position: relative;
        transition: all 0.15s ease-in-out;
        white-space: nowrap;
    }

    /* Link in Collapsed Rail Mode */
    .sidebar-root.collapsed .nav-link {
        justify-content: center;
        width: 2.75rem;
        height: 2.75rem;
        padding: 0;
        border-radius: 0.625rem;
    }

    .nav-link:hover {
        color: oklch(0.98 0 0);
        background: oklch(1 0 0 / 6%);
    }

    .sidebar-root.collapsed .nav-link:hover {
        transform: scale(1.04);
    }

    .nav-link.active {
        color: #ffffff;
        background: linear-gradient(
            90deg,
            oklch(0.38 0.16 270 / 35%) 0%,
            oklch(0.25 0.08 270 / 15%) 100%
        );
        border: 1px solid oklch(0.55 0.18 270 / 30%);
        box-shadow: 0 4px 12px oklch(0.35 0.15 270 / 15%);
        font-weight: 600;
    }

    .sidebar-root.collapsed .nav-link.active {
        background: linear-gradient(
            135deg,
            oklch(0.38 0.16 270 / 40%) 0%,
            oklch(0.28 0.1 270 / 20%) 100%
        );
        border: 1px solid oklch(0.55 0.18 270 / 35%);
        box-shadow: 0 4px 12px oklch(0.35 0.15 270 / 20%);
    }

    .icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.15s ease, color 0.15s ease;
    }

    .icon-wrap.active-icon {
        color: oklch(0.85 0.18 270);
    }

    .nav-link:hover .icon-wrap {
        transform: scale(1.06);
    }

    .nav-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Active Indicators */
    .active-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: oklch(0.78 0.18 270);
        box-shadow: 0 0 8px oklch(0.78 0.18 270);
        margin-left: auto;
        flex-shrink: 0;
    }

    .active-pill-bar {
        position: absolute;
        left: 0.125rem;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 1.25rem;
        border-radius: 0 3px 3px 0;
        background: oklch(0.75 0.18 270);
        box-shadow: 0 0 8px oklch(0.75 0.18 270);
    }

    .nav-divider {
        width: calc(100% - 1.5rem);
        height: 1px;
        background: oklch(1 0 0 / 7%);
        margin: 0.5rem auto;
    }

    .sidebar-root.collapsed .nav-divider {
        width: 1.75rem;
        margin: 0.25rem auto;
    }

    /* Floating Tooltip (Collapsed Mode) */
    .rail-tooltip {
        position: absolute;
        left: 100%;
        margin-left: 0.75rem;
        top: 50%;
        transform: translateY(-50%) scale(0.92);
        opacity: 0;
        pointer-events: none;
        background: oklch(0.22 0.02 260);
        color: oklch(0.98 0 0);
        border: 1px solid oklch(1 0 0 / 12%);
        padding: 0.35rem 0.65rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
        transition: opacity 0.15s ease, transform 0.15s ease;
        z-index: 60;
    }

    .sidebar-root.collapsed .group:hover .rail-tooltip {
        opacity: 1;
        transform: translateY(-50%) scale(1);
    }

    /* Footer: User Profile */
    .sidebar-footer {
        padding: 0.875rem 0.75rem;
        border-top: 1px solid oklch(1 0 0 / 7%);
        width: 100%;
        display: flex;
        background: oklch(0.145 0 0 / 30%);
        flex-shrink: 0;
    }

    .sidebar-root.collapsed .sidebar-footer {
        padding: 1rem 0;
        justify-content: center;
    }

    .user-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.5rem 0.625rem;
        border-radius: 0.5rem;
        background: oklch(1 0 0 / 3%);
        border: 1px solid oklch(1 0 0 / 6%);
        position: relative;
        cursor: default;
        transition: all 0.15s ease;
    }

    .user-card:hover {
        background: oklch(1 0 0 / 6%);
        border-color: oklch(1 0 0 / 10%);
    }

    .sidebar-root.collapsed .user-card {
        justify-content: center;
        width: auto;
        padding: 0;
        background: transparent;
        border: none;
    }

    .user-avatar {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.125rem;
        height: 2.125rem;
        border-radius: 999px;
        background: linear-gradient(135deg, oklch(0.3 0.1 270) 0%, oklch(0.2 0.05 260) 100%);
        border: 1px solid oklch(0.5 0.15 270 / 40%);
        flex-shrink: 0;
        transition: transform 0.15s ease;
    }

    .user-card:hover .user-avatar {
        transform: scale(1.06);
    }

    .avatar-text {
        font-size: 0.6875rem;
        font-weight: 700;
        color: oklch(0.9 0.05 270);
    }

    .online-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 7px;
        height: 7px;
        border-radius: 999px;
        background: #22c55e;
        border: 1.5px solid oklch(0.155 0 0);
    }

    .user-details {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        white-space: nowrap;
    }

    .user-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: oklch(0.95 0 0);
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-role {
        font-size: 0.6875rem;
        color: oklch(0.52 0 0);
    }

    /* Edge Resizer Handle */
    .sidebar-resizer {
        position: absolute;
        top: 0;
        right: -4px;
        bottom: 0;
        width: 8px;
        cursor: col-resize;
        z-index: 60;
        display: flex;
        align-items: center;
        justify-content: center;
        touch-action: none;
    }

    .resizer-visual-line {
        width: 2px;
        height: 100%;
        background: transparent;
        transition: background 0.15s ease, box-shadow 0.15s ease;
    }

    .sidebar-resizer:hover .resizer-visual-line,
    .sidebar-root.is-resizing .resizer-visual-line {
        background: oklch(0.75 0.18 270 / 70%);
        box-shadow: 0 0 8px oklch(0.75 0.18 270 / 60%);
    }

    @media (max-width: 768px) {
        .sidebar-resizer {
            display: none;
        }
    }
</style>
