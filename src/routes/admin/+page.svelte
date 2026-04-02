<script lang="ts">
  import type { PageData } from './$types';
  import { formatDistanceToNow } from 'date-fns';

  let { data }: { data: PageData } = $props();

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }
</script>

<svelte:head><title>Admin - Free n8n</title></svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8">
  <h1 class="mb-8 text-2xl font-bold">Admin Dashboard</h1>
  <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-lg border p-4">
      <p class="text-sm text-gray-500">Total Signups</p>
      <p class="text-3xl font-bold">{data.stats.totalUsers}</p>
    </div>
    <div class="rounded-lg border p-4">
      <p class="text-sm text-gray-500">Active</p>
      <p class="text-3xl font-bold text-green-600">{data.stats.activeUsers}</p>
    </div>
    <div class="rounded-lg border p-4">
      <p class="text-sm text-gray-500">Inactive</p>
      <p class="text-3xl font-bold text-yellow-600">{data.stats.inactiveUsers}</p>
    </div>
    <div class="rounded-lg border p-4">
      <p class="text-sm text-gray-500">Reclaimed</p>
      <p class="text-3xl font-bold text-gray-600">{data.stats.reclaimedUsers}</p>
    </div>
  </div>
  <div class="mb-8 grid gap-4 sm:grid-cols-2">
    <div class="rounded-lg border p-4">
      <p class="text-sm text-gray-500">Total Backups</p>
      <p class="text-3xl font-bold">{data.stats.totalBackups}</p>
    </div>
    <div class="rounded-lg border p-4">
      <p class="text-sm text-gray-500">Backup Storage</p>
      <p class="text-3xl font-bold">{formatBytes(data.stats.backupStorageBytes)}</p>
    </div>
  </div>
  <h2 class="mb-4 text-lg font-semibold">Recent Jobs</h2>
  <table class="w-full text-left text-sm">
    <thead class="border-b text-xs uppercase text-gray-500">
      <tr><th class="px-4 py-2">Type</th><th class="px-4 py-2">Status</th><th class="px-4 py-2">User</th><th class="px-4 py-2">When</th></tr>
    </thead>
    <tbody>
      {#each data.recentJobs as job}
        <tr class="border-b">
          <td class="px-4 py-2">{job.jobType}</td>
          <td class="px-4 py-2"><span class="rounded px-2 py-0.5 text-xs {job.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">{job.status}</span></td>
          <td class="px-4 py-2 text-gray-500">{job.userEmail ?? '-'}</td>
          <td class="px-4 py-2 text-gray-500">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
