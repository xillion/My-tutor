<script lang="ts">
  import { app } from './app/state.svelte';
  import Library from './ui/screens/Library.svelte';
  import PackHome from './ui/screens/PackHome.svelte';
  import LessonView from './ui/screens/LessonView.svelte';
  import QuizRunner from './ui/screens/QuizRunner.svelte';
  import Vocabulary from './ui/screens/Vocabulary.svelte';
  import Settings from './ui/screens/Settings.svelte';

  app.init();
</script>

<div class="shell">
  {#if !app.ready}
    <p class="muted">Загрузка…</p>
  {:else}
    {#if app.error}<div class="warn" role="alert">{app.error}</div>{/if}
    {#if app.view.name === 'library'}<Library />
    {:else if app.view.name === 'pack'}<PackHome packId={app.view.pack} />
    {:else if app.view.name === 'lesson'}<LessonView packId={app.view.pack} lessonId={app.view.lesson} />
    {:else if app.view.name === 'quiz'}
      {#key app.view}<QuizRunner packId={app.view.pack} title={app.view.title} items={app.view.items} passRatio={app.view.passRatio} />{/key}
    {:else if app.view.name === 'vocab'}<Vocabulary packId={app.view.pack} />
    {:else if app.view.name === 'settings'}<Settings />
    {/if}
  {/if}
</div>
