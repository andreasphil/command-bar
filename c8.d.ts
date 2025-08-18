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
/**
 * @template T
 * @param {AttrDefinition<T>} definition
 * @returns {AttrDefinition<T>}
 */
export function defineAttr<T>(definition: AttrDefinition<T>): AttrDefinition<T>;
/**
 * @param {string} template
 * @returns {Node}
 */
export function renderTemplate(template: string): Node;
/**
 * @param {TemplateStringsArray} strings
 * @param {unknown[]} values
 * @returns {string}
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string;
/**
 * @template {Record<string, any>} Attrs
 * @template {Record<string, Element>} Refs
 * @template {Record<string, any>} Emits
 */
export class C8<Attrs extends Record<string, any>, Refs extends Record<string, Element>, Emits extends Record<string, any>> extends HTMLElement {
    /**
     * Tag under which the component will be available after registering. Must be
     * set and must be a valid custom element name.
     *
     * @type {string}
     */
    static tag: string;
    /**
     * Observed attributes of the component. The information in this property
     * will be used to populate the instance's `attrs` property with the actual
     * values of the attributes, and sync changes to the values back to the
     * HTML.
     *
     * @type {Record<string, AttrDefinition<unknown>>}
     */
    static attrs: Record<string, AttrDefinition<unknown>>;
    /**
     * The names of events that will automatically be listened to. This should
     * return all event types that you intend to register via `data-on:<type>`
     * attributes.
     *
     * @type {Array<keyof WindowEventMap | string>}
     * @default []
     */
    static events: Array<keyof WindowEventMap | string>;
    /**
     * Registers the component as a custom element. For compatibility, you can
     * provide a tag name, otherwise the tag name will default to the value of
     * `this.tag`.
     *
     * @param {string} [tag]
     */
    static define(tag?: string): void;
    /**
     * Returns the attributes for which the component will be notified of
     * changes. Note that this is intended to be used by the browser. You
     * should describe the attributes you expect via `this.attrs` and
     * usually won't need to touch this function.
     *
     * @returns {string[]}
     */
    static get observedAttributes(): string[];
    constructor();
    /**
     * The component's template. This will be inserted into the custom element on
     * initialization.
     *
     * @type {string}
     */
    get template(): string;
    /**
     * Reflected attributes. This will be populated automatically based on the
     * attributes specified in the element's static `attrs` property.
     *
     * @type {Attrs}
     */
    attrs: Attrs;
    connectedCallback(): void;
    /**
     * Returns the element with that ref name. This will throw if no ref with
     * that name was found.
     *
     * @template {keyof Refs} T
     * @param {T} name
     * @returns {Refs[T]}
     */
    ref<T extends keyof Refs>(name: T): Refs[T];
    /**
     * Returns the element with that ref name, or `undefined` if no ref with
     * that name was found.
     *
     * @template {keyof Refs} T
     * @param {T} name
     * @returns {Refs[T]}
     */
    maybeRef<T extends keyof Refs>(name: T): Refs[T];
    /**
     * Returns all elements that are marked as refs.
     *
     * @returns {Partial<Refs>}
     */
    refs(): Partial<Refs>;
    /**
     * Emits an event with the specified payload.
     *
     * @template {keyof Emits} T
     * @param {T} name
     * @param {Emits[T]} payload
     */
    emit<T extends keyof Emits>(name: T, payload: Emits[T]): void;
    #private;
}
export type AttrDefinition<T> = {
    parse?: (val: string | null) => T;
    stringify?: (val: T) => string;
    default?: () => string;
};
export type Attrs<T> = { [K in keyof T]: AttrDefinition<T[K]>; };
