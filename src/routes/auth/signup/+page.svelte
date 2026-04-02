<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>Sign Up - Free n8n</title>
  <meta name="description" content="Get your free n8n automation workspace" />
</svelte:head>

<div class="mx-auto max-w-md px-4 py-16">
  <h1 class="mb-8 text-2xl font-bold">Create your free n8n workspace</h1>

  <form method="POST" use:enhance class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        value={form?.email ?? ''}
        required
        class="mt-1 block w-full rounded-md border px-3 py-2"
      />
      {#if form?.errors?.email}<p class="mt-1 text-sm text-red-600">{form.errors.email[0]}</p>{/if}
    </div>
    <div>
      <label for="password" class="block text-sm font-medium">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        required
        minlength="8"
        class="mt-1 block w-full rounded-md border px-3 py-2"
      />
      {#if form?.errors && 'password' in form.errors && form.errors.password}<p class="mt-1 text-sm text-red-600">{form.errors.password[0]}</p>{/if}
    </div>
    <div>
      <label for="confirmPassword" class="block text-sm font-medium">Confirm Password</label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        required
        class="mt-1 block w-full rounded-md border px-3 py-2"
      />
      {#if form?.errors && 'confirmPassword' in form.errors && form.errors.confirmPassword}<p class="mt-1 text-sm text-red-600">{form.errors.confirmPassword[0]}</p>{/if}
    </div>
    <button type="submit" class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >Sign Up</button
    >
  </form>

  <p class="mt-4 text-center text-sm">
    Already have an account? <a href="/auth/login" class="text-blue-600 hover:underline">Log in</a>
  </p>
</div>
