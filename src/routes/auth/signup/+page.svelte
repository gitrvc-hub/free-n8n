<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>Sign Up - Free n8n</title>
  <meta name="description" content="Get your free n8n automation workspace" />
</svelte:head>

<div class="mx-auto max-w-md px-4 py-16">
  <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
    <h1 class="mb-2 text-2xl font-bold text-white">Get your free n8n workspace</h1>
    <p class="mb-8 text-sm text-slate-400">Enter your email and we'll send you your login credentials.</p>

    <form method="POST" use:enhance class="space-y-5">
      <div>
        <label for="email" class="block text-sm font-medium text-slate-300">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form?.email ?? ''}
          required
          placeholder="you@example.com"
          class="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
        />
        {#if form?.errors?.email}<p class="mt-1 text-sm text-red-400">{form.errors.email[0]}</p>{/if}
      </div>
      <button type="submit" class="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-white font-medium shadow-lg shadow-indigo-500/25 transition-colors">
        Sign Up
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-slate-400">
      Already have an account? <a href="/auth/login" class="text-indigo-400 hover:text-indigo-300 transition-colors">Log in</a>
    </p>
  </div>
</div>
