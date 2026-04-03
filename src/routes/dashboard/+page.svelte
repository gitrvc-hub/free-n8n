<script lang="ts">
	import { format, formatDistanceToNow } from 'date-fns';
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

<div class="page-wrap space-y-8">
	<section class="surface-panel-strong grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
		<div class="space-y-6">
			<div class="flex flex-wrap items-center gap-3">
				<div class="eyebrow">Sandbox control room</div>
				<div class={statusClasses(getStatusTone(data.user.status))}>
					{getStatusLabel(data.user.status)}
				</div>
			</div>

			<div>
				<h1 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
					{data.user.email}
				</h1>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
					Monitor practice limits, open the n8n editor, and recover archived sandboxes without
					leaving the platform.
				</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-3">
				<div class="metric-card p-5">
					<p class="text-sm font-medium text-slate-400">Sandbox health</p>
					<p class="mt-2 text-xl font-semibold capitalize text-white">
						{data.user.sandboxHealth}
					</p>
				</div>
				<div class="metric-card p-5">
					<p class="text-sm font-medium text-slate-400">Last activity</p>
					<p class="mt-2 text-xl font-semibold text-white">
						{#if data.user.lastActiveAt}
							{formatDistanceToNow(new Date(data.user.lastActiveAt), { addSuffix: true })}
						{:else}
							No activity yet
						{/if}
					</p>
				</div>
				<div class="metric-card p-5">
					<p class="text-sm font-medium text-slate-400">Archive policy</p>
					<p class="mt-2 text-xl font-semibold text-white">
						{data.plan.reclaimDays} day inactivity window
					</p>
				</div>
			</div>

			{#if data.limitReached}
				<div
					class="rounded-[28px] border border-amber-400/20 bg-amber-400/10 px-5 py-4 text-sm leading-6 text-amber-50"
				>
					Your sandbox hit a practice limit. Reduce active workflows or wait for the daily execution
					counter to reset before opening n8n again.
				</div>
			{/if}
		</div>

		<div class="surface-panel p-5 sm:p-6">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
				Sandbox actions
			</p>
			<div class="mt-5 space-y-4">
				{#if data.user.status === 'active'}
					<a href="/api/n8n/session" class="primary-button w-full">Open practice editor</a>
					<p class="text-sm leading-6 text-slate-400">
						You will be signed into the shared n8n instance automatically. No second password
						prompt.
					</p>
				{:else if data.user.status === 'reclaimed'}
					<button onclick={restoreSandbox} disabled={restoring} class="primary-button w-full">
						{restoring ? 'Restoring sandbox...' : 'Restore archived sandbox'}
					</button>
					{#if restoreError}
						<p
							class="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
						>
							{restoreError}
						</p>
					{/if}
					<p class="text-sm leading-6 text-slate-400">
						Your latest backup will be pulled from object storage and imported back into n8n so you
						can keep practicing where you left off.
					</p>
				{:else}
					<div
						class="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100"
					>
						This sandbox is suspended. Contact support before opening n8n again.
					</div>
				{/if}
			</div>

			<div class="mt-6 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
				<p class="text-sm font-medium text-white">Latest backup</p>
				{#if data.backup}
					<p class="mt-2 text-sm text-slate-300">
						Created {format(new Date(data.backup.createdAt), 'MMM d, yyyy h:mm a')}
					</p>
					<p class="mt-1 text-sm text-slate-400">
						{Math.round(data.backup.sizeBytes / 1024)} KB stored in archive.
					</p>
				{:else}
					<p class="mt-2 text-sm text-slate-400">No archived backup exists yet for this sandbox.</p>
				{/if}
			</div>
		</div>
	</section>

	<section class="grid gap-4 lg:grid-cols-2">
		{#each data.usage.cards as card}
			<div class="surface-panel p-5 sm:p-6">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-sm font-medium text-slate-400">{card.label}</p>
						<p class="mt-2 text-3xl font-semibold tracking-tight text-white">
							{card.used}<span class="text-lg text-slate-500">/{card.limit}</span>
						</p>
					</div>
					<div
						class={card.status === 'healthy'
							? 'status-pill status-pill-emerald'
							: card.status === 'warning'
								? 'status-pill status-pill-amber'
								: 'status-pill status-pill-rose'}
					>
						{card.status}
					</div>
				</div>

				<div class="mt-5 progress-track">
					<div class="progress-fill" style={`width: ${Math.max(card.percent, 6)}%`}></div>
				</div>

				<div class="mt-4 flex items-center justify-between text-sm text-slate-400">
					<span>{card.remaining} remaining</span>
					<span>{card.percent}% used</span>
				</div>

				<p class="mt-4 text-sm leading-6 text-slate-300">{card.helpText}</p>
			</div>
		{/each}
	</section>

	<section class="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
		<div class="surface-panel p-6 sm:p-7">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Usage notes</p>
			<div class="mt-5 space-y-4 text-sm leading-7 text-slate-300">
				<p>
					Daily executions reset every 24 hours. Workflow count is based on active workflows
					currently attached to your user in n8n.
				</p>
				<p>
					If you stop using the sandbox for {data.plan.reclaimDays} days, it will be archived automatically
					so another learner can take that capacity.
				</p>
			</div>
		</div>

		<div class="surface-panel p-6 sm:p-7">
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
				Account timeline
			</p>
			<div class="mt-5 space-y-4 text-sm leading-6 text-slate-300">
				<div>
					<p class="text-slate-500">Joined</p>
					<p class="mt-1 text-white">{format(new Date(data.user.createdAt), 'MMM d, yyyy')}</p>
				</div>
				<div>
					<p class="text-slate-500">Last execution seen</p>
					<p class="mt-1 text-white">
						{#if data.usage.lastExecutionAt}
							{format(new Date(data.usage.lastExecutionAt), 'MMM d, yyyy h:mm a')}
						{:else}
							No execution history yet
						{/if}
					</p>
				</div>
			</div>
		</div>
	</section>
</div>
