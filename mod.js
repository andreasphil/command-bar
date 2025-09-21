import { C8, html } from "./c8.js";

// Types --------------------------------------------------

/**
 * @typedef {Partial<Pick<KeyboardEvent, "key" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">>} KeyboardShortcut
 */

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
 * @typedef CommandBarAttrs
 *
 * @property {boolean} allowRepeat When true, repeats the most recent command
 *  when ⌘. is pressed.
 *
 * @property {string} [emptyMessage] Changes the text of the message that is
 *  displayed when no results are found. Defaults to "Sorry, couldnʼt find
 *  anything."
 *
 * @property {KeyboardShortcut} [hotkey] Allows you to set a custom hotkey.
 *  Defaults to ⌘K.
 *
 * @property {number} [limitResults] Limits the number of results that are
 *  shown. Defaults to 10.
 *
 * @property {string} [placeholder] Changes the placeholder of the search field.
 *  Defaults to "Search..."
 */

/**
 * @typedef CommandBarRefs
 *
 * @property {HTMLDialogElement} host
 * @property {HTMLLabelElement} searchLabel
 * @property {HTMLInputElement} search
 * @property {HTMLUListElement} results
 * @property {HTMLParagraphElement} emptyMessage
 */

// Utils --------------------------------------------------

// From https://lucide.dev, licensed under the ISC License.
//
// Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as
// part of Feather (MIT). All other copyright (c) for Lucide are held by
// Lucide Contributors 2022.
const frown =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-frown"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>';

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

/**
 * @param {Record<string, any>} classNames
 * @returns {string}
 */
function cls(classNames) {
  return Object.entries(classNames)
    .filter(([, v]) => Boolean(v))
    .map(([k]) => k)
    .join(" ");
}

// Functionality ------------------------------------------

/** @extends {C8<CommandBarAttrs, CommandBarRefs, never>} */
export class CommandBar extends C8 {
  static tag = "command-bar";

  static disabledFeatures = ["shadow"];

  /** @type {import("@andreasphil/c8").Attrs<CommandBarAttrs>} */
  static attrs = {
    allowRepeat: { parse: Boolean, default: () => "true" },

    emptyMessage: {
      parse: String,
      default: () => "Sorry, couldnʼt find anything.",
    },

    limitResults: { parse: Number, default: () => "10" },

    placeholder: { parse: String, default: () => "Search..." },

    hotkey: {
      parse: JSON.parse,
      stringify: JSON.stringify,
      default: () => '{"key":"k","metaKey":true}',
    },
  };

  /** @type {Array<keyof HTMLElementEventMap>} */
  static events = ["close", "input", "click"];

  get template() {
    return html`
      <dialog data-ref="host" data-on:close="onDialogClose">
        <style>
          @scope {
            :scope {
              &:has(input:invalid) .cb__body {
                display: none;
              }
            }

            .cb__header {
              font-weight: normal;
              margin: 0;
            }

            .cb__body {
              max-height: calc(80dvh - 12rem);
              overflow: auto;

              > * {
                margin-top: 0.75rem;
              }
            }

            .cb__results-list {
              list-style-type: none;
              margin: 0.75rem 0 0 0;
              padding: 0;
            }

            .cb__result {
              background: transparent;
              color: var(--c-fg);
              justify-content: start;
              outline-offset: var(--outline-inset);
              text-align: left;
              width: 100%;

              &:hover {
                background: var(--c-surface-variant-bg);
              }

              &.cb__result--focused {
                background: var(--c-surface-variant-bg);
              }

              &.cb__result--chord-match {
                background: var(--primary-50);
                color: var(--primary-500);

                &:hover {
                  background: var(--primary-100);
                }

                .cb__group-name {
                  color: var(--primary-400);
                }

                .cb__chord {
                  border-color: var(--primary-200);
                  color: var(--primary-400);
                }
              }

              > :empty {
                display: none;
              }
            }

            .cb__group-name {
              color: var(--c-fg-variant);
              display: inline-block;
              flex: none;
              font-weight: var(--font-weight-normal);

              &:after {
                content: "›";
                margin-left: 0.75ch;
              }
            }

            .cb__chord {
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

        <header class="cb__header">
          <label>
            <span class="visually-hidden" data-ref="searchLabel"></span>
            <input
              type="search"
              data-ref="search"
              data-on:input="onSearch"
              required
            />
          </label>
        </header>

        <div class="cb__body" has-fallback>
          <ul class="cb__results-list" data-ref="results"></ul>

          <div fallback-for="empty">
            <p>${frown}</p>
            <p data-ref="emptyMessage"></p>
          </div>
        </div>
      </dialog>
    `;
  }

  static get instance() {
    const instance = document.querySelectorAll(this.tag);

    if (instance[0] instanceof CommandBar) {
      if (instance.length > 1) {
        console.warn("Found multiple CommandBars. Only the first is returned.");
      }
      return instance[0];
    } else {
      throw new Error("No CommandBar instance found.");
    }
  }

  // Lifecycle ----------------------------------------------

  #disconnectedController = new AbortController();

  connectedCallback() {
    super.connectedCallback();

    addEventListener("keydown", (e) => this.#onToggleShortcut(e), {
      signal: this.#disconnectedController.signal,
    });

    addEventListener("keydown", (e) => this.#onGlobalKeydown(e), {
      signal: this.#disconnectedController.signal,
    });

    this.updatePlaceholder();
    this.updateEmptyMessage();
  }

  disconnectedCallback() {
    this.#disconnectedController.abort();
  }

  /**
   * @template {keyof CommandBarAttrs} T
   * @param {T} name
   */
  attributeChangedCallback(name) {
    switch (name.toLowerCase()) {
      case "placeholder":
        this.updatePlaceholder();
        break;
      case "emptymessage":
        this.updateEmptyMessage();
        break;
    }
  }

  /** @param {KeyboardEvent} event */
  #onGlobalKeydown(event) {
    // Run if the command bar is closed
    if (event.key === "." && event.metaKey) {
      this.#runMostRecent();
      event.preventDefault();
    }

    if (!this.#open) return;
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

  // State --------------------------------------------------

  #open = false;

  /** @type {Command[]} */
  #commands = [];

  /** @type {Map<string, Command>} */
  #chords = new Map();

  /** @type {Command | null} */
  #mostRecent = null;

  #query = "";

  #focusedResult = 0;

  /** @param {string} value */
  #setQuery(value) {
    this.#query = value;
    this.#setFocusedResult(0);

    this.ref("search").value = value;
    this.#updateResults();
  }

  /** @param {number} value */
  #setFocusedResult(value) {
    this.#focusedResult = value;

    const results = this.ref("results").querySelectorAll("button");
    results.forEach((result, i) => {
      if (i === value) result.classList.add("cb__result--focused");
      else result.classList.remove("cb__result--focused");
    });
  }

  #toggle(open = !this.#open) {
    if (open === this.#open) return;
    else if (open) {
      this.ref("host").showModal();
      this.#open = true;
    } else {
      this.ref("host").close();
      this.#setFocusedResult(0);
      this.#open = false;
      this.#setQuery("");
    }
  }

  // Rendering ----------------------------------------------

  /**
   * @private Cannot be strictly private for Vue compat reasons, but should be
   *  treated as internal.
   */
  updatePlaceholder() {
    this.ref("searchLabel").textContent = this.attrs.placeholder;
    this.ref("search").setAttribute("placeholder", this.attrs.placeholder);
  }

  /**
   * @private Cannot be strictly private for Vue compat reasons, but should be
   *  treated as internal.
   */
  updateEmptyMessage() {
    this.ref("emptyMessage").textContent = this.attrs.emptyMessage;
  }

  #updateResults() {
    this.ref("results").innerHTML = "";

    this.#getFilteredCommands().forEach((command, i) => {
      const li = document.createElement("li");

      const button = document.createElement("button");
      button.addEventListener("click", () => this.#runCommand(command));
      button.className = cls({
        cb__result: true,
        "cb__result--focused": i === this.#focusedResult,
        "cb__result--chord-match": this.#query === command.chord,
      });

      const icon = document.createElement("span");
      icon.classList.add("cb__icon");
      if (command.icon instanceof Element) icon.appendChild(command.icon);
      else if (typeof command.icon === "string")
        icon.textContent = command.icon;
      button.appendChild(icon);

      const groupName = document.createElement("span");
      groupName.classList.add("cb__group-name");
      groupName.textContent = command.groupName ?? "";
      button.appendChild(groupName);

      const commandName = document.createElement("span");
      commandName.classList.add("clamp");
      commandName.textContent = command.name;
      button.appendChild(commandName);

      const chord = document.createElement("span");
      chord.classList.add("cb__chord");
      chord.textContent = command.chord ?? "";
      button.appendChild(chord);

      li.appendChild(button);

      this.ref("results").appendChild(li);
    });
  }

  // Visibility ---------------------------------------------

  open(initialQuery = "") {
    this.#toggle(true);
    this.#setQuery(initialQuery);
  }

  onDialogClose() {
    this.#open = false;
  }

  #onEsc() {
    if (this.#query) {
      this.#setQuery("");
    } else this.#toggle(false);
  }

  /** @param {KeyboardEvent} event */
  #onToggleShortcut(event) {
    const strictHotkey = Object.assign(
      {
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        key: "",
      },
      this.attrs.hotkey
    );

    let match = Object.entries(strictHotkey).reduce((match, [key, value]) => {
      return match && event[key] === value;
    }, true);

    if (!match) return;

    this.#toggle();
    event.preventDefault();
    event.stopPropagation();
  }

  // Command registration -----------------------------------

  /**
   * @param {Command[]} toRegister
   * @returns {() => void}
   */
  registerCommand(...toRegister) {
    const ids = toRegister.map((c) => c.id);
    this.removeCommand(...ids);
    this.#commands = [...this.#commands, ...toRegister];

    toRegister.forEach((command) => {
      if (command.chord) this.#chords.set(command.chord, command);
    });

    return () => {
      this.removeCommand(...ids);
    };
  }

  /** @param {string[]} toRemove */
  removeCommand(...toRemove) {
    this.#commands = this.#commands.filter((c) => !toRemove.includes(c.id));

    this.#chords.forEach((command, chord) => {
      if (toRemove.includes(command.id)) this.#chords.delete(chord);
    });

    if (this.#mostRecent && toRemove.includes(this.#mostRecent.id)) {
      this.#mostRecent = null;
    }
  }

  // Searching and running ----------------------------------

  /** @param {InputEvent} event */
  onSearch(event) {
    if (!(event.target instanceof HTMLInputElement)) return;
    this.#setQuery(event.target.value);
  }

  #getFilteredCommands() {
    if (!this.#query) return [];

    const matchingChord = this.#chords.get(this.#query);
    const queryTokens = this.#query.toLowerCase().split(" ");

    const result = this.#commands
      .filter((i) => {
        // Do not include the same item twice if it's already included via chord
        if (matchingChord && matchingChord.id === i.id) return false;

        const commandStr = [i.name, ...(i.alias ?? []), i.groupName ?? ""]
          .join(" ")
          .toLowerCase();

        return queryTokens.every((token) => commandStr.includes(token));
      })
      .slice(0, this.attrs.limitResults)
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

    if (matchingChord) result.unshift(matchingChord);

    return result;
  }

  #moveFocusDown() {
    const commandCount = this.#getFilteredCommands().length;
    if (commandCount === 0) return;

    const next = this.#focusedResult + 1;
    this.#setFocusedResult(Math.min(commandCount - 1, next));
  }

  #moveFocusUp() {
    this.#setFocusedResult(Math.max(this.#focusedResult - 1, 0));
  }

  #runFocusedCommand() {
    const focused = this.#getFilteredCommands().at(this.#focusedResult);
    if (focused) this.#runCommand(focused);
  }

  #runMostRecent() {
    if (this.#mostRecent && this.attrs.allowRepeat) {
      this.#runCommand(this.#mostRecent);
    }
  }

  /** @param {Command} command */
  #runCommand(command) {
    command.action();
    this.#mostRecent = command;
    this.#toggle(false);
  }
}
