<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import type { AlertState } from "./alert-state.svelte.js";

	export const alertVariants = tv({
		base: "relative w-full rounded-xl border p-3 text-xs flex items-start gap-2.5 backdrop-blur-md transition-all group/alert leading-relaxed",
		variants: {
			variant: {
				default: "bg-card text-card-foreground border-border",
				destructive:
					"bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300 [&_svg]:text-red-600 dark:[&_svg]:text-red-400",
				error:
					"bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300 [&_svg]:text-red-600 dark:[&_svg]:text-red-400",
				success:
					"bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-300 [&_svg]:text-emerald-600 dark:[&_svg]:text-emerald-400",
				warning:
					"bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25 text-amber-800 dark:text-amber-300 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
				info:
					"bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/25 text-sky-700 dark:text-sky-300 [&_svg]:text-sky-600 dark:[&_svg]:text-sky-400",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type AlertVariant = VariantProps<typeof alertVariants>["variant"];

	export type AlertProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: AlertVariant;
		title?: string | null;
		message?: string | null;
		state?: AlertState | null;
		show?: boolean;
		icon?: any | boolean;
		dismissible?: boolean;
		onDismiss?: () => void;
	};
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { HugeiconsIcon } from "@hugeicons/svelte";
	import {
		AlertCircleIcon,
		CheckmarkCircle02Icon,
		Alert02Icon,
		InformationCircleIcon,
		Cancel01Icon,
	} from "@hugeicons/core-free-icons";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		title = null,
		message = $bindable(undefined),
		state = null,
		show = undefined,
		icon = true,
		dismissible = false,
		onDismiss = undefined,
		children,
		...restProps
	}: AlertProps = $props();

	let resolvedMessage = $derived(state ? state.message : message);
	let resolvedTitle = $derived(state ? state.title : title);
	let resolvedVariant = $derived<AlertVariant>((state ? state.variant : variant) ?? "default");

	// Self-managing condition to eliminate boilerplate {#if} in consumer templates
	let isVisible = $derived.by(() => {
		if (show !== undefined) return show;
		if (state) return state.visible && Boolean(state.message);
		if (message !== undefined) return Boolean(message && message.trim().length > 0);
		if (children) return true;
		return false;
	});

	let defaultIcon = $derived.by(() => {
		if (icon === false) return null;
		if (icon && typeof icon === "object") return icon;
		switch (resolvedVariant) {
			case "destructive":
			case "error":
				return AlertCircleIcon;
			case "success":
				return CheckmarkCircle02Icon;
			case "warning":
				return Alert02Icon;
			case "info":
				return InformationCircleIcon;
			default:
				return null;
		}
	});

	function handleDismiss() {
		if (state) {
			state.clear();
		}
		if (message !== undefined) {
			message = "";
		}
		onDismiss?.();
	}
</script>

{#if isVisible}
	<div
		bind:this={ref}
		data-slot="alert"
		role={resolvedVariant === "destructive" || resolvedVariant === "error" ? "alert" : "status"}
		class={cn(alertVariants({ variant: resolvedVariant }), className)}
		{...restProps}
	>
		{#if defaultIcon}
			<HugeiconsIcon icon={defaultIcon} size={16} class="shrink-0 mt-0.5" />
		{/if}

		<div class="flex-1 flex flex-col gap-0.5 min-w-0">
			{#if resolvedTitle}
				<div class="font-semibold text-xs leading-tight tracking-tight">
					{resolvedTitle}
				</div>
			{/if}

			{#if resolvedMessage}
				<p class="leading-relaxed text-xs">
					{resolvedMessage}
				</p>
			{/if}

			{@render children?.()}
		</div>

		{#if dismissible || onDismiss}
			<button
				type="button"
				class="shrink-0 p-1 -mr-1 -mt-0.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all text-current cursor-pointer"
				onclick={handleDismiss}
				aria-label="Tutup notifikasi"
			>
				<HugeiconsIcon icon={Cancel01Icon} size={14} />
			</button>
		{/if}
	</div>
{/if}
