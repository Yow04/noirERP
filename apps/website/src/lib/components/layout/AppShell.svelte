<script lang="ts">
    import { sidebarState } from "$lib/state/sidebar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import Header from "./Header.svelte";
    import type { Snippet } from "svelte";

    type Props = {
        children: Snippet;
    };

    let { children }: Props = $props();
</script>

<div class="shell-root">
    <!-- Persistent & Responsive Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div
        class="shell-main"
        class:sidebar-collapsed={sidebarState.collapsed}
    >
        <!-- Top Navbar -->
        <Header />

        <!-- Page View Body -->
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
        margin-left: 16rem; /* Matches default sidebar width */
        transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        min-height: 100dvh;
    }

    @media (min-width: 768px) {
        .shell-main.sidebar-collapsed {
            margin-left: 4.75rem; /* Matches collapsed mini rail width */
        }
    }

    @media (max-width: 767px) {
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
