<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import Header from "./Header.svelte";
    import { sidebarState } from "$lib/state/sidebar.svelte";
    import type { Snippet } from "svelte";

    type Props = {
        children: Snippet;
    };

    let { children }: Props = $props();

    let sidebarWidth = $derived(sidebarState.width);
</script>

<div
    class="shell-root"
    class:sidebar-collapsed={sidebarState.collapsed}
    style="--sidebar-width: {sidebarWidth}px;"
>
    <!-- Collapsible & Resizable Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div
        class="shell-main"
        class:is-dragging={sidebarState.isDragging}
    >
        <!-- Top Navbar -->
        <Header />

        <!-- Page Content -->
        <main class="shell-content">
            {@render children()}
        </main>
    </div>
</div>

<style>
    .shell-root {
        min-height: 100dvh;
        background: oklch(0.145 0 0);
        color: oklch(0.985 0 0);
        display: flex;
        position: relative;
    }

    .shell-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
        margin-left: var(--sidebar-width, 4.5rem);
        min-height: 100dvh;
        transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .shell-main.is-dragging {
        transition: none;
    }

    @media (max-width: 768px) {
        .shell-main {
            margin-left: 0 !important;
        }
    }

    .shell-content {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
    }
</style>

