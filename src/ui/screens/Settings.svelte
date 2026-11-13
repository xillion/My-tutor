<script lang="ts">
  import { app } from '../../app/state.svelte';
  import TopBar from '../components/TopBar.svelte';
  import { THEMES } from '../../themes/themes';
  const caps = $derived(app.caps);
</script>

<TopBar title="Настройки" back={() => app.go({ name: 'library' })} />

<section class="card stack">
  <h2>Оформление</h2>
  <div class="grid">
    {#each THEMES as t}
      <button class="card" onclick={() => app.setTheme({ ...app.theme, theme: t.id })}>
        <h3>{t.emoji} {t.name}{app.theme.theme === t.id ? ' ✔' : ''}</h3>
      </button>
    {/each}
  </div>
  <div class="row">
    <button class="btn" class:secondary={app.theme.mode !== 'light'}
      onclick={() => app.setTheme({ ...app.theme, mode: 'light' })}>☀ День</button>
    <button class="btn" class:secondary={app.theme.mode !== 'dark'}
      onclick={() => app.setTheme({ ...app.theme, mode: 'dark' })}>🌙 Ночь</button>
  </div>
</section>

<section class="card stack">
  <h2>Возможности</h2>
  {#if caps}
    <ul>
      <li>Озвучка (TTS): {caps.tts ? '✔' : '— недоступна (этап 1)'}</li>
      <li>ИИ-помощник: {caps.ai ? '✔' : '— не подключён (этап 2)'}</li>
      <li>Графический планшет: {caps.pen ? '✔' : '— этап 3'}</li>
      <li>Игры: {caps.game ? '✔' : '— этап 4'}</li>
    </ul>
  {/if}
</section>
