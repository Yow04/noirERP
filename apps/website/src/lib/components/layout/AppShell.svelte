<script lang="ts">
    import Sidebar from "./Sidebar.svelte";
    import Header from "./Header.svelte";
    import type { Snippet } from "svelte";

    type Props = {
        children: Snippet;
    };

    let { children }: Props = $props();
</script>

<div class="shell-root">
    <!-- Icon-Only Rail Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="shell-main">
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
        margin-left: 4.5rem; /* Aligned with icon-only rail width */
        min-height: 100dvh;
    }

    .shell-content {
        flex: 1;
        width: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
