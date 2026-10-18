<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { AppShell } from '$lib/components/layout';
	import { page } from '$app/state';

	let { children } = $props();

	let isAuthPage = $derived(
		page.url.pathname.startsWith('/login') ||
		page.url.pathname.startsWith('/register') ||
		page.url.pathname.startsWith('/forgot-password')
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if isAuthPage}
	{@render children()}
{:else}
	<AppShell>
		{@render children()}
	</AppShell>
{/if}

