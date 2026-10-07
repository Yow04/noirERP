<script lang="ts">
    import { Card, CardContent } from "$lib/components/ui/card";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import type { ComponentType } from "svelte";
    import { cn } from "$lib/utils";

    type StatVariant = "products" | "categories" | "users" | "stock" | "default";

    type Props = {
        label: string;
        value: string | number;
        icon: any;
        variant?: StatVariant;
        class?: string;
    };

    let {
        label,
        value,
        icon,
        variant = "default",
        class: className,
    }: Props = $props();
</script>

<Card class={cn("stat-card", className)}>
    <CardContent class="stat-card-inner">
        <div class={cn("stat-icon", `stat-icon-${variant}`)}>
            <HugeiconsIcon
                {icon}
                size={22}
                strokeWidth={1.8}
            />
        </div>
        <div class="stat-data">
            <p class="stat-label">{label}</p>
            <p class="stat-value">{value}</p>
        </div>
    </CardContent>
</Card>

<style>
    :global(.stat-card) {
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        cursor: default;
    }

    :global(.stat-card:hover) {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px oklch(0 0 0 / 30%);
    }

    :global(.stat-card-inner) {
        display: flex !important;
        align-items: center !important;
        gap: 1rem !important;
        padding: 1.25rem !important;
    }

    .stat-icon {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon-products {
        background: oklch(0.45 0.15 280 / 15%);
        color: oklch(0.7 0.15 280);
    }

    .stat-icon-categories {
        background: oklch(0.55 0.15 170 / 15%);
        color: oklch(0.7 0.15 170);
    }

    .stat-icon-users {
        background: oklch(0.55 0.12 50 / 15%);
        color: oklch(0.75 0.12 50);
    }

    .stat-icon-stock {
        background: oklch(0.55 0.15 140 / 15%);
        color: oklch(0.7 0.15 140);
    }

    .stat-icon-default {
        background: oklch(0.5 0.1 240 / 15%);
        color: oklch(0.7 0.1 240);
    }

    .stat-data {
        min-width: 0;
    }

    .stat-label {
        font-size: 0.8rem;
        color: var(--muted-foreground);
        font-weight: 500;
    }

    .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        margin-top: 0.125rem;
    }
</style>
