<script lang="ts">
    import { page } from "$app/state";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        DashboardSpeed02Icon,
        PackageIcon,
        PackageMovingIcon,
        Tag01Icon,
        UserGroupIcon,
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
</script>

<!-- Permanent Icon-Only Rail Sidebar -->
<aside class="sidebar-rail">
    <!-- Brand Logo Icon -->
    <div class="rail-header">
        <a href="/" class="logo-link group" aria-label="noirERP Home">
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
            <!-- Floating Tooltip -->
            <span class="rail-tooltip">noirERP</span>
        </a>
    </div>

    <!-- Navigation Menu Icons -->
    <nav class="rail-nav">
        <!-- Main Navigation Items -->
        <ul class="nav-list">
            {#each navItems as item}
                {@const active = isActive(item)}
                <li class="nav-item">
                    <a
                        href={item.href}
                        class="rail-icon-btn group"
                        class:active
                        aria-label={item.title}
                    >
                        <span class="icon-wrap" class:active-icon={active}>
                            <HugeiconsIcon
                                icon={item.icon}
                                size={20}
                                strokeWidth={active ? 2.2 : 1.8}
                            />
                        </span>

                        {#if active}
                            <span class="active-pill-bar"></span>
                        {/if}

                        <!-- Floating Tooltip -->
                        <span class="rail-tooltip">{item.title}</span>
                    </a>
                </li>
            {/each}
        </ul>

        <div class="nav-divider"></div>

        <!-- Management Navigation Items -->
        <ul class="nav-list">
            {#each managementItems as item}
                {@const active = isActive(item)}
                <li class="nav-item">
                    <a
                        href={item.href}
                        class="rail-icon-btn group"
                        class:active
                        aria-label={item.title}
                    >
                        <span class="icon-wrap" class:active-icon={active}>
                            <HugeiconsIcon
                                icon={item.icon}
                                size={20}
                                strokeWidth={active ? 2.2 : 1.8}
                            />
                        </span>

                        {#if active}
                            <span class="active-pill-bar"></span>
                        {/if}

                        <!-- Floating Tooltip -->
                        <span class="rail-tooltip">{item.title}</span>
                    </a>
                </li>
            {/each}
        </ul>
    </nav>

    <!-- Rail Footer: User Profile Avatar -->
    <div class="rail-footer">
        <div class="user-avatar-btn group" tabindex="0" role="button" aria-label="Profil Admin">
            <div class="user-avatar">
                <span class="avatar-text">AD</span>
                <span class="online-dot"></span>
            </div>
            <!-- Floating Tooltip -->
            <span class="rail-tooltip">Admin noirERP</span>
        </div>
    </div>
</aside>

<style>
    /* Fixed Icon-Only Rail Sidebar */
    .sidebar-rail {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 50;
        width: 4.5rem; /* 72px */
        display: flex;
        flex-direction: column;
        align-items: center;
        background: oklch(0.155 0.005 260 / 96%);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-right: 1px solid oklch(1 0 0 / 8%);
        user-select: none;
    }

    /* Header */
    .rail-header {
        height: 3.75rem; /* 60px */
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        border-bottom: 1px solid oklch(1 0 0 / 7%);
    }

    .logo-link {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        text-decoration: none;
    }

    .logo-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.5rem;
        transition: transform 0.2s ease;
    }

    .logo-link:hover .logo-box {
        transform: scale(1.08);
    }

    .logo-icon {
        width: 2.25rem;
        height: 2.25rem;
    }

    /* Navigation */
    .rail-nav {
        flex: 1;
        width: 100%;
        padding: 1rem 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        overflow-y: auto;
    }

    .rail-nav::-webkit-scrollbar {
        width: 0;
    }

    .nav-list {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.375rem;
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
    }

    .nav-item {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    .rail-icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 0.625rem;
        color: oklch(0.65 0 0);
        text-decoration: none;
        position: relative;
        transition: all 0.15s ease-in-out;
    }

    .rail-icon-btn:hover {
        color: oklch(0.98 0 0);
        background: oklch(1 0 0 / 6%);
        transform: scale(1.04);
    }

    .rail-icon-btn.active {
        color: #ffffff;
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
        transition: transform 0.15s ease;
    }

    .icon-wrap.active-icon {
        color: oklch(0.85 0.18 270);
    }

    /* Left pill indicator bar for active item */
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
        width: 1.75rem;
        height: 1px;
        background: oklch(1 0 0 / 8%);
        margin: 0.25rem 0;
    }

    /* Tooltip */
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

    .group:hover .rail-tooltip {
        opacity: 1;
        transform: translateY(-50%) scale(1);
    }

    /* Footer */
    .rail-footer {
        padding: 1rem 0;
        border-top: 1px solid oklch(1 0 0 / 7%);
        width: 100%;
        display: flex;
        justify-content: center;
        background: oklch(0.145 0 0 / 30%);
    }

    .user-avatar-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: default;
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

    .user-avatar-btn:hover .user-avatar {
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
</style>
