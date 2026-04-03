<script lang="ts">
	import { enhance } from '$app/forms';
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
			isVerified: boolean;
			backupCount: number;
			usage: UsageSummary;
			sandboxHealth: 'active' | 'attention' | 'archived' | 'suspended';
		}>;
	}

	let { data }: { data: AdminData } = $props();
	let actionMessage = $state('');

	function statusClasses(status: UserStatus): string {
		const tone = getStatusTone(status);
		if (tone === 'emerald') return 'status-pill status-pill-emerald';
		if (tone === 'amber') return 'status-pill status-pill-amber';
		return 'status-pill status-pill-rose';
	}
</script>

<svelte:head>
	<title>Admin | Free n8n</title>
</svelte:head>

<div class="page-wrap space-y-6">
	<section class="surface-panel-strong mx-auto max-w-5xl p-6 sm:p-8">
		<p class="text-sm text-slate-400">{data.admin.email}</p>
		<h1 class="mt-2 text-3xl font-semibold text-white">Admin</h1>

		<div class="mt-6 grid gap-4 sm:grid-cols-4">
			<div class="metric-card p-4">
				<p class="text-sm text-slate-400">Users</p>
				<p class="mt-2 text-2xl font-semibold text-white">{data.stats.totalUsers}</p>
			</div>
			<div class="metric-card p-4">
				<p class="text-sm text-slate-400">Active</p>
				<p class="mt-2 text-2xl font-semibold text-white">{data.stats.activeUsers}</p>
			</div>
			<div class="metric-card p-4">
				<p class="text-sm text-slate-400">Archived</p>
				<p class="mt-2 text-2xl font-semibold text-white">{data.stats.reclaimedUsers}</p>
			</div>
			<div class="metric-card p-4">
				<p class="text-sm text-slate-400">Suspended</p>
				<p class="mt-2 text-2xl font-semibold text-white">{data.stats.suspendedUsers}</p>
			</div>
		</div>

		{#if actionMessage}
			<p class="mt-4 text-sm text-emerald-200">{actionMessage}</p>
		{/if}
	</section>

	<section class="surface-panel mx-auto max-w-5xl overflow-hidden">
		<div class="border-b border-white/8 px-6 py-4">
			<h2 class="text-lg font-semibold text-white">Users</h2>
		</div>
		<div class="overflow-x-auto">
			<table class="data-table min-w-[760px]">
				<thead>
					<tr>
						<th>Email</th>
						<th>Status</th>
						<th>Usage</th>
						<th>Backups</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user}
						<tr>
							<td>
								<p class="font-medium text-white">{user.email}</p>
								{#if !user.isVerified}
									<p class="text-xs text-amber-200">Awaiting verification</p>
								{/if}
							</td>
							<td>
								<div class={statusClasses(user.status)}>{getStatusLabel(user.status)}</div>
							</td>
							<td
								>{user.usage.activeWorkflowCount} workflows · {user.usage.executionsToday} today</td
							>
							<td>{user.backupCount}</td>
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
</div>
