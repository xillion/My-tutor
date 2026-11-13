<script lang="ts">
  import { app } from '../../app/state.svelte';
  import TopBar from '../components/TopBar.svelte';
  let input: HTMLInputElement;
  const icon: Record<string, string> = { english: '🔤', math: '➗' };
  async function pick(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) await app.importFile(f);
    (e.target as HTMLInputElement).value = '';
  }
</script>

<TopBar title="Мой учитель" />
<div class="grid">
  {#each app.packs as p}
    <button class="card" onclick={() => app.go({ name: 'pack', pack: p.manifest.id })}>
      <h2>{icon[p.manifest.subject] ?? '📘'} {p.manifest.title}</h2>
      <p class="muted">{p.manifest.description ?? ''}</p>
      <span class="badge">{p.terms.length} слов/терминов</span>
    </button>
  {/each}
</div>
<div class="row">
  <button class="btn secondary" onclick={() => input.click()}>＋ Добавить пак (.zip)</button>
  <input bind:this={input} type="file" accept=".zip" hidden onchange={pick} />
</div>
