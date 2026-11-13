<script lang="ts">
  import { app } from '../../app/state.svelte';
  let { title, back }: { title: string; back?: () => void } = $props();
</script>

<div class="topbar">
  {#if back}<button class="btn secondary" onclick={back} aria-label="Назад">◀</button>{/if}
  <h1 class="grow">{title}</h1>
  <button class="btn secondary" onclick={() => app.go({ name: 'settings' })} aria-label="Настройки">⚙</button>
</div>
