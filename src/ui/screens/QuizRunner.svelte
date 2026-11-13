<script lang="ts">
  import { app } from '../../app/state.svelte';
  import TopBar from '../components/TopBar.svelte';
  import RichText from '../components/RichText.svelte';
  import { checkChoice, checkInput, checkMatch, shuffle } from '../../core/quiz/check';
  import { review } from '../../core/vocab/vocab';
  import { termKey } from '../../core/types';
  let { packId, title, items, passRatio }: { packId: string; title: string; items: import('../../core/types').QuizItem[]; passRatio?: number } = $props();

  let i = $state(0);
  let score = $state(0);
  let verdict = $state<null | boolean>(null);
  let text = $state('');
  let picked = $state<number | null>(null);
  let made = $state<Array<[string, string]>>([]);
  let left = $state<string | null>(null);

  const item = $derived(items[i]);
  const finished = $derived(i >= items.length);
  const rights = $derived(item?.kind === 'match' ? shuffle((item.pairs ?? []).map((p) => p[1])) : []);

  async function submit(ok: boolean) {
    verdict = ok;
    if (ok) score++;
    for (const t of item.terms ?? []) await review(app.store, termKey(packId, t), ok);
  }
  function next() { i++; verdict = null; text = ''; picked = null; made = []; left = null; }
  function pickRight(r: string) {
    if (!left) return;
    made = [...made.filter((m) => m[0] !== left && m[1] !== r), [left, r]];
    left = null;
    if (made.length === item.pairs!.length) submit(checkMatch(item, made));
  }
  const pct = $derived(Math.round((score / Math.max(items.length, 1)) * 100));
  const passed = $derived(passRatio === undefined || score / items.length >= passRatio);
</script>

<TopBar title={title} back={() => app.go({ name: 'pack', pack: packId })} />

{#if finished}
  <div class="card stack">
    <h2>{passed ? '🎉 Отлично!' : 'Попробуй ещё раз'}</h2>
    <p>Правильно: {score} из {items.length} ({pct}%)</p>
    {#if passRatio !== undefined}<p class="muted">Нужно: {Math.round(passRatio * 100)}%</p>{/if}
    <button class="btn" onclick={() => app.go({ name: 'pack', pack: packId })}>Готово</button>
  </div>
{:else}
  <div class="progress" aria-label="Прогресс"><div style="width:{(i / items.length) * 100}%"></div></div>
  <div class="card stack">
    <h2><RichText value={item.prompt} /></h2>

    {#if item.kind === 'choice'}
      <div class="stack">
        {#each item.options ?? [] as o, k}
          <button class="btn secondary" class:selected={picked === k} disabled={verdict !== null}
            class:ok={verdict !== null && item.answer === k} class:bad={verdict === false && picked === k}
            onclick={() => { picked = k; submit(checkChoice(item, k)); }}><RichText value={o} /></button>
        {/each}
      </div>
    {:else if item.kind === 'input'}
      <input type="text" bind:value={text} disabled={verdict !== null} autocomplete="off" autocapitalize="off"
        onkeydown={(e) => e.key === 'Enter' && verdict === null && submit(checkInput(item, text))} />
      {#if verdict === null}<button class="btn" onclick={() => submit(checkInput(item, text))}>Проверить</button>{/if}
    {:else if item.kind === 'match'}
      <div class="row" style="align-items:flex-start">
        <div class="stack" style="flex:1">
          {#each item.pairs ?? [] as [l]}
            <button class="btn secondary" class:selected={left === l} disabled={verdict !== null}
              onclick={() => (left = l)}>{l}{made.find((m) => m[0] === l) ? ' → ' + made.find((m) => m[0] === l)![1] : ''}</button>
          {/each}
        </div>
        <div class="stack" style="flex:1">
          {#each rights as r}
            <button class="btn secondary" disabled={verdict !== null || !left} onclick={() => pickRight(r)}>{r}</button>
          {/each}
        </div>
      </div>
    {/if}

    {#if verdict !== null}
      <div class="warn" style="background:{verdict ? 'var(--ok)' : 'var(--bad)'}" role="status">
        {verdict ? '✔ Верно!' : '✘ Не совсем.'}
        {#if item.explain} <RichText value={item.explain} />{/if}
        {#if !verdict && item.kind === 'input'} Ответ: {Array.isArray(item.answer) ? item.answer[0] : item.answer}{/if}
      </div>
      <button class="btn" onclick={next}>Дальше ▶</button>
    {/if}
  </div>
{/if}
