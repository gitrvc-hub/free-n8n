<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Verify Email | Free n8n</title>
</svelte:head>

<div class="page-wrap max-w-2xl py-12 sm:py-20">
	<div class="surface-panel-strong p-6 text-center sm:p-8">
		{#if data.status === 'sent'}
			<h1 class="text-3xl font-semibold text-white">Check your email</h1>
			<p class="mt-4 text-sm text-slate-300">Open the link we sent to continue.</p>
			<div class="mt-8 flex justify-center">
				<a href="/auth/login" class="secondary-button">Log in</a>
			</div>
		{:else if data.status === 'verified'}
			<h1 class="text-3xl font-semibold text-white">Your sandbox is ready</h1>
			<p class="mt-4 text-sm text-slate-300">Use the password from your email and log in.</p>
			<div class="mt-8 flex justify-center">
				<a href="/auth/login" class="primary-button">Log in</a>
			</div>
		{:else}
			<h1 class="text-3xl font-semibold text-white">Link expired</h1>
			<p class="mt-4 text-sm text-slate-300">Request a new signup link.</p>
			<div class="mt-8 flex justify-center">
				<a href="/auth/signup" class="primary-button">Sign up again</a>
			</div>
		{/if}
	</div>
</div>
