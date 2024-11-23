// @ts-check
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { afterEach, before, describe, test, mock } from "node:test";

describe("CommandBar", () => {
  /** @type {import("jsdom").DOMWindow} */
  let window;

  /** @type {typeof import("./lib.js").CommandBar} */
  let CommandBar;

  function render(html = "<command-bar></command-bar>") {
    const container = window.document.querySelector("body");
    if (!container) throw new Error("[render] Document body not found");
    container.innerHTML = html;

    const el = container.querySelector("command-bar");
    if (!(el instanceof CommandBar)) {
      throw new Error("[render] El has unexpected");
    }

    return {
      $: (sel) => container.querySelector(sel),
      $$: (sel) => container.querySelectorAll(sel),
      container,
      el,
    };
  }

  /**
   * @param {HTMLElement | import("jsdom").DOMWindow | null} el
   * @param {import("./lib.js").KeyboardShortcut} key
   */
  function keyboard(el, key) {
    if (!el) throw new Error("[keyboard] Target does not exist");
    el.dispatchEvent(new KeyboardEvent("keydown", { ...key }));
  }

  /**
   * @param {HTMLInputElement | null} el
   * @param {string} value
   */
  function input(el, value) {
    if (!el) throw new Error("[input] Target does not exist");
    el.value = value;
    el.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }

  /**
   * @param {HTMLElement | import("jsdom").DOMWindow | null} el
   */
  function click(el) {
    if (!el) throw new Error("[click] Target does not exist");
    el.dispatchEvent(new MouseEvent("click"));
  }

  before(async () => {
    const dom = new JSDOM("<!DOCTYPE html><body></body>");
    window = dom.window;

    globalThis.AbortController = dom.window.AbortController;
    globalThis.addEventListener = dom.window.addEventListener;
    globalThis.customElements = dom.window.customElements;
    globalThis.document = dom.window.document;
    globalThis.Event = dom.window.Event;
    globalThis.HTMLDialogElement = dom.window.HTMLDialogElement;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLInputElement = dom.window.HTMLInputElement;
    globalThis.HTMLTemplateElement = dom.window.HTMLTemplateElement;
    globalThis.InputEvent = dom.window.InputEvent;
    globalThis.KeyboardEvent = dom.window.KeyboardEvent;
    globalThis.MouseEvent = dom.window.MouseEvent;

    globalThis.HTMLDialogElement.prototype.showModal = mock.fn();
    globalThis.HTMLDialogElement.prototype.close = mock.fn();

    const { CommandBar: CommandBarAsyncImport } = await import("./lib.js");

    CommandBar = CommandBarAsyncImport;
    CommandBar.define();
  });

  afterEach(() => {
    window.document.body.innerHTML = "";
  });

  test("renders", () => {
    const { el } = render();
    assert(el);
  });

  test("returns the instance", () => {
    render();
    assert(CommandBar.instance instanceof CommandBar);
  });

  describe("shows and hides", () => {
    test("opens when the hotkey is pressed", async () => {
      const showModal = mock.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      render();

      keyboard(window, { metaKey: true, key: "k" });
      assert.equal(showModal.mock.callCount(), 1);
    });

    test("opens when a custom hotkey is pressed", async () => {
      const showModal = mock.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      render(
        `<command-bar hotkey='{"ctrlKey":true,"shiftKey":true,"key":"p"}'></command-bar>`
      );

      keyboard(window, { ctrlKey: true, shiftKey: true, key: "p" });
      assert.equal(showModal.mock.callCount(), 1);
    });

    test("does not open when additional keys are pressed", async () => {
      const showModal = mock.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      render();

      keyboard(window, { metaKey: true, shiftKey: true, key: "k" });
      assert.equal(showModal.mock.callCount(), 0);
    });

    test("opens when the instance method is called", async () => {
      const showModal = mock.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      const { el } = render();

      el.open();
      assert.equal(showModal.mock.callCount(), 1);
    });

    test("sets a default search when opening through the instance method", async () => {
      const showModal = mock.fn();
      HTMLDialogElement.prototype.showModal = showModal;
      const { el, $ } = render();

      el.open("foo");
      assert.equal($("input")?.value, "foo");
    });

    test("closes when escape is pressed", async () => {
      const close = mock.fn();
      HTMLDialogElement.prototype.close = close;
      const { el } = render();

      el.open();
      keyboard(window, { key: "Escape" });
      assert.equal(close.mock.callCount(), 1);
    });

    test("closes when a command is run", async () => {
      const action = mock.fn();
      const close = mock.fn();
      HTMLDialogElement.prototype.close = close;
      const { el, $ } = render();

      el.registerCommand({ id: "foo", name: "Foo", action });
      el.open("foo");
      click($("button"));

      assert.equal(action.mock.callCount(), 1);
      assert.equal(close.mock.callCount(), 1);
    });
  });

  describe("manages commands", () => {
    test("registers commands", async () => {
      const { el, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open("a");
      assert.equal($$("button").length, 3);
    });

    test("unregisters commands via cleanup function", async () => {
      const { el, $, $$ } = render();

      const cleanup = el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$("button").length, 3);

      input($("input"), "");
      cleanup();
      input($("input"), "a");
      assert.equal($$("button").length, 0);
    });

    test("unregisters commands via instance method", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$("button").length, 3);

      input($("input"), "");
      el.removeCommand("1", "2", "3");
      input($("input"), "a");
      assert.equal($$("button").length, 0);
    });
  });

  describe("renders commands", () => {
    test("limits visible results to 10 by default", async () => {
      const { el, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() },
        { id: "4", name: "4A", action: mock.fn() },
        { id: "5", name: "5A", action: mock.fn() },
        { id: "6", name: "6A", action: mock.fn() },
        { id: "7", name: "7A", action: mock.fn() },
        { id: "8", name: "8A", action: mock.fn() },
        { id: "9", name: "9A", action: mock.fn() },
        { id: "10", name: "10A", action: mock.fn() },
        { id: "11", name: "11A", action: mock.fn() }
      );

      el.open("a");
      assert.equal($$("button").length, 10);
    });

    test("limits visible results by a custom amount", async () => {
      const { el, $$ } = render('<command-bar limitresults="3"></command-bar>');

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() },
        { id: "4", name: "4A", action: mock.fn() },
        { id: "5", name: "5A", action: mock.fn() }
      );

      el.open("a");
      assert.equal($$("button").length, 3);
    });

    test("shows the name", async () => {
      const { el, $ } = render();

      el.registerCommand({ id: "1", name: "1A", action: mock.fn() });

      el.open("a");
      assert.equal($("button").textContent, "1A");
    });

    test("shows the group name", async () => {
      const { el, $ } = render();

      el.registerCommand({
        id: "1",
        name: "1A",
        groupName: "Group",
        action: mock.fn(),
      });

      el.open("a");
      assert.equal($("button").textContent, "Group1A");
    });

    test("shows the icon", async () => {
      const { el, $ } = render();

      el.registerCommand({
        id: "1",
        name: "1A",
        icon: "😎",
        action: mock.fn(),
      });

      el.open("a");
      assert.equal($("button").textContent, "😎1A");
    });

    test("shows the chord", async () => {
      const { el, $ } = render();

      el.registerCommand({
        id: "1",
        name: "1A",
        chord: "aa",
        action: mock.fn(),
      });

      el.open("a");
      assert.equal($("button").textContent, "1Aaa");
    });
  });

  describe("runs commands", () => {
    test("runs the focused command on enter", async () => {
      const action = mock.fn();
      const { el, $ } = render();

      el.registerCommand({ id: "1", name: "1A", action });

      el.open();
      input($("input"), "a");
      keyboard(window, { key: "Enter" });
      assert.equal(action.mock.callCount(), 1);
    });

    test("runs a command on click", async () => {
      const action = mock.fn();
      const { el, $ } = render();

      el.registerCommand({ id: "1", name: "1A", action });

      el.open();
      input($("input"), "a");
      click($("button"));
      assert.equal(action.mock.callCount(), 1);
    });

    test("repeats the same command", async () => {
      const action = mock.fn();
      const { el, $ } = render();

      el.registerCommand({ id: "1", name: "1A", action });

      el.open();
      input($("input"), "a");
      click($("button"));
      assert.equal(action.mock.callCount(), 1);

      keyboard(window, { metaKey: true, key: "." });
      assert.equal(action.mock.callCount(), 2);
    });
  });

  describe("searches and selects commands", () => {
    test("focuses the first command by default", async () => {
      const { el, $, $$ } = render();

      el.registerCommand({ id: "1", name: "1A", action: mock.fn() });

      el.open();
      input($("input"), "a");
      assert($$("button")[0].className.includes("cb__result--focused"));
    });

    test("doesn't show commands when the search is empty", async () => {
      const { el, $$ } = render();

      el.registerCommand({ id: "1", name: "1A", action: mock.fn() });

      el.open();
      assert.equal($$("button").length, 0);
    });

    test("finds commands by chord", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", chord: "x", action: mock.fn() },
        { id: "2", name: "2A", chord: "y", action: mock.fn() },
        { id: "3", name: "3A", chord: "z", action: mock.fn() }
      );

      el.open();
      input($("input"), "y");
      assert.equal($("button").textContent, "2Ay");
    });

    test("does not show the same command twice when found by chord and query", async () => {
      const { el, $, $$ } = render();

      el.registerCommand({
        id: "1",
        name: "1A",
        chord: "1A",
        action: mock.fn(),
      });

      el.open();
      input($("input"), "1A");
      assert.equal($$("button").length, 1);
    });

    test("highlights matches by chord", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", chord: "x", action: mock.fn() },
        { id: "2", name: "2A", chord: "y", action: mock.fn() },
        { id: "3", name: "3A", chord: "z", action: mock.fn() }
      );

      el.open();
      input($("input"), "y");
      assert($("button").className.includes("cb__result--chord-match"));
    });

    test("doesn't highlight matches not found via chord", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", chord: "x", action: mock.fn() },
        { id: "2", name: "2A", chord: "y", action: mock.fn() },
        { id: "3", name: "3A", chord: "z", action: mock.fn() }
      );

      el.open();
      input($("input"), "2A");
      assert(!$("button").className.includes("cb__result--chord-match"));
    });

    test("shows chord matches before other commands", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", chord: "x", action: mock.fn() },
        { id: "2", name: "2B", chord: "a", action: mock.fn() },
        { id: "3", name: "3A", chord: "z", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert($$("button")[0].className.includes("cb__result--chord-match"));
      assert(!$$("button")[1].className.includes("cb__result--chord-match"));
    });

    test("clears search on escape", async () => {
      const { el, $ } = render();

      el.open("foo");
      assert.equal($("input").value, "foo");
      keyboard(window, { key: "Escape" });
      assert(!$("input").value);
    });

    test("moves focus down", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$(".cb__result--focused").length, 1);
      assert($$("button")[0].className.includes("cb__result--focused"));

      keyboard(window, { key: "ArrowDown" });
      assert($$("button")[1].className.includes("cb__result--focused"));
    });

    test("moves focus up", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$(".cb__result--focused").length, 1);
      assert($$("button")[0].className.includes("cb__result--focused"));

      keyboard(window, { key: "ArrowDown" });
      assert($$("button")[1].className.includes("cb__result--focused"));

      keyboard(window, { key: "ArrowUp" });
      assert($$("button")[0].className.includes("cb__result--focused"));
    });

    test("doesn't move focus before the first item", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$(".cb__result--focused").length, 1);
      assert($$("button")[0].className.includes("cb__result--focused"));

      keyboard(window, { key: "ArrowUp" });
      assert($$("button")[0].className.includes("cb__result--focused"));
    });

    test("doesn't move focus past the last item", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$(".cb__result--focused").length, 1);
      assert($$("button")[0].className.includes("cb__result--focused"));

      keyboard(window, { key: "ArrowDown" });
      assert($$("button")[1].className.includes("cb__result--focused"));

      keyboard(window, { key: "ArrowDown" });
      assert($$("button")[2].className.includes("cb__result--focused"));

      keyboard(window, { key: "ArrowDown" });
      assert($$("button")[2].className.includes("cb__result--focused"));
    });

    test("starts focus at the first item", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$(".cb__result--focused").length, 1);
      assert($$("button")[0].className.includes("cb__result--focused"));
    });

    test("finds commands by name", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "1A");
      assert.equal($("button").textContent, "1A");
    });

    test("finds commands by group name", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", groupName: "GX", action: mock.fn() },
        { id: "2", name: "2A", groupName: "GY", action: mock.fn() },
        { id: "3", name: "3A", groupName: "GZ", action: mock.fn() }
      );

      el.open();
      input($("input"), "GX");
      assert.equal($("button").textContent, "GX1A");
    });

    test("finds commands by alias", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", alias: ["AX"], action: mock.fn() },
        { id: "2", name: "2A", alias: ["AY"], action: mock.fn() },
        { id: "3", name: "3A", alias: ["AZ"], action: mock.fn() }
      );

      el.open();
      input($("input"), "AX");
      assert.equal($("button").textContent, "1A");
    });

    test("narrows selection with additional search terms", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A One", action: mock.fn() },
        { id: "2", name: "1A Two", action: mock.fn() },
        { id: "3", name: "1A Three", action: mock.fn() }
      );

      el.open();
      input($("input"), "1 tw");
      assert.equal($("button").textContent, "1A Two");
    });

    test("searches case-insensitive", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "1a");
      assert.equal($("button").textContent, "1A");
    });

    test("ranks results by weight", async () => {
      const { el, $, $$ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn(), weight: 20 },
        { id: "3", name: "3A", action: mock.fn(), weight: 10 }
      );

      el.open();
      input($("input"), "a");
      assert.equal($$("button")[0].textContent, "2A");
      assert.equal($$("button")[1].textContent, "3A");
      assert.equal($$("button")[2].textContent, "1A");
    });

    test("shows the default empty state when no result is found", async () => {
      const { el, $ } = render();

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "foo");
      assert(!$("button"));

      assert.equal(
        $("[data-ref='emptyMessage']").textContent,
        "Sorry, couldnʼt find anything."
      );
    });

    test("shows a custom empty state when no result is found", async () => {
      const { el, $ } = render(
        '<command-bar emptymessage="Custom empty state"></command-bar>'
      );

      el.registerCommand(
        { id: "1", name: "1A", action: mock.fn() },
        { id: "2", name: "2A", action: mock.fn() },
        { id: "3", name: "3A", action: mock.fn() }
      );

      el.open();
      input($("input"), "foo");
      assert(!$("button"));

      assert.equal(
        $("[data-ref='emptyMessage']").textContent,
        "Custom empty state"
      );
    });
  });
});
