<script lang="ts">
    type Props = {
        count?: number;
    };

    let { count = 4 }: Props = $props();
</script>

<div class="loading-state">
    <div class="loading-grid">
        {#each Array(count) as _}
            <div class="skeleton-card">
                <div class="skeleton-line skeleton-sm"></div>
                <div class="skeleton-line skeleton-lg"></div>
                <div class="skeleton-line skeleton-md"></div>
            </div>
        {/each}
    </div>
</div>

<style>
    .loading-state {
        padding: 0;
    }

    .loading-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1rem;
    }

    .skeleton-card {
        border-radius: 0.75rem;
        background: oklch(0.2 0 0);
        border: 1px solid oklch(1 0 0 / 6%);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .skeleton-line {
        border-radius: 0.375rem;
        background: linear-gradient(
            90deg,
            oklch(0.25 0 0) 25%,
            oklch(0.3 0 0) 50%,
            oklch(0.25 0 0) 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s ease-in-out infinite;
    }

    .skeleton-sm {
        height: 0.75rem;
        width: 40%;
    }
    .skeleton-lg {
        height: 1.75rem;
        width: 60%;
    }
    .skeleton-md {
        height: 0.625rem;
        width: 80%;
    }

    @keyframes shimmer {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
</style>
