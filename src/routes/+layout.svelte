<script lang="ts">
	import '../app.css';
	let { children }: { data: unknown; children: import('svelte').Snippet } = $props();
</script>

<div class="relative min-h-screen overflow-x-hidden">
	<div class="pointer-events-none absolute inset-x-0 top-0 h-[32rem] shell-grid"></div>
	<div
		class="pointer-events-none absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
	></div>

	<main class="relative z-10 pb-20 pt-8 sm:pt-10">
		{@render children()}
	</main>
</div>
