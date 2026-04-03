<script lang="ts">
	import { FREE_PLAN_LIMITS } from '$lib/plan';

	const pillars = [
		{
			title: 'Shared but fast',
			copy: 'You get a ready-to-use n8n sandbox without managing infrastructure, upgrades, or queue workers.'
		},
		{
			title: 'Restore instead of restart',
			copy: 'Inactive sandboxes are archived to object storage, so you can come back and restore instead of rebuilding practice flows from scratch.'
		},
		{
			title: 'Built for learning',
			copy: 'Use it to learn the editor, explore triggers and nodes, test lightweight ideas, and practice building flows before moving to your own deployment.'
		}
	];

	const limits = [
		{
			value: `${FREE_PLAN_LIMITS.workflowLimit}`,
			label: 'active workflows',
			copy: 'Enough room for tutorials, experiments, and lightweight practice automations.'
		},
		{
			value: `${FREE_PLAN_LIMITS.executionLimitPerDay}`,
			label: 'executions per day',
			copy: 'Daily usage resets automatically to keep the shared environment stable.'
		},
		{
			value: `${FREE_PLAN_LIMITS.reclaimDays}d`,
			label: 'before archive',
			copy: 'Idle sandboxes are backed up and reclaimed to keep capacity open for new learners.'
		}
	];

	const steps = [
		'Create your account with an email address only.',
		'Verify your inbox and receive your sandbox credentials.',
		'Open n8n from the dashboard with one click SSO.',
		'Restore later if your sandbox gets archived for inactivity.'
	];
</script>

<svelte:head>
	<title>Free n8n | Practice sandbox for learning automation</title>
	<meta
		name="description"
		content="Practice n8n for free in a shared sandbox, learn the editor quickly, and restore archived flows when you come back."
	/>
	<meta property="og:title" content="Free n8n | Practice sandbox for learning automation" />
	<meta
		property="og:description"
		content="A shared n8n sandbox built for practice, tutorials, and lightweight experiments."
	/>
</svelte:head>

<div class="page-wrap space-y-16 sm:space-y-24">
	<section class="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-14">
		<div class="space-y-7">
			<div class="eyebrow">Shared n8n sandbox for practice</div>
			<div class="space-y-5">
				<h1 class="hero-title">Practice n8n without running your own stack.</h1>
				<p class="hero-copy max-w-2xl">
					Free n8n gives you a shared practice sandbox with email verification, one-click SSO,
					automatic inactivity archiving, and restore flows built in. It is optimized for learning
					the editor, testing small ideas, and getting comfortable with how n8n works.
				</p>
			</div>
			<div class="flex flex-col gap-3 sm:flex-row">
				<a href="/auth/signup" class="primary-button">Start practicing</a>
				<a href="/auth/login" class="secondary-button">I already have access</a>
			</div>
			<div class="grid gap-3 sm:grid-cols-3">
				{#each limits as limit}
					<div class="metric-card">
						<p class="text-3xl font-semibold tracking-tight text-white">{limit.value}</p>
						<p class="mt-1 text-sm font-medium text-slate-200">{limit.label}</p>
						<p class="mt-2 text-sm leading-6 text-slate-400">{limit.copy}</p>
					</div>
				{/each}
			</div>
		</div>

		<div class="surface-panel-strong overflow-hidden p-6 sm:p-8">
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/80">
						Sandbox lifecycle
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-white">
						A learning environment with clear guardrails.
					</h2>
				</div>
				<div class="status-pill status-pill-emerald">Live capacity</div>
			</div>

			<div class="mt-8 space-y-4">
				{#each steps as step, index}
					<div class="flex gap-4 rounded-3xl border border-white/8 bg-white/[0.03] px-4 py-4">
						<div
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-sm font-semibold text-white"
						>
							0{index + 1}
						</div>
						<p class="pt-1 text-sm leading-6 text-slate-300">{step}</p>
					</div>
				{/each}
			</div>

			<div class="mt-8 rounded-3xl border border-amber-400/15 bg-amber-400/8 p-5">
				<p class="text-sm font-semibold uppercase tracking-[0.18em] text-amber-100">Important</p>
				<p class="mt-2 text-sm leading-6 text-amber-50/90">
					This is a shared practice environment. Heavy production workloads belong on your own n8n
					deployment. Free n8n is for learning, testing, and getting familiar with the product.
				</p>
			</div>
		</div>
	</section>

	<section class="grid gap-6 lg:grid-cols-3">
		{#each pillars as pillar}
			<div class="surface-panel p-6 sm:p-7">
				<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
					Why it exists
				</p>
				<h2 class="mt-3 text-2xl font-semibold text-white">{pillar.title}</h2>
				<p class="mt-4 text-sm leading-7 text-slate-300">{pillar.copy}</p>
			</div>
		{/each}
	</section>

	<section class="surface-panel-strong grid gap-10 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
		<div>
			<div class="eyebrow">What you get</div>
			<h2 class="section-title mt-5">
				A cleaner practice flow around n8n, not just a signup form.
			</h2>
			<p class="section-copy mt-4 max-w-xl">
				The product experience is built around learning lifecycle visibility: account creation,
				verification, active sandbox usage, archive recovery, and operations oversight.
			</p>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<div class="metric-card">
				<p class="text-sm font-medium text-slate-400">Authentication</p>
				<p class="mt-2 text-lg font-semibold text-white">Email verification + sandbox SSO</p>
				<p class="mt-3 text-sm leading-6 text-slate-400">
					Users receive credentials once and enter n8n from the platform without a second login
					flow.
				</p>
			</div>
			<div class="metric-card">
				<p class="text-sm font-medium text-slate-400">Archive recovery</p>
				<p class="mt-2 text-lg font-semibold text-white">Backups before reclaim</p>
				<p class="mt-3 text-sm leading-6 text-slate-400">
					Inactive sandboxes are archived to object storage and can be restored from the dashboard.
				</p>
			</div>
			<div class="metric-card">
				<p class="text-sm font-medium text-slate-400">Operations view</p>
				<p class="mt-2 text-lg font-semibold text-white">
					Admin visibility into adoption and health
				</p>
				<p class="mt-3 text-sm leading-6 text-slate-400">
					Track signups, archived accounts, backup footprint, recent jobs, and users nearing limits.
				</p>
			</div>
			<div class="metric-card">
				<p class="text-sm font-medium text-slate-400">Usage guardrails</p>
				<p class="mt-2 text-lg font-semibold text-white">Limits reflected in the product</p>
				<p class="mt-3 text-sm leading-6 text-slate-400">
					The dashboard exposes workflow and execution usage so sandbox limits are explicit instead
					of implied.
				</p>
			</div>
		</div>
	</section>

	<section
		class="surface-panel flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
	>
		<div>
			<p class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
				Ready to learn n8n hands-on?
			</p>
			<h2 class="mt-2 text-2xl font-semibold text-white">
				Create your sandbox and start practicing in minutes.
			</h2>
		</div>
		<div class="flex flex-col gap-3 sm:flex-row">
			<a href="/auth/signup" class="primary-button">Get started free</a>
			<a href="/auth/login" class="secondary-button">Open my sandbox</a>
		</div>
	</section>
</div>
