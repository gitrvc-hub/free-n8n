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
  <h1 class="mb-8 text-2xl font-bold">Your n8n Workspace</h1>
  <div class="rounded-lg border p-6">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm text-gray-500">{data.user.email}</span>
      <span class="rounded-full px-3 py-1 text-xs font-medium
        {data.user.status === 'active' ? 'bg-green-100 text-green-800' : ''}
        {data.user.status === 'reclaimed' ? 'bg-yellow-100 text-yellow-800' : ''}
        {data.user.status === 'suspended' ? 'bg-red-100 text-red-800' : ''}
      ">{data.user.status}</span>
    </div>

    {#if data.user.status === 'active'}
      <p class="mb-4 text-sm text-gray-600">
        {#if data.user.lastActiveAt}
          Last active {formatDistanceToNow(new Date(data.user.lastActiveAt), { addSuffix: true })}
        {:else}No activity yet{/if}
      </p>
      <a href="/n8n/" class="inline-block rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Open n8n</a>
    {:else if data.user.status === 'reclaimed'}
      <p class="mb-4 text-sm text-gray-600">Your workspace was archived due to inactivity.</p>
      {#if restoreError}<p class="mb-4 text-sm text-red-600">{restoreError}</p>{/if}
      <button onclick={restoreWorkspace} disabled={restoring}
        class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
        {restoring ? 'Restoring...' : 'Restore my workspace'}
      </button>
    {:else if data.user.status === 'suspended'}
      <p class="text-sm text-red-600">Your account has been suspended.</p>
    {/if}
  </div>
  <p class="mt-6 text-sm text-gray-500">Workspaces inactive for 7 days are automatically archived.</p>
</div>
