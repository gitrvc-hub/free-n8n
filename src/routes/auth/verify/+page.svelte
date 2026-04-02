<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Verify Email - Free n8n</title></svelte:head>

<div class="mx-auto max-w-md px-4 py-16 text-center">
  {#if data.status === 'sent'}
    <h1 class="mb-4 text-2xl font-bold">Check your email</h1>
    <p>We sent a verification link to your email. Click it to activate your account.</p>
  {:else if data.status === 'verified'}
    <h1 class="mb-4 text-2xl font-bold">Email verified!</h1>
    <p class="mb-4">Your n8n workspace is ready.</p>
    <a href="/auth/login" class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >Log in</a
    >
  {:else}
    <h1 class="mb-4 text-2xl font-bold">Invalid or expired link</h1>
    <p>This verification link is invalid or has expired.</p>
    <a href="/auth/signup" class="mt-4 inline-block text-blue-600 hover:underline">Sign up</a>
  {/if}
</div>
