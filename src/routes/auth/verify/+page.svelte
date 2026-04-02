<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Verify Email - Free n8n</title></svelte:head>

<div class="mx-auto max-w-md px-4 py-16 text-center">
  <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
    {#if data.status === 'sent'}
      <h1 class="mb-4 text-2xl font-bold text-white">Check your email</h1>
      <p class="text-slate-300">We sent a verification link to your email. Click it to activate your account.</p>
    {:else if data.status === 'verified'}
      <h1 class="mb-4 text-2xl font-bold text-white">You're all set!</h1>
      <p class="mb-6 text-slate-300">Your workspace is active. Check your email for your login password.</p>
      <a href="/auth/login" class="inline-block rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-white font-medium shadow-lg shadow-indigo-500/25 transition-colors">Go to Dashboard</a>
    {:else}
      <h1 class="mb-4 text-2xl font-bold text-white">Invalid or expired link</h1>
      <p class="mb-6 text-slate-300">This verification link is invalid or has expired.</p>
      <a href="/auth/signup" class="text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</a>
    {/if}
  </div>
</div>
