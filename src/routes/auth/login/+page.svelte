<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      error = 'Invalid email or password';
      loading = false;
    } else {
      window.location.href = '/dashboard';
    }
  }
</script>

<svelte:head><title>Log In - Free n8n</title></svelte:head>

<div class="mx-auto max-w-md px-4 py-16">
  <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
    <h1 class="mb-8 text-2xl font-bold text-white">Log in to your n8n workspace</h1>
    <form onsubmit={handleSubmit} class="space-y-5">
      {#if error}
        <div class="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
      {/if}
      <div>
        <label for="email" class="block text-sm font-medium text-slate-300">Email</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          required
          class="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-slate-300">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          required
          class="mt-1 block w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        class="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-white font-medium shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-colors"
      >{loading ? 'Logging in...' : 'Log In'}</button>
    </form>
    <p class="mt-6 text-center text-sm text-slate-400">
      Don't have an account? <a href="/auth/signup" class="text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</a>
    </p>
  </div>
</div>
