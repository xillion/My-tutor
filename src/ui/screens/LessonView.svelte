<script lang="ts">
  import { app } from '../../app/state.svelte';
  import TopBar from '../components/TopBar.svelte';
  import RichText from '../components/RichText.svelte';
  import { assetUrl } from '../../core/packs/loader';
  import { touch } from '../../core/vocab/vocab';
  import { termKey } from '../../core/types';
  import { plainText } from '../../core/richtext/normalize';
  import { providers } from '../../core/providers';
  let { packId, lessonId }: { packId: string; lessonId: string } = $props();
  const pack = $derived(app.pack(packId));
  const lesson = $derived(pack.lessons.find((l) => l.id === lessonId)!);
  const term = (id: string) => pack.terms.find((t) => t.id === id)!;
  let done = $state(false);

  $effect(() => {
    // Opening a lesson puts its terms into the active vocabulary.
    for (const t of lesson.terms ?? []) touch(app.store, termKey(packId, t));
  });

  async function finish() {
    await app.store.setLesson({ key: `${packId}/${lessonId}`, done: true, at: Date.now() });
    done = true;
  }
  const play = (path?: string) => { const u = path && assetUrl(pack, path); if (u) new Audio(u).play(); };
</script>

<TopBar title={lesson.title} back={() => app.go({ name: 'pack', pack: packId })} />

<article class="stack">
  {#each lesson.blocks as b}
    {#if b.kind === 'heading'}<h2><RichText value={b.body} /></h2>
    {:else if b.kind === 'text'}<p><RichText value={b.body} /></p>
    {:else if b.kind === 'note'}<div class="card"><RichText value={b.body} /></div>
    {:else if b.kind === 'image'}<img src={assetUrl(pack, b.src)} alt="" style="max-width:100%;image-rendering:pixelated" />
    {:else if b.kind === 'audio'}<button class="btn secondary" onclick={() => play(b.src)}>🔊</button>
    {:else if b.kind === 'terms'}
      <div class="grid">
        {#each b.terms as id}
          {@const t = term(id)}
          <div class="card">
            <h3><RichText value={t.text} /></h3>
            {#if t.ipa}<div class="muted">[{t.ipa}]</div>{/if}
            <div><RichText value={t.meaning} /></div>
            {#if t.audio}<button class="btn secondary" onclick={() => play(t.audio)} aria-label="Звук">🔊</button>
            {:else if app.caps?.tts}<button class="btn secondary" onclick={() => providers.tts.speak(plainText(t.text), 'en')} aria-label="Озвучить">🔊</button>{/if}
          </div>
        {/each}
      </div>
    {/if}
  {/each}
</article>

<div class="row">
  <button class="btn" onclick={finish} disabled={done}>{done ? '✔ Пройдено' : 'Готово!'}</button>
  <button class="btn secondary" onclick={() => app.go({ name: 'pack', pack: packId })}>К разделам</button>
</div>
