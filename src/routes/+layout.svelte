<script lang="ts">
  import '../app.css';
  import { signOut } from '@auth/sveltekit/client';
  import type { LayoutData } from './$types';
  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

  function handleLogout() {
    signOut({ callbackUrl: '/' });
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
  <nav class="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 py-3">
    <div class="mx-auto flex max-w-5xl items-center justify-between">
      <a href="/" class="text-lg font-bold text-white tracking-tight">Free n8n</a>
      <div class="flex items-center gap-4">
        {#if data.session?.user}
          <a href="/dashboard" class="text-sm text-slate-300 hover:text-white transition-colors">Dashboard</a>
          <button onclick={handleLogout} class="text-sm text-slate-400 hover:text-white transition-colors">Log out</button>
        {:else}
          <a href="/auth/login" class="text-sm text-slate-300 hover:text-white transition-colors">Log in</a>
          <a href="/auth/signup" class="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-sm text-white shadow-lg shadow-indigo-500/25 transition-colors">Sign up free</a>
        {/if}
      </div>
    </div>
  </nav>
  {@render children()}
</div>
