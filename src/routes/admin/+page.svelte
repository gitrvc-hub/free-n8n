<script lang="ts">
  import type { PageData } from './$types';
  import { formatDistanceToNow, format } from 'date-fns';

  let { data }: { data: PageData } = $props();
  let filter = $state('all');

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  function daysAgo(dateStr: string): number {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  }

  let filteredUsers = $derived(
    filter === 'all'
      ? data.users
      : data.users.filter((u) => u.status === filter)
  );
</script>

<svelte:head><title>Admin - Free n8n</title></svelte:head>

<div class="mx-auto max-w-6xl px-4 py-8">
  <h1 class="mb-2 text-2xl font-bold text-white">Admin Dashboard</h1>
  <p class="mb-8 text-sm text-slate-400">free-n8n.infrakt.cloud</p>

  <!-- Stats -->
  <div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
    <button onclick={() => filter = 'all'}
      class="bg-white/5 backdrop-blur-xl border rounded-2xl shadow-2xl p-5 text-left transition-all
        {filter === 'all' ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-white/10 hover:border-white/20'}">
      <p class="text-sm text-slate-400">Total Users</p>
      <p class="text-3xl font-bold text-white">{data.stats.totalUsers}</p>
    </button>
    <button onclick={() => filter = 'active'}
      class="bg-white/5 backdrop-blur-xl border rounded-2xl shadow-2xl p-5 text-left transition-all
        {filter === 'active' ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-white/10 hover:border-white/20'}">
      <p class="text-sm text-slate-400">Active</p>
      <p class="text-3xl font-bold text-green-400">{data.stats.activeUsers}</p>
      <p class="text-xs text-slate-500 mt-1">used in last 7 days</p>
    </button>
    <button onclick={() => filter = 'active'}
      class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 text-left hover:border-white/20 transition-all">
      <p class="text-sm text-slate-400">Inactive</p>
      <p class="text-3xl font-bold text-yellow-400">{data.stats.inactiveUsers}</p>
      <p class="text-xs text-slate-500 mt-1">approaching reclaim</p>
    </button>
    <button onclick={() => filter = 'reclaimed'}
      class="bg-white/5 backdrop-blur-xl border rounded-2xl shadow-2xl p-5 text-left transition-all
        {filter === 'reclaimed' ? 'border-orange-500/50 ring-1 ring-orange-500/20' : 'border-white/10 hover:border-white/20'}">
      <p class="text-sm text-slate-400">Reclaimed</p>
      <p class="text-3xl font-bold text-slate-300">{data.stats.reclaimedUsers}</p>
      <p class="text-xs text-slate-500 mt-1">backed up & archived</p>
    </button>
    <button onclick={() => filter = 'suspended'}
      class="bg-white/5 backdrop-blur-xl border rounded-2xl shadow-2xl p-5 text-left transition-all
        {filter === 'suspended' ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-white/10 hover:border-white/20'}">
      <p class="text-sm text-slate-400">Suspended</p>
      <p class="text-3xl font-bold text-red-400">{data.stats.suspendedUsers}</p>
    </button>
  </div>

  <!-- Backup stats -->
  <div class="mb-8 grid gap-4 sm:grid-cols-3">
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Total Backups</p>
      <p class="text-2xl font-bold text-white">{data.stats.totalBackups}</p>
    </div>
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Backup Storage</p>
      <p class="text-2xl font-bold text-white">{formatBytes(data.stats.backupStorageBytes)}</p>
    </div>
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5">
      <p class="text-sm text-slate-400">Avg per User</p>
      <p class="text-2xl font-bold text-white">
        {data.stats.totalUsers > 0 ? formatBytes(Math.round(data.stats.backupStorageBytes / data.stats.totalUsers)) : '0 B'}
      </p>
    </div>
  </div>

  <!-- Users Table -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white">
        Users
        {#if filter !== 'all'}
          <span class="text-sm font-normal text-slate-400 ml-2">
            showing: {filter}
            <button onclick={() => filter = 'all'} class="text-indigo-400 hover:text-indigo-300 ml-1">clear</button>
          </span>
        {/if}
      </h2>
      <span class="text-sm text-slate-500">{filteredUsers.length} users</span>
    </div>
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-white/10 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Signed Up</th>
            <th class="px-4 py-3">Last Active</th>
            <th class="px-4 py-3">Backups</th>
            <th class="px-4 py-3">Role</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredUsers as user}
            <tr class="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="h-7 w-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300 font-medium">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <span class="text-white">{user.email}</span>
                    {#if !user.isVerified}
                      <span class="ml-2 text-xs text-yellow-400">unverified</span>
                    {/if}
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="rounded-md px-2 py-0.5 text-xs font-medium
                  {user.status === 'active' ? 'bg-green-500/20 text-green-400' : ''}
                  {user.status === 'reclaimed' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  {user.status === 'suspended' ? 'bg-red-500/20 text-red-400' : ''}
                ">{user.status}</span>
              </td>
              <td class="px-4 py-3 text-slate-400">
                <div>{format(new Date(user.createdAt), 'MMM d, yyyy')}</div>
                <div class="text-xs text-slate-500">{daysAgo(user.createdAt)} days ago</div>
              </td>
              <td class="px-4 py-3 text-slate-400">
                {#if user.lastActiveAt}
                  <div>{formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })}</div>
                {:else}
                  <span class="text-slate-600">never</span>
                {/if}
              </td>
              <td class="px-4 py-3 text-slate-400">{user.backupCount}</td>
              <td class="px-4 py-3">
                {#if user.isAdmin}
                  <span class="rounded-md px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300">admin</span>
                {:else}
                  <span class="text-slate-500 text-xs">member</span>
                {/if}
              </td>
            </tr>
          {/each}
          {#if filteredUsers.length === 0}
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-slate-500">No users found</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Recent Jobs -->
  <h2 class="mb-4 text-lg font-semibold text-white">Recent Jobs</h2>
  <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
    <table class="w-full text-left text-sm">
      <thead class="border-b border-white/10 text-xs uppercase text-slate-500">
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
                {job.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}"
              >{job.status}</span>
            </td>
            <td class="px-4 py-3 text-slate-500">{job.userEmail ?? '-'}</td>
            <td class="px-4 py-3 text-slate-500">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</td>
          </tr>
        {/each}
        {#if data.recentJobs.length === 0}
          <tr>
            <td colspan="4" class="px-4 py-8 text-center text-slate-500">No jobs yet</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>
