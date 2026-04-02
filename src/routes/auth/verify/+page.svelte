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
      <h1 class="mb-4 text-2xl font-bold text-white">Email verified!</h1>
      <p class="mb-4 text-slate-300">Your n8n workspace is ready.</p>

      <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
        <p class="text-xs uppercase text-slate-500 mb-3 font-medium tracking-wide">Your n8n login credentials</p>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">Email</span>
            <span class="text-sm text-white font-mono">{data.email}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400">Password</span>
            <code class="text-sm text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-mono">{data.n8nPassword}</code>
          </div>
        </div>
        <p class="text-xs text-slate-500 mt-3">Save these — you'll need them to sign into the n8n editor.</p>
      </div>

      <a href="/auth/login" class="inline-block rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-white font-medium shadow-lg shadow-indigo-500/25 transition-colors">Go to Dashboard</a>
    {:else}
      <h1 class="mb-4 text-2xl font-bold text-white">Invalid or expired link</h1>
      <p class="mb-6 text-slate-300">This verification link is invalid or has expired.</p>
      <a href="/auth/signup" class="text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</a>
    {/if}
  </div>
</div>
