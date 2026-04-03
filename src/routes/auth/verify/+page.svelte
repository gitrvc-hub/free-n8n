<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Verify Email | Free n8n</title>
</svelte:head>

<div class="page-wrap max-w-3xl">
	<div class="surface-panel-strong p-6 text-center sm:p-10">
		{#if data.status === 'sent'}
			<div class="eyebrow">Verification sent</div>
			<h1 class="mt-5 text-3xl font-semibold text-white sm:text-4xl">
				Check your inbox to activate the sandbox.
			</h1>
			<p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
				The verification link expires in 24 hours. Once you click it, your practice sandbox is
				activated and your login password is already waiting in your email.
			</p>
			<div class="mt-8 flex justify-center">
				<a href="/auth/login" class="secondary-button">I already verified</a>
			</div>
		{:else if data.status === 'verified'}
			<div class="eyebrow">Sandbox active</div>
			<h1 class="mt-5 text-3xl font-semibold text-white sm:text-4xl">Your sandbox is ready.</h1>
			<p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
				Your account has been activated. Use the password from your email to log into the dashboard,
				then open n8n with one click and start practicing.
			</p>
			<div class="mt-8 flex justify-center">
				<a href="/auth/login" class="primary-button">Go to login</a>
			</div>
		{:else}
			<div class="eyebrow">Link expired</div>
			<h1 class="mt-5 text-3xl font-semibold text-white sm:text-4xl">
				That activation link is no longer valid.
			</h1>
			<p class="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
				Create a new sandbox request and we will send a fresh verification email. Existing
				unverified accounts can safely retry.
			</p>
			<div class="mt-8 flex justify-center">
				<a href="/auth/signup" class="primary-button">Request a fresh link</a>
			</div>
		{/if}
	</div>
</div>
