/** @extends {C8<CommandBarAttrs, CommandBarRefs, never>} */
export class CommandBar extends C8<CommandBarAttrs, CommandBarRefs, never> {
    static disabledFeatures: string[];
    /** @type {import("@andreasphil/c8").Attrs<CommandBarAttrs>} */
    static attrs: import("@andreasphil/c8").Attrs<CommandBarAttrs>;
    /** @type {Array<keyof HTMLElementEventMap>} */
    static events: Array<keyof HTMLElementEventMap>;
    static get instance(): Element;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    /**
     * @template {keyof CommandBarAttrs} T
     * @param {T} name
     */
    attributeChangedCallback<T extends keyof CommandBarAttrs>(name: T): void;
    open(initialQuery?: string): void;
    onDialogClose(): void;
    /**
     * @param {Command[]} toRegister
     * @returns {() => void}
     */
    registerCommand(...toRegister: Command[]): () => void;
    /** @param {string[]} toRemove */
    removeCommand(...toRemove: string[]): void;
    /** @param {InputEvent} event */
    onSearch(event: InputEvent): void;
    #private;
}
export type KeyboardShortcut = Partial<Pick<KeyboardEvent, "key" | "metaKey" | "altKey" | "ctrlKey" | "shiftKey">>;
export type Command = {
    /**
     * The unique identifier of the command. Can be any string.
     */
    id: string;
    /**
     * The visible name of the command.
     */
    name: string;
    /**
     * A list of aliases of the command. If the user
     * searches for one of them, the alias will be treated as if it was the name
     * of the command.
     */
    alias?: string[];
    /**
     * A unique combination of characters. If the user
     * types those exact characters in the search field, the associated command
     * will be shown prominently and highlighted.
     */
    chord?: string;
    /**
     * An additional label displayed before the name.
     */
    groupName?: string;
    /**
     * Icon of the command. Should be a string
     * (which will be inserted as text content) or an HTML element (which will be
     * inserted as-is).
     */
    icon?: string | HTMLElement;
    /**
     * Callback to run when the command is invoked.
     */
    action: () => void;
    /**
     * Used for sorting. Items with a higher weight
     * will always appear before items with a lower weight.
     */
    weight?: number;
};
export type CommandBarAttrs = {
    /**
     * When true, repeats the most recent command
     * when ⌘. is pressed.
     */
    allowRepeat: boolean;
    /**
     * Changes the text of the message that is
     * displayed when no results are found. Defaults to "Sorry, couldnʼt find
     * anything."
     */
    emptyMessage?: string;
    /**
     * Allows you to set a custom hotkey.
     * Defaults to ⌘K.
     */
    hotkey?: KeyboardShortcut;
    /**
     * Limits the number of results that are
     * shown. Defaults to 10.
     */
    limitResults?: number;
    /**
     * Changes the placeholder of the search field.
     * Defaults to "Search..."
     */
    placeholder?: string;
};
export type CommandBarRefs = {
    host: HTMLDialogElement;
    searchLabel: HTMLLabelElement;
    search: HTMLInputElement;
    results: HTMLUListElement;
    emptyMessage: HTMLParagraphElement;
};
import { C8 } from "@andreasphil/c8";
