<script lang="ts">
  import { app } from '../../app/state.svelte';
  import TopBar from '../components/TopBar.svelte';
  import RichText from '../components/RichText.svelte';
  import { mastery, type Mastery } from '../../core/vocab/vocab';
  import { termKey } from '../../core/types';
  import type { TermStats } from '../../core/storage';
  let { packId }: { packId: string } = $props();
  const pack = $derived(app.pack(packId));
  let stats = $state<Record<string, TermStats>>({});
  $effect(() => {
    app.store.allStats(`${packId}/`).then((all) => (stats = Object.fromEntries(all.map((s) => [s.key, s]))));
  });
  const label: Record<Mastery, string> = { new: 'новое', learning: 'учу', known: 'знаю' };
  const rows = $derived(pack.terms.map((t) => ({ t, s: stats[termKey(packId, t.id)] })));
  const active = $derived(rows.filter((r) => r.s));
  const known = $derived(rows.filter((r) => mastery(r.s) === 'known').length);
</script>

<TopBar title="Словарь" back={() => app.go({ name: 'pack', pack: packId })} />

<div class="card stack">
  <div>В активном словаре: <b>{active.length}</b> из {rows.length} · знаю: <b>{known}</b></div>
  <div class="progress"><div style="width:{(known / Math.max(rows.length, 1)) * 100}%"></div></div>
</div>

<div class="stack">
  {#each rows as { t, s }}
    {@const m = mastery(s)}
    <div class="card row" style="justify-content:space-between">
      <div>
        <h3><RichText value={t.text} /></h3>
        <div class="muted"><RichText value={t.meaning} /></div>
      </div>
      <div class="stack" style="align-items:flex-end">
        <span class="badge {m}">{label[m]}</span>
        {#if s}<span class="muted">✔ {s.correct} · ✘ {s.wrong}</span>{/if}
      </div>
    </div>
  {/each}
</div>
