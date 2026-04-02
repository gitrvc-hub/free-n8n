<script lang="ts">
  import type { PageData } from './$types';
  import { formatDistanceToNow } from 'date-fns';

  let { data }: { data: PageData } = $props();
  let restoring = $state(false);
  let restoreError = $state('');

  async function restoreWorkspace() {
    restoring = true;
    restoreError = '';
    const response = await fetch('/api/instance/restore', { method: 'POST' });
    if (!response.ok) {
      const body = await response.json();
      restoreError = body.error?.message ?? 'Restore failed.';
      restoring = false;
      return;
    }
    window.location.reload();
  }
</script>

<svelte:head><title>Dashboard - Free n8n</title></svelte:head>

<div class="mx-auto max-w-2xl px-4 py-16">
  <h1 class="mb-8 text-2xl font-bold text-white">Your n8n Workspace</h1>
  <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm text-slate-400">{data.user.email}</span>
      <span class="rounded-full px-3 py-1 text-xs font-medium
        {data.user.status === 'active' ? 'bg-green-500/20 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : ''}
        {data.user.status === 'reclaimed' ? 'bg-yellow-500/20 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.3)]' : ''}
        {data.user.status === 'suspended' ? 'bg-red-500/20 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : ''}
      ">{data.user.status}</span>
    </div>

    {#if data.user.status === 'active'}
      <p class="mb-5 text-sm text-slate-300">
        {#if data.user.lastActiveAt}
          Last active {formatDistanceToNow(new Date(data.user.lastActiveAt), { addSuffix: true })}
        {:else}No activity yet{/if}
      </p>
      <a href="/api/n8n/session" class="inline-block rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-white font-medium shadow-lg shadow-indigo-500/25 transition-colors">Open n8n</a>
    {:else if data.user.status === 'reclaimed'}
      <p class="mb-5 text-sm text-slate-300">Your workspace was archived due to inactivity.</p>
      {#if restoreError}<p class="mb-4 text-sm text-red-400">{restoreError}</p>{/if}
      <button onclick={restoreWorkspace} disabled={restoring}
        class="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-white font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-colors">
        {restoring ? 'Restoring...' : 'Restore my workspace'}
      </button>
    {:else if data.user.status === 'suspended'}
      <p class="text-sm text-red-400">Your account has been suspended.</p>
    {/if}
  </div>
  <p class="mt-6 text-sm text-slate-500">Workspaces inactive for 7 days are automatically archived.</p>
</div>
