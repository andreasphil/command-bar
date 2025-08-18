// Types --------------------------------------------------

/**
 * @template T
 * @typedef {object} AttrDefinition
 * @prop {(val: string | null) => T} [parse]
 * @prop {(val: T) => string} [stringify]
 * @prop {() => string} [default]
 */

/**
 * @template T
 * @typedef {{ [K in keyof T]: AttrDefinition<T[K]> }} Attrs
 */

// Utils --------------------------------------------------

/**
 * @template T
 * @param {AttrDefinition<T>} definition
 * @returns {AttrDefinition<T>}
 */
export function defineAttr(definition) {
  return definition;
}

/**
 * @param {TemplateStringsArray} strings
 * @param {unknown[]} values
 * @returns {string}
 */
const tag = (strings, ...values) => String.raw({ raw: strings }, ...values);

/**
 * Helper for HTML template strings. The tag does nothing, but using it will
 * allow syntax highlighting and formatting if your editor supports it.
 */
export const html = tag;

/**
 * @param {string} template
 * @returns {Node}
 */
export function renderTemplate(template) {
  const templateEl = document.createElement("template");
  templateEl.innerHTML = template;
  return templateEl.content.cloneNode(true);
}

// Component base class -----------------------------------

/**
 * @template {Record<string, any>} Attrs
 * @template {Record<string, Element>} Refs
 * @template {Record<string, any>} Emits
 */
export class C8 extends HTMLElement {
  /**
   * Tag under which the component will be available after registering. Must be
   * set and must be a valid custom element name.
   *
   * @type {string}
   */
  static tag = "";

  /**
   * Observed attributes of the component. The information in this property
   * will be used to populate the instance's `attrs` property with the actual
   * values of the attributes, and sync changes to the values back to the
   * HTML.
   *
   * @type {Record<string, AttrDefinition<unknown>>}
   */
  static attrs = {};

  /**
   * The names of events that will automatically be listened to. This should
   * return all event types that you intend to register via `data-on:<type>`
   * attributes.
   *
   * @type {Array<keyof WindowEventMap | string>}
   * @default []
   */
  static events = [];

  /**
   * Registers the component as a custom element. For compatibility, you can
   * provide a tag name, otherwise the tag name will default to the value of
   * `this.tag`.
   *
   * @param {string} [tag]
   */
  static define(tag = this.tag) {
    if (!tag) throw new Error("Custom element must specify a tag name");

    customElements.define(tag, this);
  }

  /**
   * Returns the attributes for which the component will be notified of
   * changes. Note that this is intended to be used by the browser. You
   * should describe the attributes you expect via `this.attrs` and
   * usually won't need to touch this function.
   *
   * @returns {string[]}
   */
  static get observedAttributes() {
    return Object.keys(this.attrs);
  }

  /**
   * The component's template. This will be inserted into the custom element on
   * initialization.
   *
   * @type {string}
   */
  get template() {
    throw new Error("Custom element must specify a template");
  }

  /**
   * Reflected attributes. This will be populated automatically based on the
   * attributes specified in the element's static `attrs` property.
   *
   * @type {Attrs}
   */
  attrs;

  /**
   * @type {ShadowRoot | this}
   */
  get #root() {
    return this.shadowRoot ?? this;
  }

  constructor() {
    super();

    try {
      this.attachShadow({ mode: "open" });
    } catch {
      // Shadow root has been disabled. Ignore; light DOM will be used
      // automatically instead.
    }
  }

  connectedCallback() {
    this.#insertTemplate();
    this.#registerAttributes();
    this.#attachEvents();
  }

  /**
   * Returns the element with that ref name. This will throw if no ref with
   * that name was found.
   *
   * @template {keyof Refs} T
   * @param {T} name
   * @returns {Refs[T]}
   */
  ref(name) {
    const el = this.maybeRef(name);
    if (!el) throw new Error(`Ref with name ${String(name)} was not found`);
    return el;
  }

  /**
   * Returns the element with that ref name, or `undefined` if no ref with
   * that name was found.
   *
   * @template {keyof Refs} T
   * @param {T} name
   * @returns {Refs[T]}
   */
  maybeRef(name) {
    const el = this.#root.querySelector(`[data-ref="${String(name)}"]`);

    // @ts-expect-error Can't be sure, need to trust the user's typings
    return el ?? undefined;
  }

  /**
   * Returns all elements that are marked as refs.
   *
   * @returns {Partial<Refs>}
   */
  refs() {
    const els = {};

    this.#root.querySelectorAll("[data-ref]").forEach((el) => {
      if (el instanceof HTMLElement && el.dataset.ref) els[el.dataset.ref] = el;
    });

    return els;
  }

  /**
   * Emits an event with the specified payload.
   *
   * @template {keyof Emits} T
   * @param {T} name
   * @param {Emits[T]} payload
   */
  emit(name, payload) {
    const event = new CustomEvent(String(name), {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: payload,
    });

    this.dispatchEvent(event);
  }

  #insertTemplate() {
    if (this.template.startsWith("#")) {
      const templateEl = document.querySelector(this.template);
      if (!(templateEl instanceof HTMLTemplateElement)) {
        throw new Error(`${this.template} is not a template element`);
      }
      this.#root.appendChild(templateEl.content.cloneNode(true));
    } else {
      const templateNode = renderTemplate(this.template);
      this.#root.appendChild(templateNode);
    }
  }

  #attachEvents() {
    /** @type {typeof C8} */
    // @ts-expect-error
    const { events } = this.constructor;

    events.forEach((type) => {
      this.#root.addEventListener(type, (event) => {
        if (!(event.target instanceof HTMLElement)) return;

        let target = event.target;
        const handlerAttr = `on:${event.type}`;
        const handlerSelector = `[data-${handlerAttr.replace(":", "\\:")}]`;

        let handlerName = target.dataset[handlerAttr];
        if (!handlerName && (target = target.closest(handlerSelector))) {
          handlerName = target.dataset[handlerAttr];
        }

        this[handlerName]?.(event);
      });
    });
  }

  #registerAttributes() {
    /** @type {typeof C8} */
    // @ts-expect-error
    const { attrs } = this.constructor;

    // @ts-expect-error We'll populate the object below
    this.attrs ??= {};

    Object.entries(attrs).forEach(([name, def]) => {
      const stringify = def.stringify ?? ((val) => val?.toString() ?? "");
      const parse = def.parse ?? ((val) => val);

      Object.defineProperty(this.attrs, name, {
        get: () => parse(this.getAttribute(name)),
        set: (val) => this.setAttribute(name, stringify(val)),
      });

      if (def.default && !this.getAttribute(name)) {
        this.setAttribute(name, def.default());
      }
    });
  }
}
