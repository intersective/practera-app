import { defineCustomElements } from '@ionic/core/loader';

describe('Ionic ARIA attribute initialization', () => {
  let button: HTMLIonButtonElement;

  beforeAll(async () => {
    defineCustomElements(window);
    await customElements.whenDefined('ion-button');
  });

  afterEach(async () => {
    if (button) {
      await button.componentOnReady();
      button.remove();
    }
  });

  function captureErrors(writeAttributes: () => void): unknown[] {
    const errors: unknown[] = [];
    // Native custom-element callback exceptions are reported as window errors.
    // Collect them for the assertion rather than aborting the entire test runner.
    const listener = (event: ErrorEvent) => {
      errors.push(event.error ?? event.message);
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    window.addEventListener('error', listener, true);
    try {
      writeAttributes();
    } finally {
      window.removeEventListener('error', listener, true);
    }
    return errors;
  }

  it('accepts ARIA updates before hydration and forwards the latest values to the native button', async () => {
    button = document.createElement('ion-button');
    button.setAttribute('aria-label', 'Original label');
    document.body.appendChild(button);
    const errors = captureErrors(() => {
      button.setAttribute('aria-label', 'Latest label');
      button.setAttribute('aria-checked', 'true');
      button.setAttribute('aria-pressed', 'true');
    });
    expect(errors).withContext('pre-hydration ARIA changes must not invoke an uninitialized watcher').toEqual([]);

    await button.componentOnReady();
    const nativeButton = button.shadowRoot.querySelector('button');
    expect(nativeButton.getAttribute('aria-label')).toBe('Latest label');
    expect(nativeButton.getAttribute('aria-checked')).toBe('true');
    expect(nativeButton.getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps post-hydration ARIA changes working', async () => {
    button = document.createElement('ion-button');
    document.body.appendChild(button);
    await button.componentOnReady();
    const errors = captureErrors(() => {
      button.setAttribute('aria-label', 'Updated after initialization');
      button.setAttribute('aria-pressed', 'false');
    });
    expect(errors).toEqual([]);
    // Attribute observers and Ionic rendering run separately from Angular.
    // Wait for the actual native state, rather than assuming one frame is enough.
    const nativeButton = button.shadowRoot.querySelector('button');
    await new Promise<void>((resolve, reject) => {
      const matches = () => nativeButton.getAttribute('aria-label') === 'Updated after initialization'
        && nativeButton.getAttribute('aria-pressed') === 'false';
      if (matches()) { resolve(); return; }
      const observer = new MutationObserver(() => {
        if (matches()) { observer.disconnect(); clearTimeout(timeout); resolve(); }
      });
      const timeout = setTimeout(() => {
        observer.disconnect(); reject(new Error('Native button ARIA attributes did not update'));
      }, 2500);
      observer.observe(nativeButton, { attributes: true });
    });
    expect(nativeButton.getAttribute('aria-label')).toBe('Updated after initialization');
    expect(nativeButton.getAttribute('aria-pressed')).toBe('false');
  });
});
