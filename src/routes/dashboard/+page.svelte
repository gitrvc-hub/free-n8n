<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import { getStatusLabel, getStatusTone } from '$lib/ui';
	import type { UserStatus } from '@prisma/client';
	import type { PlanUsageCard } from '$lib/server/usage';

	interface DashboardData {
		user: {
			id: string;
			email: string;
			status: UserStatus;
			lastActiveAt: string | null;
			hasBackup: boolean;
			createdAt: string;
			sandboxHealth: 'active' | 'attention' | 'archived' | 'suspended';
		};
		plan: {
			workflowLimit: number;
			executionLimitPerDay: number;
			reclaimDays: number;
		};
		usage: {
			activeWorkflowCount: number;
			executionsToday: number;
			lastExecutionAt: string | null;
			cards: PlanUsageCard[];
		};
		backup: {
			id: string;
			createdAt: string;
			sizeBytes: number;
		} | null;
		limitReached: boolean;
	}

	let { data }: { data: DashboardData } = $props();
	let restoring = $state(false);
	let restoreError = $state('');

	function statusClasses(tone: string): string {
		if (tone === 'emerald') return 'status-pill status-pill-emerald';
		if (tone === 'amber') return 'status-pill status-pill-amber';
		return 'status-pill status-pill-rose';
	}

	async function restoreSandbox() {
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

<svelte:head>
	<title>Sandbox | Free n8n</title>
</svelte:head>

<div class="page-wrap space-y-6">
	<section class="surface-panel-strong mx-auto max-w-4xl p-6 sm:p-8">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="text-sm text-slate-400">{data.user.email}</p>
				<h1 class="mt-2 text-3xl font-semibold text-white">Sandbox</h1>
			</div>
			<div class={statusClasses(getStatusTone(data.user.status))}>{getStatusLabel(data.user.status)}</div>
		</div>

		<div class="mt-6 grid gap-4 sm:grid-cols-3">
			<div class="metric-card p-4">
				<p class="text-sm text-slate-400">Status</p>
				<p class="mt-2 text-lg font-semibold capitalize text-white">{data.user.sandboxHealth}</p>
			</div>
			<div class="metric-card p-4">
				<p class="text-sm text-slate-400">Workflows</p>
				<p class="mt-2 text-lg font-semibold text-white">{data.usage.activeWorkflowCount}/{data.plan.workflowLimit}</p>
			</div>
			<div class="metric-card p-4">
				<p class="text-sm text-slate-400">Executions today</p>
				<p class="mt-2 text-lg font-semibold text-white">{data.usage.executionsToday}/{data.plan.executionLimitPerDay}</p>
			</div>
		</div>

		{#if data.limitReached}
			<div class="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
				Sandbox limit reached. Lower usage or wait for the daily reset.
			</div>
		{/if}

		<div class="mt-6 space-y-3">
			{#if data.user.status === 'active'}
				<a href="/api/n8n/session" class="primary-button w-full sm:w-auto">Open editor</a>
			{:else if data.user.status === 'reclaimed'}
				<button onclick={restoreSandbox} disabled={restoring} class="primary-button w-full sm:w-auto">
					{restoring ? 'Restoring...' : 'Restore sandbox'}
				</button>
				{#if restoreError}
					<p class="text-sm text-rose-200">{restoreError}</p>
				{/if}
			{:else}
				<p class="text-sm text-rose-200">Sandbox suspended.</p>
			{/if}
		</div>

		<div class="mt-6 text-sm text-slate-400">
			{#if data.user.lastActiveAt}
				Last activity {formatDistanceToNow(new Date(data.user.lastActiveAt), { addSuffix: true })}
			{:else}
				No activity yet
			{/if}
			. Archive after {data.plan.reclaimDays} days inactive.
		</div>
	</section>
</div>
