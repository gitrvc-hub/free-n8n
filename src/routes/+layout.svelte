<script lang="ts">
	import '../app.css';
	import { signOut } from '@auth/sveltekit/client';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	function handleLogout() {
		signOut({ callbackUrl: '/' });
	}
</script>

<div class="relative min-h-screen overflow-x-hidden">
	<div class="pointer-events-none absolute inset-x-0 top-0 h-[32rem] shell-grid"></div>
	<div
		class="pointer-events-none absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
	></div>

	<main class="relative z-10 pb-20 pt-8 sm:pt-10">
		{@render children()}
	</main>

	{#if data.session?.user}
		<div class="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
			<button onclick={handleLogout} class="secondary-button px-4 py-2">Sign out</button>
		</div>
	{/if}
</div>
