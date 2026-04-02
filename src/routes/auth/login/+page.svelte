<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<svelte:head><title>Log In - Free n8n</title></svelte:head>

<div class="mx-auto max-w-md px-4 py-16">
  <h1 class="mb-8 text-2xl font-bold">Log in to your n8n workspace</h1>
  <form method="POST" use:enhance class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        required
        class="mt-1 block w-full rounded-md border px-3 py-2"
      />
    </div>
    <div>
      <label for="password" class="block text-sm font-medium">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        required
        class="mt-1 block w-full rounded-md border px-3 py-2"
      />
    </div>
    <button
      type="submit"
      class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Log In</button
    >
  </form>
  <p class="mt-4 text-center text-sm">
    Don't have an account? <a href="/auth/signup" class="text-blue-600 hover:underline">Sign up</a>
  </p>
</div>
