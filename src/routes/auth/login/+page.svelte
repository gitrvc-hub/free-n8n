<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';

	let { data }: { data: { suspended: boolean } } = $props();
	let email = $state('');
	let password = $state('');
	let error = $state(data.suspended ? 'This account is suspended.' : '');
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
			error = result.error === 'SUSPENDED' ? 'This account is suspended.' : 'Invalid email or password';
			loading = false;
		} else {
			window.location.href = '/dashboard';
		}
	}
</script>

<svelte:head>
	<title>Log In | Free n8n</title>
	<meta name="description" content="Log into your free n8n sandbox." />
</svelte:head>

<div class="page-wrap max-w-2xl py-12 sm:py-20">
	<section class="surface-panel-strong p-6 sm:p-8">
		<h1 class="text-3xl font-semibold text-white">Log in</h1>

		<form onsubmit={handleSubmit} class="mt-8 space-y-5">
			{#if error}
				<div
					class="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
				>
					{error}
				</div>
			{/if}

			<div>
				<label for="email" class="field-label">Email</label>
				<input type="email" id="email" bind:value={email} required class="field-input" />
			</div>

			<div>
				<label for="password" class="field-label">Password</label>
				<input type="password" id="password" bind:value={password} required class="field-input" />
			</div>

			<button type="submit" disabled={loading} class="primary-button w-full">
				{loading ? 'Logging in...' : 'Log in'}
			</button>
		</form>

		<p class="mt-6 text-sm text-slate-400">
			Need an account?
			<a href="/auth/signup" class="text-indigo-300 hover:text-white">Sign up</a>
		</p>
	</section>
</div>
