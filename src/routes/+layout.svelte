<script lang="ts">
  import '../app.css';
  import type { LayoutData } from './$types';
  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<div class="min-h-screen bg-white">
  <nav class="border-b px-4 py-3">
    <div class="mx-auto flex max-w-5xl items-center justify-between">
      <a href="/" class="text-lg font-bold">Free n8n</a>
      <div class="flex items-center gap-4">
        {#if data.session?.user}
          <a href="/dashboard" class="text-sm hover:underline">Dashboard</a>
          <form method="POST" action="/auth/login?/signout">
            <button type="submit" class="text-sm text-gray-600 hover:underline">Log out</button>
          </form>
        {:else}
          <a href="/auth/login" class="text-sm hover:underline">Log in</a>
          <a href="/auth/signup" class="rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700">Sign up free</a>
        {/if}
      </div>
    </div>
  </nav>
  {@render children()}
</div>
