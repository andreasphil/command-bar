import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map.js";
import { computed, effect, map } from "nanostores";

// Types --------------------------------------------------

/**
 * @typedef Command
 *
 * @property {string} id The unique identifier of the command. Can be any string.
 *
 * @property {string} name The visible name of the command.
 *
 * @property {string[]} [alias] A list of aliases of the command. If the user
 *  searches for one of them, the alias will be treated as if it was the name
 *  of the command.
 *
 * @property {string} [chord] A unique combination of characters. If the user
 *  types those exact characters in the search field, the associated command
 *  will be shown prominently and highlighted.
 *
 * @property {string} [groupName] An additional label displayed before the name.
 *
 * @property {string | HTMLElement} [icon] Icon of the command. Should be a string
 *  (which will be inserted as text content) or an HTML element (which will be
 *  inserted as-is).
 *
 * @property {() => void} action Callback to run when the command is invoked.
 *
 * @property {number} [weight] Used for sorting. Items with a higher weight
 *  will always appear before items with a lower weight.
 */

/**
 * @typedef {Partial<Pick<KeyboardEvent, "key" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">>} KeyboardShortcut
 */

// Utils --------------------------------------------------

/**
 * Takes an SVG string and converts it into an HTML element. Useful for
 * displaying icons in the command bar.
 *
 * @param {string} svg
 * @returns {HTMLElement}
 */
export function renderSvgFromString(svg) {
  return new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
}

// Main ---------------------------------------------------

export class CommandBar extends HTMLElement {
  static tag = "command-bar";

  static define(tag = this.tag) {
    this.tag = tag;
    customElements.define(tag, this);
  }

  static get instance() {
    const instance = document.querySelectorAll(this.tag);

    if (instance[0] instanceof CommandBar) {
      if (instance.length > 1) {
        console.warn("Found multiple CommandBars. Only the first is returned.");
      }
      return instance[0];
    } else throw new Error("No CommandBar instance found.");
  }

  // State --------------------------------------------------

  /**
   * @type {import("nanostores").MapStore<{
   *  commands: Command[];
   *  focusedResult: number;
   *  mostRecent: Command | null;
   *  open: boolean;
   *  query: string;
   * }>}
   */
  #state = map({
    commands: [],
    focusedResult: 0,
    mostRecent: null,
    open: false,
    query: "",
  });

  /** @type {import("nanostores").Atom<Record<string, Command>>} */
  #chords = computed(this.#state, (state) =>
    state.commands.reduce((all, current) => {
      if (current.chord) all[current.chord] = current;
      return all;
    }, {}),
  );

  /** @type {import("nanostores").ReadableAtom<Command[]>} */
  #results = computed([this.#state, this.#chords], (state, chords) => {
    if (!this.#state.get().query) return [];

    const matchingChord = chords[state.query];
    const queryTokens = state.query.toLowerCase().split(" ");

    const results = state.commands
      .filter((i) => {
        // Do not include the same item twice if it's already included via chord
        if (matchingChord && matchingChord.id === i.id) return false;

        const commandStr = [i.name, ...(i.alias ?? []), i.groupName ?? ""]
          .join(" ")
          .toLowerCase();

        return queryTokens.every((token) => commandStr.includes(token));
      })
      .slice(0, 10)
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

    if (matchingChord) results.unshift(matchingChord);

    return results;
  });

  // Public API ---------------------------------------------

  /** @type {KeyboardShortcut} */
  shortcut = { key: "k", metaKey: true };

  allowRepeat = true;

  get placeholder() {
    return this.getAttribute("placeholder") ?? "Search...";
  }

  get emptyMessage() {
    return (
      this.getAttribute("emptymessage") ?? "Sorry, couldnʼt find anything."
    );
  }

  /** @param {Command[]} toRegister */
  registerCommand(...toRegister) {
    const ids = toRegister.map((c) => c.id);
    this.removeCommand(...ids);

    const next = this.#state.get().commands.concat(...toRegister);
    this.#state.setKey("commands", next);

    return () => {
      this.removeCommand(...ids);
    };
  }

  /** @param {string[]} toRemove */
  removeCommand(...toRemove) {
    const next = this.#state
      .get()
      .commands.filter((c) => !toRemove.includes(c.id));

    this.#state.setKey("commands", next);

    const mostRecent = this.#state.get().mostRecent;
    if (mostRecent && toRemove.includes(mostRecent.id)) {
      this.#state.setKey("mostRecent", null);
    }
  }

  open(initialQuery = "") {
    this.#state.setKey("query", initialQuery);
    this.#toggle(true);
  }

  // Lifecycle ----------------------------------------------

  #disconnectedController = new AbortController();

  constructor() {
    super();
  }

  connectedCallback() {
    addEventListener("keydown", (e) => this.#onToggleShortcut(e), {
      signal: this.#disconnectedController.signal,
    });

    addEventListener("keydown", (e) => this.#onGlobalKeydown(e), {
      signal: this.#disconnectedController.signal,
    });

    effect([this.#state, this.#results], () => {
      this.#render();
    });

    this.#render();
  }

  disconnectedCallback() {
    this.#disconnectedController.abort();
  }

  // Internal -----------------------------------------------

  get #dialog() {
    return this.querySelector("dialog");
  }

  #toggle(open = !this.#state.get().open) {
    if (open === this.#state.get().open) return;
    else if (open) {
      this.#dialog?.showModal();
      this.#state.setKey("open", true);
    } else {
      this.#dialog?.close();
      this.#state.setKey("focusedResult", 0);
      this.#state.setKey("open", false);
      this.#state.setKey("query", "");
    }
  }

  /** @param {KeyboardEvent} event */
  #onToggleShortcut(event) {
    const strictShortcut = Object.assign(
      {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        key: "",
      },
      this.shortcut,
    );

    let match = Object.entries(strictShortcut).reduce((match, [key, value]) => {
      return match && event[key] === value;
    }, true);

    if (!match) return;

    this.#toggle();
    event.preventDefault();
    event.stopPropagation();
  }

  /** @param {KeyboardEvent} event */
  #onGlobalKeydown(event) {
    // Run if the command bar is closed
    if (event.key === "." && event.metaKey) {
      this.#runMostRecent();
      event.preventDefault();
    }

    if (!this.#state.get().open) return;
    let cancel = true;

    // Run if the command bar is open
    if (event.key === "Escape") {
      this.#onEsc();
    } else if (event.key === "ArrowUp") {
      this.#moveFocusUp();
    } else if (event.key === "ArrowDown") {
      this.#moveFocusDown();
    } else if (event.key === "Enter") {
      this.#runFocusedCommand();
    } else {
      cancel = false;
    }

    if (cancel) event.preventDefault();
  }

  #onEsc() {
    if (this.#state.get().query) this.#state.setKey("query", "");
    else this.#toggle(false);
  }

  #moveFocusDown() {
    const commandCount = this.#results.get().length;
    if (commandCount === 0) return;
    const next = this.#state.get().focusedResult + 1;
    this.#state.setKey("focusedResult", Math.min(commandCount - 1, next));
  }

  #moveFocusUp() {
    const next = this.#state.get().focusedResult - 1;
    this.#state.setKey("focusedResult", Math.max(next, 0));
  }

  #runFocusedCommand() {
    const focused = this.#results.get().at(this.#state.get().focusedResult);
    if (focused) this.#runCommand(focused);
  }

  #runMostRecent() {
    const command = this.#state.get().mostRecent;
    if (command && this.allowRepeat) {
      this.#runCommand(command);
    }
  }

  /** @param {Command} command */
  #runCommand(command) {
    command.action();
    this.#state.setKey("mostRecent", command);
    this.#toggle(false);
  }

  // Template -----------------------------------------------

  /**
   * @param {object} state
   * @param {Command[]} state.results
   * @param {number} state.focusedResult
   * @param {string} state.emptyMessage
   * @param {string} state.query
   * @param {string} state.searchLabel
   */
  #template = (state) =>
    html`<dialog>
      <style>
        @scope {
          :scope {
            --internal-padding: 1rem;

            &:has(input:invalid) output {
              display: none;
            }
          }

          header {
            font-weight: normal;
            margin: 0;
          }

          output {
            all: unset;
            max-height: calc(80dvh - 12rem);
            overflow: auto;

            > * {
              margin-top: 0.75rem;
            }
          }

          ul {
            list-style-type: none;
            margin: 0.75rem 0 0 0;
            padding: 0;
          }

          li button {
            background: transparent;
            color: var(--c-fg);
            justify-content: start;
            outline-offset: var(--outline-inset);
            text-align: left;
            width: 100%;

            &:hover {
              background: var(--c-surface-variant-bg);
            }

            &.focused {
              background: var(--c-surface-variant-bg);
            }

            &.chord-match {
              background: light-dark(var(--primary-50), var(--primary-100));
              color: var(--primary-500);

              &:hover {
                background: light-dark(var(--primary-100), var(--primary-200));
              }

              .group-name {
                color: var(--primary-400);
              }

              .chord {
                border-color: var(--primary-200);
                color: var(--primary-400);
              }
            }

            > :empty {
              display: none;
            }
          }

          .group-name {
            color: var(--c-fg-variant);
            display: inline-block;
            flex: none;
            font-weight: var(--font-weight-normal);

            &:after {
              content: "›";
              margin-left: 0.75ch;
            }
          }

          .chord {
            background: var(--c-surface-bg);
            border-radius: var(--border-radius-small);
            border: var(--border-width) solid var(--c-border);
            color: var(--c-fg-variant);
            font-family: var(--font-family-mono);
            font-size: var(--font-size-mono);
            margin-left: auto;
            padding: 0 0.25rem;
          }
        }
      </style>

      <header>
        <label>
          <span class="visually-hidden">${state.searchLabel}</span>
          <input
            type="search"
            .value="${state.query}"
            placeholder="${state.searchLabel}"
            required
            @input="${(event) =>
              this.#state.setKey("query", event.target.value)}"
          />
        </label>
      </header>

      <output has-fallback="${state.results.length ? "" : "empty"}">
        <ul>
          ${state.results.map(
            (r, i) =>
              html`<li>
                <button
                  class="${classMap({
                    focused: i === state.focusedResult,
                    "chord-match": r.chord === state.query,
                  })}""
                  @click="${() => this.#runCommand(r)}"
                >
                  <span class="icon">${r.icon}</span>
                  <span class="group-name">${r.groupName}</span>
                  <span class="clamp">${r.name}</span>
                  <span class="chord">${r.chord}</span>
                </button>
              </li>`,
          )}
        </ul>

        <div fallback-for="empty">
          <p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-frown"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
              <line x1="9" x2="9.01" y1="9" y2="9" />
              <line x1="15" x2="15.01" y1="9" y2="9" />
            </svg>
          </p>
          <p data-test-id="empty-message">${state.emptyMessage}</p>
        </div>
      </output>
    </dialog>`;

  #render() {
    render(
      this.#template({
        emptyMessage: this.emptyMessage,
        focusedResult: this.#state.get().focusedResult,
        query: this.#state.get().query,
        results: this.#results.get(),
        searchLabel: this.placeholder,
      }),
      this,
    );
  }
}
