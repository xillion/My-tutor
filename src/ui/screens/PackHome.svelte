<script lang="ts">
  import { app } from '../../app/state.svelte';
  import TopBar from '../components/TopBar.svelte';
  import { shuffle } from '../../core/quiz/check';
  import { dueTerms } from '../../core/vocab/vocab';
  import type { QuizItem } from '../../core/types';
  let { packId }: { packId: string } = $props();
  const pack = $derived(app.pack(packId));
  const lessonTitle = (id: string) => pack.lessons.find((l) => l.id === id)?.title ?? id;

  const quizOf = (ids: string[]) => ids.map((i) => pack.quiz.find((q) => q.id === i)).filter(Boolean) as QuizItem[];
  const start = (title: string, items: QuizItem[], passRatio?: number) =>
    items.length && app.go({ name: 'quiz', pack: packId, title, items: shuffle(items), passRatio });

  async function review() {
    const due = new Set((await dueTerms(app.store, `${packId}/`)).map((k) => k.slice(packId.length + 1)));
    const items = pack.quiz.filter((q) => q.terms?.some((t) => due.has(t)));
    start('Повторение', items.length ? items : pack.quiz);
  }
</script>

<TopBar title={pack.manifest.title} back={() => app.go({ name: 'library' })} />

{#each pack.manifest.sections ?? [] as sec}
  <section class="card stack">
    <h2>{sec.title}</h2>
    <div class="row">
      {#each sec.lessons ?? [] as l}
        <button class="btn" onclick={() => app.go({ name: 'lesson', pack: packId, lesson: l })}>📖 {lessonTitle(l)}</button>
      {/each}
      <button class="btn secondary" onclick={() => start(sec.title, pack.quiz.filter((q) => q.section === sec.id))}>✏️ Упражнения</button>
    </div>
  </section>
{/each}

<section class="card stack">
  <h2>Практика и проверка</h2>
  <div class="row">
    <button class="btn" onclick={() => app.go({ name: 'vocab', pack: packId })}>📚 Словарь</button>
    <button class="btn secondary" onclick={review}>🔁 Повторить</button>
    {#if pack.minorExam}
      {@const e = pack.minorExam}
      <button class="btn secondary" onclick={() => start(e.title, quizOf(e.items), e.pass_ratio)}>📝 {e.title}</button>
    {/if}
    {#if pack.majorExam}
      {@const e = pack.majorExam}
      <button class="btn secondary" onclick={() => start(e.title, quizOf(e.items), e.pass_ratio)}>🏆 {e.title}</button>
    {/if}
  </div>
</section>
