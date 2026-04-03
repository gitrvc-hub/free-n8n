<script lang="ts">
	import { enhance } from '$app/forms';
	import { format, formatDistanceToNow } from 'date-fns';
	import type { UserStatus } from '@prisma/client';
	import { getStatusLabel, getStatusTone } from '$lib/ui';

	interface UsageSummary {
		activeWorkflowCount: number;
		executionsToday: number;
		lastExecutionAt: Date | string | null;
	}

	interface AdminData {
		admin: {
			id: string;
			email: string;
		};
		stats: {
			totalUsers: number;
			activeUsers: number;
			inactiveUsers: number;
			reclaimedUsers: number;
			suspendedUsers: number;
			totalBackups: number;
			backupStorageBytes: number;
			overWorkflowLimit: number;
			overExecutionLimit: number;
			atRiskUsers: number;
			reclaimDays: number;
		};
		users: Array<{
			id: string;
			email: string;
			status: UserStatus;
			isAdmin: boolean;
			isVerified: boolean;
			lastActiveAt: string | null;
			createdAt: string;
			backupCount: number;
			usage: UsageSummary;
			sandboxHealth: 'active' | 'attention' | 'archived' | 'suspended';
		}>;
		recentJobs: Array<{
			id: string;
			jobType: string;
			status: string;
			userEmail: string | null;
			createdAt: string;
		}>;
	}

	let { data }: { data: AdminData } = $props();
	let filter = $state<'all' | UserStatus>('all');
	let actionMessage = $state('');

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

	function statusClasses(status: UserStatus): string {
		const tone = getStatusTone(status);
		if (tone === 'emerald') return 'status-pill status-pill-emerald';
		if (tone === 'amber') return 'status-pill status-pill-amber';
		return 'status-pill status-pill-rose';
	}

	let filteredUsers = $derived(
		filter === 'all' ? data.users : data.users.filter((user) => user.status === filter)
	);
</script>

<svelte:head>
	<title>Ops Console | Free n8n</title>
</svelte:head>

<div class="page-wrap space-y-8">
	<section class="surface-panel-strong grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
		<div class="space-y-5">
			<div class="eyebrow">Operations console</div>
			<h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
				Adoption, capacity, and reclaim health for the shared n8n practice sandbox.
			</h1>
			<p class="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
				Track who is actively learning, who is approaching archive, and how much shared sandbox
				capacity is at risk before users hit practice limits.
			</p>
			<div
				class="rounded-3xl border border-cyan-400/15 bg-cyan-400/8 px-5 py-4 text-sm leading-6 text-cyan-50"
			>
				Signed in as platform admin <span class="font-semibold text-white">{data.admin.email}</span
				>. This account is for platform oversight only and is intentionally excluded from sandbox
				user flows.
			</div>
			{#if actionMessage}
				<div
					class="rounded-3xl border border-emerald-400/15 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100"
				>
					{actionMessage}
				</div>
			{/if}
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div class="metric-card p-5">
				<p class="text-sm font-medium text-slate-400">At risk of reclaim</p>
				<p class="mt-2 text-3xl font-semibold text-white">{data.stats.atRiskUsers}</p>
				<p class="mt-2 text-sm text-slate-400">
					No recent activity within {data.stats.reclaimDays} days
				</p>
			</div>
			<div class="metric-card p-5">
				<p class="text-sm font-medium text-slate-400">Backup footprint</p>
				<p class="mt-2 text-3xl font-semibold text-white">
					{formatBytes(data.stats.backupStorageBytes)}
				</p>
				<p class="mt-2 text-sm text-slate-400">
					{data.stats.totalBackups} archived snapshots stored
				</p>
			</div>
		</div>
	</section>

	<section class="grid gap-4 lg:grid-cols-4">
		<button onclick={() => (filter = 'all')} class="metric-card p-5 text-left">
			<p class="text-sm font-medium text-slate-400">Total users</p>
			<p class="mt-2 text-3xl font-semibold text-white">{data.stats.totalUsers}</p>
		</button>
		<button onclick={() => (filter = 'active')} class="metric-card p-5 text-left">
			<p class="text-sm font-medium text-slate-400">Active</p>
			<p class="mt-2 text-3xl font-semibold text-emerald-300">{data.stats.activeUsers}</p>
		</button>
		<button onclick={() => (filter = 'reclaimed')} class="metric-card p-5 text-left">
			<p class="text-sm font-medium text-slate-400">Archived</p>
			<p class="mt-2 text-3xl font-semibold text-amber-100">{data.stats.reclaimedUsers}</p>
		</button>
		<button onclick={() => (filter = 'suspended')} class="metric-card p-5 text-left">
			<p class="text-sm font-medium text-slate-400">Suspended</p>
			<p class="mt-2 text-3xl font-semibold text-rose-200">{data.stats.suspendedUsers}</p>
		</button>
	</section>

	<section class="grid gap-4 lg:grid-cols-3">
		<div class="surface-panel p-5">
			<p class="text-sm font-medium text-slate-400">Users at workflow cap</p>
			<p class="mt-2 text-2xl font-semibold text-white">{data.stats.overWorkflowLimit}</p>
		</div>
		<div class="surface-panel p-5">
			<p class="text-sm font-medium text-slate-400">Users at execution cap</p>
			<p class="mt-2 text-2xl font-semibold text-white">{data.stats.overExecutionLimit}</p>
		</div>
		<div class="surface-panel p-5">
			<p class="text-sm font-medium text-slate-400">Inactive but not archived</p>
			<p class="mt-2 text-2xl font-semibold text-white">{data.stats.inactiveUsers}</p>
		</div>
	</section>

	<section class="surface-panel overflow-hidden">
		<div
			class="flex flex-col gap-4 border-b border-white/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">User ledger</p>
				<h2 class="mt-2 text-xl font-semibold text-white">{filteredUsers.length} users in view</h2>
			</div>
			<div class="flex flex-wrap gap-2">
				<button class="secondary-button px-4 py-2" onclick={() => (filter = 'all')}>All</button>
				<button class="secondary-button px-4 py-2" onclick={() => (filter = 'active')}
					>Active</button
				>
				<button class="secondary-button px-4 py-2" onclick={() => (filter = 'reclaimed')}
					>Archived</button
				>
				<button class="secondary-button px-4 py-2" onclick={() => (filter = 'suspended')}
					>Suspended</button
				>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="data-table min-w-[960px]">
				<thead>
					<tr>
						<th>User</th>
						<th>Status</th>
						<th>Usage</th>
						<th>Activity</th>
						<th>Backups</th>
						<th>Role</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredUsers as user}
						<tr>
							<td>
								<div class="flex items-start gap-3">
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-sm font-semibold text-indigo-100"
									>
										{user.email[0].toUpperCase()}
									</div>
									<div>
										<p class="font-medium text-white">{user.email}</p>
										<p class="mt-1 text-xs text-slate-500">
											Joined {format(new Date(user.createdAt), 'MMM d, yyyy')} · {daysAgo(
												user.createdAt
											)}d ago
										</p>
										{#if !user.isVerified}
											<p class="mt-2 text-xs text-amber-200">Awaiting verification</p>
										{/if}
									</div>
								</div>
							</td>
							<td>
								<div class="space-y-2">
									<div class={statusClasses(user.status)}>{getStatusLabel(user.status)}</div>
									<p class="text-xs capitalize text-slate-500">sandbox {user.sandboxHealth}</p>
								</div>
							</td>
							<td>
								<div class="space-y-2">
									<p>{user.usage.activeWorkflowCount} active workflows</p>
									<p class="text-slate-500">{user.usage.executionsToday} executions today</p>
								</div>
							</td>
							<td>
								{#if user.lastActiveAt}
									<p>{formatDistanceToNow(new Date(user.lastActiveAt), { addSuffix: true })}</p>
								{:else}
									<p class="text-slate-500">No activity seen</p>
								{/if}
								<p class="mt-1 text-xs text-slate-500">
									{#if user.usage.lastExecutionAt}
										Last execution {format(new Date(user.usage.lastExecutionAt), 'MMM d, h:mm a')}
									{:else}
										No executions recorded
									{/if}
								</p>
							</td>
							<td>{user.backupCount}</td>
							<td>
								{#if user.isAdmin}
									<span class="status-pill status-pill-emerald">Admin</span>
								{:else}
									<span class="text-slate-500">Member</span>
								{/if}
							</td>
							<td>
								{#if user.status === 'suspended'}
									<form
										method="POST"
										action="?/unsuspend"
										use:enhance={() => {
											return async ({ result }) => {
												if (result.type === 'success') {
													actionMessage = `Unsuspended ${user.email}.`;
													window.location.reload();
												}
											};
										}}
									>
										<input type="hidden" name="userId" value={user.id} />
										<button class="secondary-button px-4 py-2" type="submit">Unsuspend</button>
									</form>
								{:else}
									<form
										method="POST"
										action="?/suspend"
										use:enhance={() => {
											return async ({ result }) => {
												if (result.type === 'success') {
													actionMessage = `Suspended ${user.email}.`;
													window.location.reload();
												}
											};
										}}
									>
										<input type="hidden" name="userId" value={user.id} />
										<button class="secondary-button px-4 py-2" type="submit">Suspend</button>
									</form>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section class="surface-panel overflow-hidden">
		<div class="border-b border-white/8 px-6 py-5">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
				Recent automation jobs
			</p>
			<h2 class="mt-2 text-xl font-semibold text-white">Background activity feed</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="data-table min-w-[720px]">
				<thead>
					<tr>
						<th>Type</th>
						<th>Status</th>
						<th>User</th>
						<th>When</th>
					</tr>
				</thead>
				<tbody>
					{#each data.recentJobs as job}
						<tr>
							<td class="capitalize">{job.jobType.replace('_', ' ')}</td>
							<td>
								<span
									class={job.status === 'success'
										? 'status-pill status-pill-emerald'
										: 'status-pill status-pill-rose'}>{job.status}</span
								>
							</td>
							<td>{job.userEmail ?? 'system'}</td>
							<td>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>
