<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const trustPoints = [
		'Email-only signup. No credit card and no infra setup.',
		'Credentials are generated for you and sent after verification.',
		'If your sandbox goes inactive, we archive it and let you restore it later.'
	];
</script>

<svelte:head>
	<title>Start Practicing | Free n8n</title>
	<meta
		name="description"
		content="Create a free shared n8n sandbox and start practicing without managing infrastructure."
	/>
</svelte:head>

<div class="page-wrap grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
	<section class="space-y-6 pt-4 sm:pt-10">
		<div class="eyebrow">New sandbox</div>
		<div class="space-y-4">
			<h1 class="hero-title max-w-xl text-4xl sm:text-5xl">
				Start practicing n8n with one verified email.
			</h1>
			<p class="hero-copy max-w-xl">
				We generate the initial credentials, provision your shared sandbox after verification, and
				keep recovery simple if you return later.
			</p>
		</div>

		<div class="grid gap-3">
			{#each trustPoints as point}
				<div class="metric-card flex items-start gap-3 p-4">
					<div class="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-300"></div>
					<p class="text-sm leading-6 text-slate-300">{point}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="surface-panel-strong p-6 sm:p-8">
		<div class="space-y-2">
			<p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Create account</p>
			<h2 class="text-2xl font-semibold text-white">Get your practice link</h2>
			<p class="text-sm leading-6 text-slate-400">
				Use an inbox you can access immediately. Your activation link expires in 24 hours.
			</p>
		</div>

		<form method="POST" use:enhance class="mt-8 space-y-5">
			<div>
				<label for="email" class="field-label">Email address</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email ?? ''}
					required
					placeholder="you@example.com"
					class="field-input"
				/>
				{#if form?.errors?.email}
					<p class="mt-2 text-sm text-rose-300">{form.errors.email[0]}</p>
				{/if}
			</div>

			<button type="submit" class="primary-button w-full">Send sandbox link</button>
		</form>

		<div class="mt-8 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
			<p class="text-sm font-semibold text-white">What happens next</p>
			<ol class="mt-3 space-y-3 text-sm leading-6 text-slate-300">
				<li>1. Verify your email address.</li>
				<li>2. We activate your account and send your sandbox password.</li>
				<li>3. You enter n8n from the dashboard with one click SSO.</li>
			</ol>
		</div>

		<p class="mt-6 text-sm text-slate-400">
			Already have credentials?
			<a href="/auth/login" class="text-indigo-300 hover:text-white">Log in here</a>
		</p>
	</section>
</div>
