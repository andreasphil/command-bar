import { JSDOM } from "jsdom";
import assert from "node:assert/strict";
import { afterEach, before, beforeEach, describe, mock, test } from "node:test";

describe("C8", () => {
  /** @type {import("jsdom").DOMWindow} */
  let window;

  /** @type {typeof import("./c8.js").C8} */
  let TestC8;

  /**
   * @param {typeof import("./c8.js").C8} component
   * @param {string} html
   * @returns {{ container: HTMLBodyElement, el: import("./c8.js").C8 }}
   */
  function render(component, html) {
    const container = window.document.querySelector("body");
    if (!window.customElements.get(component.tag)) component.define();
    container.innerHTML = html;

    return { container, el: container.querySelector(component.tag) };
  }

  before(async () => {
    const dom = new JSDOM("<!DOCTYPE html><body></body>");
    window = dom.window;

    globalThis.customElements = dom.window.customElements;
    globalThis.document = dom.window.document;
    globalThis.Event = dom.window.Event;
    globalThis.HTMLElement = dom.window.HTMLElement;
    globalThis.HTMLTemplateElement = dom.window.HTMLTemplateElement;

    const { C8 } = await import("./c8.js");
    TestC8 = C8;
  });

  afterEach(() => {
    window.document.querySelector("body").innerHTML = "";
  });

  test("renders", async () => {
    class HelloWorld extends TestC8 {
      static tag = "c8-hello-world";
      static disabledFeatures = ["shadow"];
      get template() {
        return "<h1>Hello world</h1>";
      }
    }

    const { el } = render(HelloWorld, `<c8-hello-world></c8-hello-world>`);

    assert.equal(el.querySelector("h1").textContent, "Hello world");
  });

  describe("definition", () => {
    test("is defined", () => {
      class DefineTest extends TestC8 {
        static tag = "c8-test";
      }

      assert(!window.customElements.get("c8-test"));
      DefineTest.define();
      assert(window.customElements.get("c8-test"));
    });

    test("throws if tag name is missing", () => {
      class Test extends TestC8 {}

      assert.throws(() => Test.define());
    });
  });

  describe("attributes", () => {
    let AttributesTest;

    before(() => {
      AttributesTest = class AttributesTest extends TestC8 {
        static tag = "c8-attributes";
        static attrs = {
          foo: {},
          bar: { parse: Number, stringify: (val) => val.toFixed(2) },
          baz: { default: () => "test" },
        };
        get template() {
          return `<span></span>`;
        }
      };

      AttributesTest.define();
    });

    test("returns observed attributes", () => {
      assert.deepEqual(AttributesTest.observedAttributes, [
        "foo",
        "bar",
        "baz",
      ]);
    });

    test("reads string attributes by default", () => {
      const { el } = render(
        AttributesTest,
        `<c8-attributes foo="bar"></c8-attributes>`
      );

      assert.equal(el.attrs.foo, "bar");
    });

    test("reflects string attributes by default", () => {
      const { el } = render(
        AttributesTest,
        `<c8-attributes foo="bar"></c8-attributes>`
      );

      el.attrs.foo = "baz";
      assert.equal(el.getAttribute("foo"), "baz");
    });

    test("reads attributes with a custom parser", () => {
      const { el } = render(
        AttributesTest,
        `<c8-attributes bar="1"></c8-attributes>`
      );

      assert.equal(el.attrs.bar, 1);
    });

    test("reflects attributes with a custom serializer", () => {
      const { el } = render(
        AttributesTest,
        `<c8-attributes bar="1"></c8-attributes>`
      );

      el.attrs.bar = 2;
      assert.equal(el.getAttribute("bar"), "2.00");
    });

    test("sets a default value", () => {
      const { el } = render(AttributesTest, `<c8-attributes></c8-attributes>`);
      assert.equal(el.getAttribute("baz"), "test");
    });
  });

  describe("events", () => {
    let EventsTest;
    const clickHandler = mock.fn();
    const changeHandler = mock.fn();
    const keydownHandler = mock.fn();

    before(() => {
      EventsTest = class EventsTest extends TestC8 {
        static tag = "c8-events";
        static disabledFeatures = ["shadow"];
        static events = ["click", "keydown"];
        get template() {
          return `
            <div data-on:keydown="handleKeydown">
              <button data-on:click="handleClick">Click <span>me</span></button>
              <input type="text" data-on:change="handleChange" />
            </div>
          `;
        }
        handleClick() {
          clickHandler();
        }
        handleChange() {
          changeHandler();
        }
        handleKeydown(event) {
          keydownHandler(event.key);
        }
      };

      EventsTest.define();
    });

    beforeEach(() => {
      clickHandler.mock.resetCalls();
      changeHandler.mock.resetCalls();
    });

    test("handles a direct event on an element with a handler", () => {
      const { el } = render(EventsTest, `<c8-events></c8-events>`);
      el.querySelector("button").click();
      assert.equal(clickHandler.mock.callCount(), 1);
    });

    test("ignores undeclared events", () => {
      const { el } = render(EventsTest, `<c8-events></c8-events>`);
      const input = el.querySelector("input");
      input.value = "foo";
      input.dispatchEvent(new window.Event("change", { bubbles: true }));

      assert.equal(changeHandler.mock.callCount(), 0);
    });

    test("handles an event on a child of an element with a handler", () => {
      const { el } = render(EventsTest, `<c8-events></c8-events>`);
      el.querySelector("button > span").dispatchEvent(
        new window.Event("click", { bubbles: true })
      );
      assert.equal(clickHandler.mock.callCount(), 1);
    });

    test("retains original event details when delegating", () => {
      const { el } = render(EventsTest, `<c8-events></c8-events>`);
      el.querySelector("input").dispatchEvent(
        new window.KeyboardEvent("keydown", { bubbles: true, key: "k" })
      );
      assert.equal(keydownHandler.mock.callCount(), 1);
      assert.deepEqual(keydownHandler.mock.calls[0].arguments, ["k"]);
    });

    test("handles events on elements inserted after initalization", () => {
      const { el } = render(EventsTest, `<c8-events></c8-events>`);
      const button2 = document.createElement("button");
      button2.innerText = "Click me 2";
      button2.dataset["on:click"] = "handleClick";
      el.appendChild(button2);
      el.querySelectorAll("button")[1].click();
      assert.equal(clickHandler.mock.callCount(), 1);
    });
  });

  describe("template", () => {
    test("renders an inline template", () => {
      class InlineTemplateTest extends TestC8 {
        static tag = "c8-inline";
        static disabledFeatures = ["shadow"];
        get template() {
          return `<span>Test</span>`;
        }
      }

      const { el } = render(InlineTemplateTest, `<c8-inline></c8-inline>`);
      assert.equal(el.innerHTML, "<span>Test</span>");
    });

    test("renders a template via ID", () => {
      class InlineTemplateTest extends TestC8 {
        static tag = "c8-el";
        static disabledFeatures = ["shadow"];
        get template() {
          return `#template`;
        }
      }

      const { el } = render(
        InlineTemplateTest,
        `<template id="template"><span>Test</span></template><c8-el></c8-el>`
      );

      assert.equal(el.innerHTML, "<span>Test</span>");
    });
  });

  describe("refs", () => {
    let RefsTest;

    before(() => {
      RefsTest = class RefsTest extends TestC8 {
        static tag = "c8-refs";
        static disabledFeatures = ["shadow"];
        get template() {
          return `
            <div data-ref="el-1"></div>
            <div data-ref="el-2"></div>
          `;
        }
      };

      RefsTest.define();
    });

    test("returns a required ref", () => {
      const { el } = render(RefsTest, "<c8-refs></c8-refs>");
      assert(el.ref("el-1"));
    });

    test("throws if a required ref is not found", () => {
      const { el } = render(RefsTest, "<c8-refs></c8-refs>");
      assert.throws(() => el.ref("el-1000"));
    });

    test("returns an optional ref", () => {
      const { el } = render(RefsTest, "<c8-refs></c8-refs>");
      assert(el.maybeRef("el-1"));
    });

    test("returns undefined if an optional ref is not found", () => {
      const { el } = render(RefsTest, "<c8-refs></c8-refs>");
      assert(!el.maybeRef("el-100"));
    });

    test("returns all refs", () => {
      const { el } = render(RefsTest, "<c8-refs></c8-refs>");
      const refs = el.refs();
      assert(refs["el-1"]);
      assert(refs["el-2"]);
    });
  });

  describe("emit", () => {
    let EmitTest;

    before(() => {
      EmitTest = class EmitTest extends TestC8 {
        static tag = "c8-emit";
        static disabledFeatures = ["shadow"];
        get template() {
          return `
            <button data-on:click="emitEvent">Emit</button>
          `;
        }
        emitEvent() {
          this.emit("foo", "bar");
        }
      };

      EmitTest.define();
    });
  });
});
