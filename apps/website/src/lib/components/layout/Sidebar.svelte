<script lang="ts">
    import { page } from "$app/state";
    import { sidebarState } from "$lib/state/sidebar.svelte";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        DashboardSpeed02Icon,
        PackageIcon,
        Tag01Icon,
        UserGroupIcon,
    } from "@hugeicons/core-free-icons";

    type NavItem = {
        title: string;
        href: string;
        icon: any;
        matchExact?: boolean;
    };

    type NavGroup = {
        label: string;
        items: NavItem[];
    };

    const navigationGroups: NavGroup[] = [
        {
            label: "Menu Utama",
            items: [
                {
                    title: "Dashboard",
                    href: "/",
                    icon: DashboardSpeed02Icon,
                    matchExact: true,
                },
                {
                    title: "Produk",
                    href: "/products",
                    icon: PackageIcon,
                },
                {
                    title: "Kategori",
                    href: "/categories",
                    icon: Tag01Icon,
                },
            ],
        },
        {
            label: "Manajemen",
            items: [
                {
                    title: "Pengguna",
                    href: "/users",
                    icon: UserGroupIcon,
                },
            ],
        },
    ];

    function isActive(item: NavItem): boolean {
        const currentPath = page.url.pathname;
        if (item.matchExact) {
            return currentPath === item.href;
        }
        return currentPath.startsWith(item.href);
    }

    function handleLinkClick() {
        sidebarState.closeMobile();
    }
</script>

<!-- Mobile Overlay Backdrop -->
{#if sidebarState.mobileOpen}
    <div
        class="mobile-backdrop md:hidden"
        role="button"
        tabindex="0"
        aria-label="Tutup Menu"
        onclick={() => sidebarState.closeMobile()}
        onkeydown={(e) => e.key === "Escape" && sidebarState.closeMobile()}
    ></div>
{/if}

<!-- Sidebar Container -->
<aside
    class="sidebar-root"
    class:collapsed={sidebarState.collapsed}
    class:mobile-open={sidebarState.mobileOpen}
>
    <!-- Brand Header: Bersih tanpa tanda X dan tanpa badge PRO -->
    <div class="sidebar-header">
        <a href="/" class="brand-link" onclick={handleLinkClick}>
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
                    <span class="brand-title">
                        noir<span class="brand-accent">ERP</span>
                    </span>
                </div>
            {/if}
        </a>
    </div>

    <!-- Navigation Menu List -->
    <nav class="sidebar-nav">
        {#each navigationGroups as group}
            <div class="nav-group">
                {#if !sidebarState.collapsed}
                    <h3 class="nav-group-label">{group.label}</h3>
                {:else}
                    <div class="nav-group-divider"></div>
                {/if}

                <ul class="nav-items-list">
                    {#each group.items as item}
                        {@const active = isActive(item)}
                        <li class="nav-item">
                            <a
                                href={item.href}
                                class="nav-link group"
                                class:active
                                onclick={handleLinkClick}
                            >
                                <span class="nav-icon-wrapper" class:active-icon={active}>
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        size={18}
                                        strokeWidth={active ? 2.2 : 1.8}
                                    />
                                </span>

                                {#if !sidebarState.collapsed}
                                    <span class="nav-label">{item.title}</span>
                                    {#if active}
                                        <span class="active-dot"></span>
                                    {/if}
                                {:else}
                                    <!-- Tooltip saat sidebar diciutkan -->
                                    <span class="rail-tooltip">{item.title}</span>
                                {/if}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
    </nav>

    <!-- Sidebar Footer: Hanya profil pengguna yang bersih dan minimalis -->
    <div class="sidebar-footer">
        <div class="user-card" class:mini={sidebarState.collapsed}>
            <div class="user-avatar-wrap">
                <span class="avatar-initials">AD</span>
                <span class="online-dot"></span>
            </div>
            {#if !sidebarState.collapsed}
                <div class="user-details">
                    <span class="user-name">Admin noirERP</span>
                    <span class="user-role">Administrator</span>
                </div>
            {:else}
                <span class="rail-tooltip">Admin noirERP</span>
            {/if}
        </div>
    </div>
</aside>

<style>
    /* Mobile Backdrop */
    .mobile-backdrop {
        position: fixed;
        inset: 0;
        z-index: 45;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        transition: opacity 0.25s ease;
    }

    /* Sidebar Container */
    .sidebar-root {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        width: 16rem; /* 256px */
        background: oklch(0.155 0.005 260 / 96%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-right: 1px solid oklch(1 0 0 / 8%);
        transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
    }

    /* Desktop Collapsed Rail */
    @media (min-width: 768px) {
        .sidebar-root.collapsed {
            width: 4.75rem; /* 76px */
        }
    }

    /* Mobile Drawer */
    @media (max-width: 767px) {
        .sidebar-root {
            width: 16.5rem;
            transform: translateX(-100%);
            box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.8);
        }

        .sidebar-root.mobile-open {
            transform: translateX(0);
        }
    }

    /* Header */
    .sidebar-header {
        display: flex;
        align-items: center;
        padding: 0 1.25rem;
        height: 3.75rem; /* 60px */
        border-bottom: 1px solid oklch(1 0 0 / 7%);
    }

    .brand-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        overflow: hidden;
    }

    .logo-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.125rem;
        height: 2.125rem;
        flex-shrink: 0;
        border-radius: 0.5rem;
        transition: transform 0.2s ease;
    }

    .brand-link:hover .logo-box {
        transform: scale(1.05);
    }

    .logo-icon {
        width: 2.125rem;
        height: 2.125rem;
    }

    .brand-info {
        display: flex;
        align-items: center;
        white-space: nowrap;
    }

    .brand-title {
        font-size: 1.125rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: oklch(0.97 0 0);
    }

    .brand-accent {
        color: oklch(0.75 0.18 280);
        font-weight: 800;
    }

    /* Nav */
    .sidebar-nav {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 1rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .sidebar-nav::-webkit-scrollbar {
        width: 4px;
    }
    .sidebar-nav::-webkit-scrollbar-thumb {
        background: oklch(1 0 0 / 10%);
        border-radius: 4px;
    }

    .nav-group-label {
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: oklch(0.48 0 0);
        padding: 0 0.625rem;
        margin-bottom: 0.4rem;
    }

    .nav-group-divider {
        height: 1px;
        background: oklch(1 0 0 / 7%);
        margin: 0.375rem 0.5rem;
    }

    .nav-items-list {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .nav-item {
        position: relative;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5625rem 0.75rem;
        border-radius: 0.5rem;
        color: oklch(0.7 0 0);
        font-size: 0.84375rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.15s ease-in-out;
        position: relative;
    }

    .nav-link:hover {
        color: oklch(0.98 0 0);
        background: oklch(1 0 0 / 5%);
    }

    .nav-link.active {
        color: #ffffff;
        background: linear-gradient(
            90deg,
            oklch(0.35 0.15 270 / 30%) 0%,
            oklch(0.25 0.08 270 / 12%) 100%
        );
        border: 1px solid oklch(0.5 0.15 270 / 30%);
        font-weight: 600;
    }

    .nav-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        color: oklch(0.6 0 0);
        transition: color 0.15s ease, transform 0.15s ease;
    }

    .nav-link:hover .nav-icon-wrapper {
        color: oklch(0.95 0 0);
        transform: scale(1.08);
    }

    .nav-icon-wrapper.active-icon {
        color: oklch(0.8 0.15 270);
    }

    .nav-label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .active-dot {
        width: 5px;
        height: 5px;
        border-radius: 999px;
        background: oklch(0.75 0.18 270);
        box-shadow: 0 0 6px oklch(0.75 0.18 270);
        margin-left: auto;
    }

    /* Rail mode tooltips */
    .rail-tooltip {
        position: absolute;
        left: 100%;
        margin-left: 0.625rem;
        top: 50%;
        transform: translateY(-50%) scale(0.95);
        opacity: 0;
        pointer-events: none;
        background: oklch(0.22 0.02 260);
        color: oklch(0.98 0 0);
        border: 1px solid oklch(1 0 0 / 12%);
        padding: 0.35rem 0.625rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
        transition: opacity 0.15s ease, transform 0.15s ease;
        z-index: 60;
    }

    .nav-link:hover .rail-tooltip,
    .user-card:hover .rail-tooltip {
        opacity: 1;
        transform: translateY(-50%) scale(1);
    }

    /* Collapsed adjustments */
    .sidebar-root.collapsed .nav-link {
        justify-content: center;
        padding: 0.5625rem 0;
    }

    .sidebar-root.collapsed .sidebar-header {
        justify-content: center;
        padding: 0;
    }

    /* Footer */
    .sidebar-footer {
        padding: 0.75rem 0.75rem;
        border-top: 1px solid oklch(1 0 0 / 7%);
        background: oklch(0.145 0 0 / 40%);
    }

    .user-card {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0.5rem 0.625rem;
        border-radius: 0.5rem;
        background: oklch(1 0 0 / 3%);
        border: 1px solid oklch(1 0 0 / 6%);
        position: relative;
    }

    .user-card.mini {
        justify-content: center;
        padding: 0.5rem 0;
    }

    .user-avatar-wrap {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.875rem;
        height: 1.875rem;
        border-radius: 999px;
        background: linear-gradient(135deg, oklch(0.3 0.1 270) 0%, oklch(0.2 0.05 260) 100%);
        border: 1px solid oklch(0.5 0.15 270 / 40%);
        flex-shrink: 0;
    }

    .avatar-initials {
        font-size: 0.625rem;
        font-weight: 700;
        color: oklch(0.9 0.05 270);
    }

    .online-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: #22c55e;
        border: 1px solid oklch(0.155 0 0);
    }

    .user-details {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        white-space: nowrap;
    }

    .user-name {
        font-size: 0.78125rem;
        font-weight: 600;
        color: oklch(0.95 0 0);
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-role {
        font-size: 0.65625rem;
        color: oklch(0.5 0 0);
    }
</style>
