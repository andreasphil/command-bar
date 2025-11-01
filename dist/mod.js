/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var t$1 = globalThis, i$1 = t$1.trustedTypes, s = i$1 ? i$1.createPolicy("lit-html", { createHTML: (t$2) => t$2 }) : void 0, e$2 = "$lit$", h = `lit$${Math.random().toFixed(9).slice(2)}$`, o = "?" + h, n = `<${o}>`, r = document, l = () => r.createComment(""), c = (t$2) => null === t$2 || "object" != typeof t$2 && "function" != typeof t$2, a = Array.isArray, u = (t$2) => a(t$2) || "function" == typeof t$2?.[Symbol.iterator], d = "[ 	\n\f\r]", f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, v = /-->/g, _ = />/g, m = RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), p = /'/g, g = /"/g, $ = /^(?:script|style|textarea|title)$/i, y = (t$2) => (i$2, ...s$1) => ({
	_$litType$: t$2,
	strings: i$2,
	values: s$1
}), x = y(1);
y(2);
y(3);
var T = Symbol.for("lit-noChange"), E = Symbol.for("lit-nothing"), A = /* @__PURE__ */ new WeakMap(), C = r.createTreeWalker(r, 129);
function P(t$2, i$2) {
	if (!a(t$2) || !t$2.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return void 0 !== s ? s.createHTML(i$2) : i$2;
}
var V = (t$2, i$2) => {
	const s$1 = t$2.length - 1, o$1 = [];
	let r$1, l$1 = 2 === i$2 ? "<svg>" : 3 === i$2 ? "<math>" : "", c$1 = f;
	for (let i$3 = 0; i$3 < s$1; i$3++) {
		const s$2 = t$2[i$3];
		let a$1, u$1, d$1 = -1, y$1 = 0;
		for (; y$1 < s$2.length && (c$1.lastIndex = y$1, u$1 = c$1.exec(s$2), null !== u$1);) y$1 = c$1.lastIndex, c$1 === f ? "!--" === u$1[1] ? c$1 = v : void 0 !== u$1[1] ? c$1 = _ : void 0 !== u$1[2] ? ($.test(u$1[2]) && (r$1 = RegExp("</" + u$1[2], "g")), c$1 = m) : void 0 !== u$1[3] && (c$1 = m) : c$1 === m ? ">" === u$1[0] ? (c$1 = r$1 ?? f, d$1 = -1) : void 0 === u$1[1] ? d$1 = -2 : (d$1 = c$1.lastIndex - u$1[2].length, a$1 = u$1[1], c$1 = void 0 === u$1[3] ? m : "\"" === u$1[3] ? g : p) : c$1 === g || c$1 === p ? c$1 = m : c$1 === v || c$1 === _ ? c$1 = f : (c$1 = m, r$1 = void 0);
		const x$1 = c$1 === m && t$2[i$3 + 1].startsWith("/>") ? " " : "";
		l$1 += c$1 === f ? s$2 + n : d$1 >= 0 ? (o$1.push(a$1), s$2.slice(0, d$1) + e$2 + s$2.slice(d$1) + h + x$1) : s$2 + h + (-2 === d$1 ? i$3 : x$1);
	}
	return [P(t$2, l$1 + (t$2[s$1] || "<?>") + (2 === i$2 ? "</svg>" : 3 === i$2 ? "</math>" : "")), o$1];
};
var N = class N {
	constructor({ strings: t$2, _$litType$: s$1 }, n$1) {
		let r$1;
		this.parts = [];
		let c$1 = 0, a$1 = 0;
		const u$1 = t$2.length - 1, d$1 = this.parts, [f$1, v$1] = V(t$2, s$1);
		if (this.el = N.createElement(f$1, n$1), C.currentNode = this.el.content, 2 === s$1 || 3 === s$1) {
			const t$3 = this.el.content.firstChild;
			t$3.replaceWith(...t$3.childNodes);
		}
		for (; null !== (r$1 = C.nextNode()) && d$1.length < u$1;) {
			if (1 === r$1.nodeType) {
				if (r$1.hasAttributes()) for (const t$3 of r$1.getAttributeNames()) if (t$3.endsWith(e$2)) {
					const i$2 = v$1[a$1++], s$2 = r$1.getAttribute(t$3).split(h), e$3 = /([.?@])?(.*)/.exec(i$2);
					d$1.push({
						type: 1,
						index: c$1,
						name: e$3[2],
						strings: s$2,
						ctor: "." === e$3[1] ? H : "?" === e$3[1] ? I : "@" === e$3[1] ? L : k
					}), r$1.removeAttribute(t$3);
				} else t$3.startsWith(h) && (d$1.push({
					type: 6,
					index: c$1
				}), r$1.removeAttribute(t$3));
				if ($.test(r$1.tagName)) {
					const t$3 = r$1.textContent.split(h), s$2 = t$3.length - 1;
					if (s$2 > 0) {
						r$1.textContent = i$1 ? i$1.emptyScript : "";
						for (let i$2 = 0; i$2 < s$2; i$2++) r$1.append(t$3[i$2], l()), C.nextNode(), d$1.push({
							type: 2,
							index: ++c$1
						});
						r$1.append(t$3[s$2], l());
					}
				}
			} else if (8 === r$1.nodeType) if (r$1.data === o) d$1.push({
				type: 2,
				index: c$1
			});
			else {
				let t$3 = -1;
				for (; -1 !== (t$3 = r$1.data.indexOf(h, t$3 + 1));) d$1.push({
					type: 7,
					index: c$1
				}), t$3 += h.length - 1;
			}
			c$1++;
		}
	}
	static createElement(t$2, i$2) {
		const s$1 = r.createElement("template");
		return s$1.innerHTML = t$2, s$1;
	}
};
function S(t$2, i$2, s$1 = t$2, e$3) {
	if (i$2 === T) return i$2;
	let h$1 = void 0 !== e$3 ? s$1._$Co?.[e$3] : s$1._$Cl;
	const o$1 = c(i$2) ? void 0 : i$2._$litDirective$;
	return h$1?.constructor !== o$1 && (h$1?._$AO?.(!1), void 0 === o$1 ? h$1 = void 0 : (h$1 = new o$1(t$2), h$1._$AT(t$2, s$1, e$3)), void 0 !== e$3 ? (s$1._$Co ??= [])[e$3] = h$1 : s$1._$Cl = h$1), void 0 !== h$1 && (i$2 = S(t$2, h$1._$AS(t$2, i$2.values), h$1, e$3)), i$2;
}
var M = class {
	constructor(t$2, i$2) {
		this._$AV = [], this._$AN = void 0, this._$AD = t$2, this._$AM = i$2;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(t$2) {
		const { el: { content: i$2 }, parts: s$1 } = this._$AD, e$3 = (t$2?.creationScope ?? r).importNode(i$2, !0);
		C.currentNode = e$3;
		let h$1 = C.nextNode(), o$1 = 0, n$1 = 0, l$1 = s$1[0];
		for (; void 0 !== l$1;) {
			if (o$1 === l$1.index) {
				let i$3;
				2 === l$1.type ? i$3 = new R(h$1, h$1.nextSibling, this, t$2) : 1 === l$1.type ? i$3 = new l$1.ctor(h$1, l$1.name, l$1.strings, this, t$2) : 6 === l$1.type && (i$3 = new z(h$1, this, t$2)), this._$AV.push(i$3), l$1 = s$1[++n$1];
			}
			o$1 !== l$1?.index && (h$1 = C.nextNode(), o$1++);
		}
		return C.currentNode = r, e$3;
	}
	p(t$2) {
		let i$2 = 0;
		for (const s$1 of this._$AV) void 0 !== s$1 && (void 0 !== s$1.strings ? (s$1._$AI(t$2, s$1, i$2), i$2 += s$1.strings.length - 2) : s$1._$AI(t$2[i$2])), i$2++;
	}
};
var R = class R {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(t$2, i$2, s$1, e$3) {
		this.type = 2, this._$AH = E, this._$AN = void 0, this._$AA = t$2, this._$AB = i$2, this._$AM = s$1, this.options = e$3, this._$Cv = e$3?.isConnected ?? !0;
	}
	get parentNode() {
		let t$2 = this._$AA.parentNode;
		const i$2 = this._$AM;
		return void 0 !== i$2 && 11 === t$2?.nodeType && (t$2 = i$2.parentNode), t$2;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(t$2, i$2 = this) {
		t$2 = S(this, t$2, i$2), c(t$2) ? t$2 === E || null == t$2 || "" === t$2 ? (this._$AH !== E && this._$AR(), this._$AH = E) : t$2 !== this._$AH && t$2 !== T && this._(t$2) : void 0 !== t$2._$litType$ ? this.$(t$2) : void 0 !== t$2.nodeType ? this.T(t$2) : u(t$2) ? this.k(t$2) : this._(t$2);
	}
	O(t$2) {
		return this._$AA.parentNode.insertBefore(t$2, this._$AB);
	}
	T(t$2) {
		this._$AH !== t$2 && (this._$AR(), this._$AH = this.O(t$2));
	}
	_(t$2) {
		this._$AH !== E && c(this._$AH) ? this._$AA.nextSibling.data = t$2 : this.T(r.createTextNode(t$2)), this._$AH = t$2;
	}
	$(t$2) {
		const { values: i$2, _$litType$: s$1 } = t$2, e$3 = "number" == typeof s$1 ? this._$AC(t$2) : (void 0 === s$1.el && (s$1.el = N.createElement(P(s$1.h, s$1.h[0]), this.options)), s$1);
		if (this._$AH?._$AD === e$3) this._$AH.p(i$2);
		else {
			const t$3 = new M(e$3, this), s$2 = t$3.u(this.options);
			t$3.p(i$2), this.T(s$2), this._$AH = t$3;
		}
	}
	_$AC(t$2) {
		let i$2 = A.get(t$2.strings);
		return void 0 === i$2 && A.set(t$2.strings, i$2 = new N(t$2)), i$2;
	}
	k(t$2) {
		a(this._$AH) || (this._$AH = [], this._$AR());
		const i$2 = this._$AH;
		let s$1, e$3 = 0;
		for (const h$1 of t$2) e$3 === i$2.length ? i$2.push(s$1 = new R(this.O(l()), this.O(l()), this, this.options)) : s$1 = i$2[e$3], s$1._$AI(h$1), e$3++;
		e$3 < i$2.length && (this._$AR(s$1 && s$1._$AB.nextSibling, e$3), i$2.length = e$3);
	}
	_$AR(t$2 = this._$AA.nextSibling, i$2) {
		for (this._$AP?.(!1, !0, i$2); t$2 !== this._$AB;) {
			const i$3 = t$2.nextSibling;
			t$2.remove(), t$2 = i$3;
		}
	}
	setConnected(t$2) {
		void 0 === this._$AM && (this._$Cv = t$2, this._$AP?.(t$2));
	}
};
var k = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(t$2, i$2, s$1, e$3, h$1) {
		this.type = 1, this._$AH = E, this._$AN = void 0, this.element = t$2, this.name = i$2, this._$AM = e$3, this.options = h$1, s$1.length > 2 || "" !== s$1[0] || "" !== s$1[1] ? (this._$AH = Array(s$1.length - 1).fill(/* @__PURE__ */ new String()), this.strings = s$1) : this._$AH = E;
	}
	_$AI(t$2, i$2 = this, s$1, e$3) {
		const h$1 = this.strings;
		let o$1 = !1;
		if (void 0 === h$1) t$2 = S(this, t$2, i$2, 0), o$1 = !c(t$2) || t$2 !== this._$AH && t$2 !== T, o$1 && (this._$AH = t$2);
		else {
			const e$4 = t$2;
			let n$1, r$1;
			for (t$2 = h$1[0], n$1 = 0; n$1 < h$1.length - 1; n$1++) r$1 = S(this, e$4[s$1 + n$1], i$2, n$1), r$1 === T && (r$1 = this._$AH[n$1]), o$1 ||= !c(r$1) || r$1 !== this._$AH[n$1], r$1 === E ? t$2 = E : t$2 !== E && (t$2 += (r$1 ?? "") + h$1[n$1 + 1]), this._$AH[n$1] = r$1;
		}
		o$1 && !e$3 && this.j(t$2);
	}
	j(t$2) {
		t$2 === E ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t$2 ?? "");
	}
};
var H = class extends k {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(t$2) {
		this.element[this.name] = t$2 === E ? void 0 : t$2;
	}
};
var I = class extends k {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(t$2) {
		this.element.toggleAttribute(this.name, !!t$2 && t$2 !== E);
	}
};
var L = class extends k {
	constructor(t$2, i$2, s$1, e$3, h$1) {
		super(t$2, i$2, s$1, e$3, h$1), this.type = 5;
	}
	_$AI(t$2, i$2 = this) {
		if ((t$2 = S(this, t$2, i$2, 0) ?? E) === T) return;
		const s$1 = this._$AH, e$3 = t$2 === E && s$1 !== E || t$2.capture !== s$1.capture || t$2.once !== s$1.once || t$2.passive !== s$1.passive, h$1 = t$2 !== E && (s$1 === E || e$3);
		e$3 && this.element.removeEventListener(this.name, this, s$1), h$1 && this.element.addEventListener(this.name, this, t$2), this._$AH = t$2;
	}
	handleEvent(t$2) {
		"function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t$2) : this._$AH.handleEvent(t$2);
	}
};
var z = class {
	constructor(t$2, i$2, s$1) {
		this.element = t$2, this.type = 6, this._$AN = void 0, this._$AM = i$2, this.options = s$1;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(t$2) {
		S(this, t$2);
	}
}, j = t$1.litHtmlPolyfillSupport;
j?.(N, R), (t$1.litHtmlVersions ??= []).push("3.3.1");
var B = (t$2, i$2, s$1) => {
	const e$3 = s$1?.renderBefore ?? i$2;
	let h$1 = e$3._$litPart$;
	if (void 0 === h$1) {
		const t$3 = s$1?.renderBefore ?? null;
		e$3._$litPart$ = h$1 = new R(i$2.insertBefore(l(), t$3), t$3, void 0, s$1 ?? {});
	}
	return h$1._$AI(t$2), h$1;
};
/**
* @license
* Copyright 2017 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/
var t = {
	ATTRIBUTE: 1,
	CHILD: 2,
	PROPERTY: 3,
	BOOLEAN_ATTRIBUTE: 4,
	EVENT: 5,
	ELEMENT: 6
}, e$1 = (t$2) => (...e$3) => ({
	_$litDirective$: t$2,
	values: e$3
});
var i = class {
	constructor(t$2) {}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AT(t$2, e$3, i$2) {
		this._$Ct = t$2, this._$AM = e$3, this._$Ci = i$2;
	}
	_$AS(t$2, e$3) {
		return this.update(t$2, e$3);
	}
	update(t$2, e$3) {
		return this.render(...e$3);
	}
};
/**
* @license
* Copyright 2018 Google LLC
* SPDX-License-Identifier: BSD-3-Clause
*/ var e = e$1(class extends i {
	constructor(t$2) {
		if (super(t$2), t$2.type !== t.ATTRIBUTE || "class" !== t$2.name || t$2.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
	}
	render(t$2) {
		return " " + Object.keys(t$2).filter(((s$1) => t$2[s$1])).join(" ") + " ";
	}
	update(s$1, [i$2]) {
		if (void 0 === this.st) {
			this.st = /* @__PURE__ */ new Set(), void 0 !== s$1.strings && (this.nt = new Set(s$1.strings.join(" ").split(/\s/).filter(((t$2) => "" !== t$2))));
			for (const t$2 in i$2) i$2[t$2] && !this.nt?.has(t$2) && this.st.add(t$2);
			return this.render(i$2);
		}
		const r$1 = s$1.element.classList;
		for (const t$2 of this.st) t$2 in i$2 || (r$1.remove(t$2), this.st.delete(t$2));
		for (const t$2 in i$2) {
			const s$2 = !!i$2[t$2];
			s$2 === this.st.has(t$2) || this.nt?.has(t$2) || (s$2 ? (r$1.add(t$2), this.st.add(t$2)) : (r$1.remove(t$2), this.st.delete(t$2)));
		}
		return T;
	}
});
let clean = Symbol("clean");
var listenerQueue = [];
var lqIndex = 0;
var QUEUE_ITEMS_PER_LISTENER = 4;
let epoch = 0;
let atom = (initialValue) => {
	let listeners = [];
	let $atom = {
		get() {
			if (!$atom.lc) $atom.listen(() => {})();
			return $atom.value;
		},
		lc: 0,
		listen(listener) {
			$atom.lc = listeners.push(listener);
			return () => {
				for (let i$2 = lqIndex + QUEUE_ITEMS_PER_LISTENER; i$2 < listenerQueue.length;) if (listenerQueue[i$2] === listener) listenerQueue.splice(i$2, QUEUE_ITEMS_PER_LISTENER);
				else i$2 += QUEUE_ITEMS_PER_LISTENER;
				let index = listeners.indexOf(listener);
				if (~index) {
					listeners.splice(index, 1);
					if (!--$atom.lc) $atom.off();
				}
			};
		},
		notify(oldValue, changedKey) {
			epoch++;
			let runListenerQueue = !listenerQueue.length;
			for (let listener of listeners) listenerQueue.push(listener, $atom.value, oldValue, changedKey);
			if (runListenerQueue) {
				for (lqIndex = 0; lqIndex < listenerQueue.length; lqIndex += QUEUE_ITEMS_PER_LISTENER) listenerQueue[lqIndex](listenerQueue[lqIndex + 1], listenerQueue[lqIndex + 2], listenerQueue[lqIndex + 3]);
				listenerQueue.length = 0;
			}
		},
		off() {},
		set(newValue) {
			let oldValue = $atom.value;
			if (oldValue !== newValue) {
				$atom.value = newValue;
				$atom.notify(oldValue);
			}
		},
		subscribe(listener) {
			let unbind = $atom.listen(listener);
			listener($atom.value);
			return unbind;
		},
		value: initialValue
	};
	if (process.env.NODE_ENV !== "production") $atom[clean] = () => {
		listeners = [];
		$atom.lc = 0;
		$atom.off();
	};
	return $atom;
};
var MOUNT = 5;
var UNMOUNT = 6;
var REVERT_MUTATION = 10;
let on = (object, listener, eventKey, mutateStore) => {
	object.events = object.events || {};
	if (!object.events[eventKey + REVERT_MUTATION]) object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
		object.events[eventKey].reduceRight((event, l$1) => (l$1(event), event), {
			shared: {},
			...eventProps
		});
	});
	object.events[eventKey] = object.events[eventKey] || [];
	object.events[eventKey].push(listener);
	return () => {
		let currentListeners = object.events[eventKey];
		let index = currentListeners.indexOf(listener);
		currentListeners.splice(index, 1);
		if (!currentListeners.length) {
			delete object.events[eventKey];
			object.events[eventKey + REVERT_MUTATION]();
			delete object.events[eventKey + REVERT_MUTATION];
		}
	};
};
let STORE_UNMOUNT_DELAY = 1e3;
let onMount = ($store, initialize) => {
	let listener = (payload) => {
		let destroy = initialize(payload);
		if (destroy) $store.events[UNMOUNT].push(destroy);
	};
	return on($store, listener, MOUNT, (runListeners) => {
		let originListen = $store.listen;
		$store.listen = (...args) => {
			if (!$store.lc && !$store.active) {
				$store.active = true;
				runListeners();
			}
			return originListen(...args);
		};
		let originOff = $store.off;
		$store.events[UNMOUNT] = [];
		$store.off = () => {
			originOff();
			setTimeout(() => {
				if ($store.active && !$store.lc) {
					$store.active = false;
					for (let destroy of $store.events[UNMOUNT]) destroy();
					$store.events[UNMOUNT] = [];
				}
			}, STORE_UNMOUNT_DELAY);
		};
		if (process.env.NODE_ENV !== "production") {
			let originClean = $store[clean];
			$store[clean] = () => {
				for (let destroy of $store.events[UNMOUNT]) destroy();
				$store.events[UNMOUNT] = [];
				$store.active = false;
				originClean();
			};
		}
		return () => {
			$store.listen = originListen;
			$store.off = originOff;
		};
	});
};
var computedStore = (stores, cb, batched) => {
	if (!Array.isArray(stores)) stores = [stores];
	let previousArgs;
	let currentEpoch;
	let set = () => {
		if (currentEpoch === epoch) return;
		currentEpoch = epoch;
		let args = stores.map(($store) => $store.get());
		if (!previousArgs || args.some((arg, i$2) => arg !== previousArgs[i$2])) {
			previousArgs = args;
			let value = cb(...args);
			if (value && value.then && value.t) value.then((asyncValue) => {
				if (previousArgs === args) $computed.set(asyncValue);
			});
			else {
				$computed.set(value);
				currentEpoch = epoch;
			}
		}
	};
	let $computed = atom(void 0);
	let get = $computed.get;
	$computed.get = () => {
		set();
		return get();
	};
	let timer;
	let run = batched ? () => {
		clearTimeout(timer);
		timer = setTimeout(set);
	} : set;
	onMount($computed, () => {
		let unbinds = stores.map(($store) => $store.listen(run));
		set();
		return () => {
			for (let unbind of unbinds) unbind();
		};
	});
	return $computed;
};
let computed = (stores, fn) => computedStore(stores, fn);
let effect = (stores, callback) => {
	if (!Array.isArray(stores)) stores = [stores];
	let unbinds = [];
	let lastRunUnbind;
	let run = () => {
		lastRunUnbind && lastRunUnbind();
		lastRunUnbind = callback(...stores.map((store) => store.get()));
	};
	unbinds = stores.map((store) => store.listen(run));
	run();
	return () => {
		unbinds.forEach((unbind) => unbind());
		lastRunUnbind && lastRunUnbind();
	};
};
let map = (initial = {}) => {
	let $map = atom(initial);
	$map.setKey = function(key, value) {
		let oldMap = $map.value;
		if (typeof value === "undefined" && key in $map.value) {
			$map.value = { ...$map.value };
			delete $map.value[key];
			$map.notify(oldMap, key);
		} else if ($map.value[key] !== value) {
			$map.value = {
				...$map.value,
				[key]: value
			};
			$map.notify(oldMap, key);
		}
	};
	return $map;
};
function renderSvgFromString(svg) {
	return new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
}
var CommandBar = class CommandBar extends HTMLElement {
	static tag = "command-bar";
	static define(tag = this.tag) {
		this.tag = tag;
		customElements.define(tag, this);
	}
	static get instance() {
		const instance = document.querySelectorAll(this.tag);
		if (instance[0] instanceof CommandBar) {
			if (instance.length > 1) console.warn("Found multiple CommandBars. Only the first is returned.");
			return instance[0];
		} else throw new Error("No CommandBar instance found.");
	}
	#state = map({
		commands: [],
		focusedResult: 0,
		mostRecent: null,
		open: false,
		query: ""
	});
	#chords = computed(this.#state, (state) => state.commands.reduce((all, current) => {
		if (current.chord) all[current.chord] = current;
		return all;
	}, {}));
	#results = computed([this.#state, this.#chords], (state, chords) => {
		if (!this.#state.get().query) return [];
		const matchingChord = chords[state.query];
		const queryTokens = state.query.toLowerCase().split(" ");
		const results = state.commands.filter((i$2) => {
			if (matchingChord && matchingChord.id === i$2.id) return false;
			const commandStr = [
				i$2.name,
				...i$2.alias ?? [],
				i$2.groupName ?? ""
			].join(" ").toLowerCase();
			return queryTokens.every((token) => commandStr.includes(token));
		}).slice(0, 10).sort((a$1, b$1) => (b$1.weight ?? 0) - (a$1.weight ?? 0));
		if (matchingChord) results.unshift(matchingChord);
		return results;
	});
	shortcut = {
		key: "k",
		metaKey: true
	};
	allowRepeat = true;
	get placeholder() {
		return this.getAttribute("placeholder") ?? "Search...";
	}
	get emptyMessage() {
		return this.getAttribute("emptymessage") ?? "Sorry, couldnʼt find anything.";
	}
	registerCommand(...toRegister) {
		const ids = toRegister.map((c$1) => c$1.id);
		this.removeCommand(...ids);
		const next = this.#state.get().commands.concat(...toRegister);
		this.#state.setKey("commands", next);
		return () => {
			this.removeCommand(...ids);
		};
	}
	removeCommand(...toRemove) {
		const next = this.#state.get().commands.filter((c$1) => !toRemove.includes(c$1.id));
		this.#state.setKey("commands", next);
		const mostRecent = this.#state.get().mostRecent;
		if (mostRecent && toRemove.includes(mostRecent.id)) this.#state.setKey("mostRecent", null);
	}
	open(initialQuery = "") {
		this.#state.setKey("query", initialQuery);
		this.#toggle(true);
	}
	#disconnectedController = new AbortController();
	constructor() {
		super();
	}
	connectedCallback() {
		addEventListener("keydown", (e$3) => this.#onToggleShortcut(e$3), { signal: this.#disconnectedController.signal });
		addEventListener("keydown", (e$3) => this.#onGlobalKeydown(e$3), { signal: this.#disconnectedController.signal });
		effect([this.#state, this.#results], () => {
			this.#render();
		});
		this.#render();
	}
	disconnectedCallback() {
		this.#disconnectedController.abort();
	}
	get #dialog() {
		return this.querySelector("dialog");
	}
	#toggle(open = !this.#state.get().open) {
		if (open === this.#state.get().open) return;
		else if (open) {
			this.#dialog.showModal();
			this.#state.setKey("open", true);
		} else {
			this.#dialog.close();
			this.#state.setKey("focusedResult", 0);
			this.#state.setKey("open", false);
			this.#state.setKey("query", "");
		}
	}
	#onToggleShortcut(event) {
		const strictShortcut = Object.assign({
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
			key: ""
		}, this.shortcut);
		if (!Object.entries(strictShortcut).reduce((match, [key, value]) => {
			return match && event[key] === value;
		}, true)) return;
		this.#toggle();
		event.preventDefault();
		event.stopPropagation();
	}
	#onGlobalKeydown(event) {
		if (event.key === "." && event.metaKey) {
			this.#runMostRecent();
			event.preventDefault();
		}
		if (!this.#state.get().open) return;
		let cancel = true;
		if (event.key === "Escape") this.#onEsc();
		else if (event.key === "ArrowUp") this.#moveFocusUp();
		else if (event.key === "ArrowDown") this.#moveFocusDown();
		else if (event.key === "Enter") this.#runFocusedCommand();
		else cancel = false;
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
		if (this.#state.get().mostRecent && this.allowRepeat) this.#runCommand(this.#state.get().mostRecent);
	}
	#runCommand(command) {
		command.action();
		this.#state.setKey("mostRecent", command);
		this.#toggle(false);
	}
	#template = (state) => x`<dialog>
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
            @input="${(event) => this.#state.setKey("query", event.target.value)}"
          />
        </label>
      </header>

      <output has-fallback="${state.results.length ? "" : "empty"}">
        <ul>
          ${state.results.map((r$1, i$2) => x`<li>
                <button
                  class="${e({
		focused: i$2 === state.focusedResult,
		"chord-match": r$1.chord === state.query
	})}""
                  @click="${() => this.#runCommand(r$1)}"
                >
                  <span class="icon">${r$1.icon}</span>
                  <span class="group-name">${r$1.groupName}</span>
                  <span class="clamp">${r$1.name}</span>
                  <span class="chord">${r$1.chord}</span>
                </button>
              </li>`)}
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
		B(this.#template({
			emptyMessage: this.emptyMessage,
			focusedResult: this.#state.get().focusedResult,
			query: this.#state.get().query,
			results: this.#results.get(),
			searchLabel: this.placeholder
		}), this);
	}
};
export { CommandBar, renderSvgFromString };
