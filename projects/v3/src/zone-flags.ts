/**
 * Prevents Angular change detection from
 * running with certain Web Component callbacks
 */
(window as any).__Zone_disable_customElements = true;

// disable patching requestAnimationFrame
(window as any).__Zone_disable_requestAnimationFrame = true;

// disable patching specified eventNames
(window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove'];
