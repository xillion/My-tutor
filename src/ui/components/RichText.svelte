<script lang="ts">
  import type { RichText } from '../../core/types';
  import { toSegments, fxToClasses } from '../../core/richtext/normalize';
  let { value }: { value: RichText | undefined } = $props();
  const segs = $derived(toSegments(value));
</script>

<span class="rt">{#each segs as s}<span lang={s.lang} class={fxToClasses(s.fx)} class:term={!!s.term}>{s.t}</span>{/each}</span>
