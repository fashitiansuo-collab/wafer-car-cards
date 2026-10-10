<script lang="ts">
  // Line icons drawn in the Phosphor Light weight (1.5px at 24px).
  let { name, size = '2.4rem' }: { name: 'wafer' | 'garage' | 'records' | 'mark'; size?: string } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
  {#if name === 'wafer'}
    <rect x="4" y="6" width="16" height="12" />
    <path d="M4 10h16M4 14h16M8 6v12M12 6v12M16 6v12" stroke-width=".9" />
  {:else if name === 'garage'}
    <rect x="4" y="4" width="7" height="9" />
    <rect x="13" y="4" width="7" height="9" />
    <rect x="4" y="15" width="7" height="5" />
    <rect x="13" y="15" width="7" height="5" />
  {:else if name === 'records'}
    <path d="M5 6h14M5 10h14M5 14h9M5 18h6" />
  {:else}
    <rect x="3.5" y="3.5" width="17" height="17" />
    <path d="M3.5 9.2h17M3.5 14.8h17M9.2 3.5v17M14.8 3.5v17" stroke-width=".8" />
  {/if}
</svg>
