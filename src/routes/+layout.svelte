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

	<header class="relative z-10">
		<div class="page-wrap pt-5 sm:pt-8">
			<nav
				class="surface-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
			>
				<div class="flex items-center gap-4">
					<a href="/" class="flex items-center gap-3">
						<div
							class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 text-sm font-black text-slate-950"
						>
							n8n
						</div>
						<div>
							<p class="text-sm font-semibold tracking-[0.22em] text-slate-300 uppercase">
								Free n8n
							</p>
							<p class="text-xs text-slate-500">Shared practice sandbox for learning n8n</p>
						</div>
					</a>
				</div>

				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					<a href="/" class="secondary-button px-4 py-2">Overview</a>
					{#if data.session?.user}
						{#if (data.session.user as { isAdmin?: boolean }).isAdmin}
							<a href="/admin" class="secondary-button px-4 py-2">Ops</a>
						{:else}
							<a href="/dashboard" class="secondary-button px-4 py-2">Sandbox</a>
						{/if}
						<button onclick={handleLogout} class="secondary-button px-4 py-2">Log out</button>
					{:else}
						<a href="/auth/login" class="secondary-button px-4 py-2">Log in</a>
						<a href="/auth/signup" class="primary-button px-4 py-2">Start practicing</a>
					{/if}
				</div>
			</nav>
		</div>
	</header>

	<main class="relative z-10 pb-20 pt-8 sm:pt-10">
		{@render children()}
	</main>
</div>
