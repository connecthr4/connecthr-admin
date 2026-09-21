/**
 * jsdom ships `HTMLDialogElement` as a bare element — no `open`, `show`, `showModal` or `close`
 * (see `jsdom/lib/jsdom/living/nodes/HTMLDialogElement-impl.js`, which is an empty subclass).
 * Components built on the native `<dialog>` are therefore untestable out of the box.
 *
 * This adds the parts of the spec a test can observe: the `open` attribute reflection, the
 * `show`/`showModal`/`close` methods, and the `cancel`/`close` events that `Escape` fires.
 * The top layer, the backdrop and the focus trap are rendering concerns jsdom has no notion of,
 * so they are left to a real browser.
 */

if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  /**
   * Modal dialogs, oldest first, so `Escape` can be routed to the topmost one.
   */
  const modalDialogs = new Set<HTMLDialogElement>();

  const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  Object.defineProperties(HTMLDialogElement.prototype, {
    open: {
      configurable: true,
      get(this: HTMLDialogElement) {
        return this.hasAttribute('open');
      },
      set(this: HTMLDialogElement, value: boolean) {
        this.toggleAttribute('open', Boolean(value));
      },
    },

    returnValue: {
      configurable: true,
      writable: true,
      value: '',
    },

    show: {
      configurable: true,
      value(this: HTMLDialogElement) {
        this.setAttribute('open', '');
      },
    },

    showModal: {
      configurable: true,
      value(this: HTMLDialogElement) {
        if (this.open) {
          throw new DOMException('The element already has an "open" attribute', 'InvalidStateError');
        }

        this.setAttribute('open', '');
        modalDialogs.add(this);

        /**
         * The real `showModal` moves focus to the first focusable descendant.
         */
        this.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
      },
    },

    close: {
      configurable: true,
      value(this: HTMLDialogElement, returnValue?: string) {
        if (!this.open) return;

        if (returnValue !== undefined) {
          this.returnValue = returnValue;
        }

        this.removeAttribute('open');
        modalDialogs.delete(this);
        this.dispatchEvent(new Event('close'));
      },
    },
  });

  /**
   * `Escape` fires a cancelable `cancel` event on the topmost modal dialog, and closes it
   * unless a listener calls `preventDefault`.
   */
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    const dialog = Array.from(modalDialogs).pop();

    if (!dialog) return;

    if (dialog.dispatchEvent(new Event('cancel', { cancelable: true }))) {
      dialog.close();
    }
  });
}

export {};
