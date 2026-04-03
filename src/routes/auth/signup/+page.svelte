<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign Up | Free n8n</title>
	<meta name="description" content="Create your free n8n sandbox." />
</svelte:head>

<div class="page-wrap max-w-2xl py-12 sm:py-20">
	<section class="surface-panel-strong p-6 sm:p-8">
		<h1 class="text-3xl font-semibold text-white">Sign up</h1>

		<form method="POST" use:enhance class="mt-8 space-y-5">
			<div>
				<label for="email" class="field-label">Email</label>
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

			<button type="submit" class="primary-button w-full">Send link</button>
		</form>

		<p class="mt-6 text-sm text-slate-400">
			Already have an account?
			<a href="/auth/login" class="text-indigo-300 hover:text-white">Log in</a>
		</p>
	</section>
</div>
