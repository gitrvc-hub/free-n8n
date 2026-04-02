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
  <h1 class="mb-8 text-2xl font-bold text-white">Admin Dashboard</h1>
  <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Total Signups</p>
      <p class="text-3xl font-bold text-white">{data.stats.totalUsers}</p>
    </div>
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Active</p>
      <p class="text-3xl font-bold text-green-400">{data.stats.activeUsers}</p>
    </div>
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Inactive</p>
      <p class="text-3xl font-bold text-yellow-400">{data.stats.inactiveUsers}</p>
    </div>
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Reclaimed</p>
      <p class="text-3xl font-bold text-slate-300">{data.stats.reclaimedUsers}</p>
    </div>
  </div>
  <div class="mb-8 grid gap-4 sm:grid-cols-2">
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Total Backups</p>
      <p class="text-3xl font-bold text-white">{data.stats.totalBackups}</p>
    </div>
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Backup Storage</p>
      <p class="text-3xl font-bold text-white">{formatBytes(data.stats.backupStorageBytes)}</p>
    </div>
  </div>
  <h2 class="mb-4 text-lg font-semibold text-white">Recent Jobs</h2>
  <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
    <table class="w-full text-left text-sm">
      <thead class="border-b border-white/5 text-xs uppercase text-slate-500">
        <tr>
          <th class="px-4 py-3">Type</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">User</th>
          <th class="px-4 py-3">When</th>
        </tr>
      </thead>
      <tbody>
        {#each data.recentJobs as job}
          <tr class="border-b border-white/5 last:border-0">
            <td class="px-4 py-3 text-slate-300">{job.jobType}</td>
            <td class="px-4 py-3">
              <span class="rounded-md px-2 py-0.5 text-xs font-medium
                {job.status === 'success'
                  ? 'bg-green-500/20 text-green-400 shadow-[0_0_6px_rgba(34,197,94,0.25)]'
                  : 'bg-red-500/20 text-red-400 shadow-[0_0_6px_rgba(239,68,68,0.25)]'}"
              >{job.status}</span>
            </td>
            <td class="px-4 py-3 text-slate-500">{job.userEmail ?? '-'}</td>
            <td class="px-4 py-3 text-slate-500">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
