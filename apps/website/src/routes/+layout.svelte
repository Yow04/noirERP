<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { AppShell } from '$lib/components/layout';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authState } from '$lib/state/auth.svelte';

	let { children } = $props();

	let isAuthPage = $derived(
		page.url.pathname.startsWith('/login') ||
		page.url.pathname.startsWith('/register') ||
		page.url.pathname.startsWith('/forgot-password')
	);

	// Universal Reactive Route Guard
	$effect(() => {
		if (!authState.initialized) return;

		if (!isAuthPage && !authState.isAuthenticated) {
			const target = page.url.pathname + page.url.search;
			const from = target !== '/' ? `?from=${encodeURIComponent(target)}` : '';
			goto(`/login${from}`);
		} else if (isAuthPage && authState.isAuthenticated) {
			const target = page.url.searchParams.get('from') || '/';
			goto(target);
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isAuthPage}
	{@render children()}
{:else if !authState.initialized}
	<!-- Minimalist loading screen to prevent flash of unauthenticated content -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950 text-zinc-400">
		<div class="flex flex-col items-center gap-3">
			<div class="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
			<span class="text-xs tracking-wider uppercase text-zinc-500 font-mono">Memuat sesi...</span>
		</div>
	</div>
{:else if authState.isAuthenticated}
	<AppShell>
		{@render children()}
	</AppShell>
{/if}

