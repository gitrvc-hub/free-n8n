<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		const result = await signIn('credentials', {
			email,
			password,
			redirect: false
		});

		if (result?.error) {
			error = 'Invalid email or password';
			loading = false;
		} else {
			window.location.href = '/dashboard';
		}
	}
</script>

<svelte:head>
	<title>Log In | Free n8n</title>
	<meta name="description" content="Access your n8n practice sandbox dashboard." />
</svelte:head>

<div class="page-wrap grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
	<section class="space-y-6 pt-4 sm:pt-10">
		<div class="eyebrow">Sandbox access</div>
		<h1 class="hero-title max-w-xl text-4xl sm:text-5xl">
			Open your dashboard, check your limits, and jump back into practice mode.
		</h1>
		<p class="hero-copy max-w-xl">
			Use the credentials sent after verification. If your sandbox was archived, you will restore it
			from the dashboard instead of starting over.
		</p>
		<div class="grid gap-3 sm:grid-cols-2">
			<div class="metric-card p-5">
				<p class="text-sm font-medium text-slate-400">One-click editor access</p>
				<p class="mt-2 text-lg font-semibold text-white">Dashboard-to-n8n SSO</p>
			</div>
			<div class="metric-card p-5">
				<p class="text-sm font-medium text-slate-400">Archive aware</p>
				<p class="mt-2 text-lg font-semibold text-white">
					Restore your practice flows when inactive
				</p>
			</div>
		</div>
	</section>

	<section class="surface-panel-strong p-6 sm:p-8">
		<div class="space-y-2">
			<p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Sign in</p>
			<h2 class="text-2xl font-semibold text-white">Back to your sandbox</h2>
		</div>

		<form onsubmit={handleSubmit} class="mt-8 space-y-5">
			{#if error}
				<div
					class="rounded-3xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
				>
					{error}
				</div>
			{/if}

			<div>
				<label for="email" class="field-label">Email address</label>
				<input type="email" id="email" bind:value={email} required class="field-input" />
			</div>

			<div>
				<label for="password" class="field-label">Password</label>
				<input type="password" id="password" bind:value={password} required class="field-input" />
			</div>

			<button type="submit" disabled={loading} class="primary-button w-full">
				{loading ? 'Opening sandbox...' : 'Log in'}
			</button>
		</form>

		<div
			class="mt-8 rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm leading-6 text-slate-300"
		>
			<p class="font-medium text-white">Missing your credentials?</p>
			<p class="mt-2">
				They are sent after verification. If you never completed setup, create a new sandbox with
				the same email.
			</p>
		</div>

		<p class="mt-6 text-sm text-slate-400">
			Need a new sandbox?
			<a href="/auth/signup" class="text-indigo-300 hover:text-white">Create one here</a>
		</p>
	</section>
</div>
