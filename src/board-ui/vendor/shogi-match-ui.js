//#region node_modules/@vue/shared/dist/shared.esm-bundler.js
// @__NO_SIDE_EFFECTS__
function e(e) {
	let t = /* @__PURE__ */ Object.create(null);
	for (let n of e.split(",")) t[n] = 1;
	return (e) => e in t;
}
var t = {}, n = [], r = () => {}, i = () => !1, a = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), o = (e) => e.startsWith("onUpdate:"), s = Object.assign, c = (e, t) => {
	let n = e.indexOf(t);
	n > -1 && e.splice(n, 1);
}, l = Object.prototype.hasOwnProperty, u = (e, t) => l.call(e, t), d = Array.isArray, f = (e) => x(e) === "[object Map]", p = (e) => x(e) === "[object Set]", m = (e) => x(e) === "[object Date]", h = (e) => typeof e == "function", g = (e) => typeof e == "string", _ = (e) => typeof e == "symbol", v = (e) => typeof e == "object" && !!e, y = (e) => (v(e) || h(e)) && h(e.then) && h(e.catch), b = Object.prototype.toString, x = (e) => b.call(e), ee = (e) => x(e).slice(8, -1), S = (e) => x(e) === "[object Object]", te = (e) => g(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, ne = /* @__PURE__ */ e(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"), re = (e) => {
	let t = /* @__PURE__ */ Object.create(null);
	return ((n) => t[n] || (t[n] = e(n)));
}, ie = /-\w/g, C = re((e) => e.replace(ie, (e) => e.slice(1).toUpperCase())), ae = /\B([A-Z])/g, w = re((e) => e.replace(ae, "-$1").toLowerCase()), oe = re((e) => e.charAt(0).toUpperCase() + e.slice(1)), se = re((e) => e ? `on${oe(e)}` : ""), T = (e, t) => !Object.is(e, t), ce = (e, ...t) => {
	for (let n = 0; n < e.length; n++) e[n](...t);
}, E = (e, t, n, r = !1) => {
	Object.defineProperty(e, t, {
		configurable: !0,
		enumerable: !1,
		writable: r,
		value: n
	});
}, D = (e) => {
	let t = parseFloat(e);
	return isNaN(t) ? e : t;
}, le = (e) => {
	let t = g(e) ? Number(e) : NaN;
	return isNaN(t) ? e : t;
}, O, ue = () => O ||= typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
function k(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = g(r) ? me(r) : k(r);
			if (i) for (let e in i) t[e] = i[e];
		}
		return t;
	} else if (g(e) || v(e)) return e;
}
var de = /;(?![^(]*\))/g, fe = /:([^]+)/, pe = /\/\*[^]*?\*\//g;
function me(e) {
	let t = {};
	return e.replace(pe, "").split(de).forEach((e) => {
		if (e) {
			let n = e.split(fe);
			n.length > 1 && (t[n[0].trim()] = n[1].trim());
		}
	}), t;
}
function he(e) {
	let t = "";
	if (g(e)) t = e;
	else if (d(e)) for (let n = 0; n < e.length; n++) {
		let r = he(e[n]);
		r && (t += r + " ");
	}
	else if (v(e)) for (let n in e) e[n] && (t += n + " ");
	return t.trim();
}
var ge = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", _e = /* @__PURE__ */ e(ge);
ge + "";
function ve(e) {
	return !!e || e === "";
}
function ye(e, t) {
	if (e.length !== t.length) return !1;
	let n = !0;
	for (let r = 0; n && r < e.length; r++) n = be(e[r], t[r]);
	return n;
}
function be(e, t) {
	if (e === t) return !0;
	let n = m(e), r = m(t);
	if (n || r) return n && r ? e.getTime() === t.getTime() : !1;
	if (n = _(e), r = _(t), n || r) return e === t;
	if (n = d(e), r = d(t), n || r) return n && r ? ye(e, t) : !1;
	if (n = v(e), r = v(t), n || r) {
		if (!n || !r || Object.keys(e).length !== Object.keys(t).length) return !1;
		for (let n in e) {
			let r = e.hasOwnProperty(n), i = t.hasOwnProperty(n);
			if (r && !i || !r && i || !be(e[n], t[n])) return !1;
		}
	}
	return String(e) === String(t);
}
var xe = (e) => !!(e && e.__v_isRef === !0), Se = (e) => g(e) ? e : e == null ? "" : d(e) || v(e) && (e.toString === b || !h(e.toString)) ? xe(e) ? Se(e.value) : JSON.stringify(e, Ce, 2) : String(e), Ce = (e, t) => xe(t) ? Ce(e, t.value) : f(t) ? { [`Map(${t.size})`]: [...t.entries()].reduce((e, [t, n], r) => (e[we(t, r) + " =>"] = n, e), {}) } : p(t) ? { [`Set(${t.size})`]: [...t.values()].map((e) => we(e)) } : _(t) ? we(t) : v(t) && !d(t) && !S(t) ? String(t) : t, we = (e, t = "") => _(e) ? `Symbol(${e.description ?? t})` : e, A, Te = class {
	constructor(e = !1) {
		this.detached = e, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !e && A && (A.active ? (this.parent = A, this.index = (A.scopes ||= []).push(this) - 1) : (this._active = !1, this._warnOnRun = !1));
	}
	get active() {
		return this._active;
	}
	pause() {
		if (this._active) {
			this._isPaused = !0;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].pause();
			}
			for (e = 0, t = this.effects.length; e < t; e++) this.effects[e].pause();
		}
	}
	resume() {
		if (this._active && this._isPaused) {
			this._isPaused = !1;
			let e, t;
			if (this.scopes) {
				let n = this.scopes.slice();
				for (e = 0, t = n.length; e < t; e++) n[e].resume();
			}
			let n = this.effects.slice();
			for (e = 0, t = n.length; e < t; e++) n[e].resume();
		}
	}
	run(e) {
		if (this._active) {
			let t = A;
			try {
				return A = this, e();
			} finally {
				A = t;
			}
		}
	}
	on() {
		++this._on === 1 && (this.prevScope = A, A = this);
	}
	off() {
		if (this._on > 0 && --this._on === 0) {
			if (A === this) A = this.prevScope;
			else {
				let e = A;
				for (; e;) {
					if (e.prevScope === this) {
						e.prevScope = this.prevScope;
						break;
					}
					e = e.prevScope;
				}
			}
			this.prevScope = void 0;
		}
	}
	stop(e) {
		if (this._active) {
			this._active = !1;
			let t, n;
			for (t = 0, n = this.effects.length; t < n; t++) this.effects[t].stop();
			for (this.effects.length = 0, t = 0, n = this.cleanups.length; t < n; t++) this.cleanups[t]();
			if (this.cleanups.length = 0, this.scopes) {
				let e = this.scopes.slice();
				for (t = 0, n = e.length; t < n; t++) e[t].stop(!0);
				this.scopes.length = 0;
			}
			if (!this.detached && this.parent && !e) {
				let e = this.parent.scopes.pop();
				e && e !== this && (this.parent.scopes[this.index] = e, e.index = this.index);
			}
			this.parent = void 0;
		}
	}
};
function Ee() {
	return A;
}
var j, De = /* @__PURE__ */ new WeakSet(), Oe = class {
	constructor(e) {
		this.fn = e, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, A && (A.active ? A.effects.push(this) : this.flags &= -2);
	}
	pause() {
		this.flags |= 64;
	}
	resume() {
		this.flags & 64 && (this.flags &= -65, De.has(this) && (De.delete(this), this.trigger()));
	}
	notify() {
		this.flags & 2 && !(this.flags & 32) || this.flags & 8 || Me(this);
	}
	run() {
		if (!(this.flags & 1)) return this.fn();
		this.flags |= 2, Ge(this), Fe(this);
		let e = j, t = Ve;
		j = this, Ve = !0;
		try {
			return this.fn();
		} finally {
			Ie(this), j = e, Ve = t, this.flags &= -3;
		}
	}
	stop() {
		if (this.flags & 1) {
			for (let e = this.deps; e; e = e.nextDep) ze(e);
			this.deps = this.depsTail = void 0, Ge(this), this.onStop && this.onStop(), this.flags &= -2;
		}
	}
	trigger() {
		this.flags & 64 ? De.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
	}
	runIfDirty() {
		Le(this) && this.run();
	}
	get dirty() {
		return Le(this);
	}
}, ke = 0, Ae, je;
function Me(e, t = !1) {
	if (e.flags |= 8, t) {
		e.next = je, je = e;
		return;
	}
	e.next = Ae, Ae = e;
}
function Ne() {
	ke++;
}
function Pe() {
	if (--ke > 0) return;
	if (je) {
		let e = je;
		for (je = void 0; e;) {
			let t = e.next;
			e.next = void 0, e.flags &= -9, e = t;
		}
	}
	let e;
	for (; Ae;) {
		let t = Ae;
		for (Ae = void 0; t;) {
			let n = t.next;
			if (t.next = void 0, t.flags &= -9, t.flags & 1) try {
				t.trigger();
			} catch (t) {
				e ||= t;
			}
			t = n;
		}
	}
	if (e) throw e;
}
function Fe(e) {
	for (let t = e.deps; t; t = t.nextDep) t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Ie(e) {
	let t, n = e.depsTail, r = n;
	for (; r;) {
		let e = r.prevDep;
		r.version === -1 ? (r === n && (n = e), ze(r), Be(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = e;
	}
	e.deps = t, e.depsTail = n;
}
function Le(e) {
	for (let t = e.deps; t; t = t.nextDep) if (t.dep.version !== t.version || t.dep.computed && (Re(t.dep.computed) || t.dep.version !== t.version)) return !0;
	return !!e._dirty;
}
function Re(e) {
	if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Ke) || (e.globalVersion = Ke, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !Le(e)))) return;
	e.flags |= 2;
	let t = e.dep, n = j, r = Ve;
	j = e, Ve = !0;
	try {
		Fe(e);
		let n = e.fn(e._value);
		(t.version === 0 || T(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
	} catch (e) {
		throw t.version++, e;
	} finally {
		j = n, Ve = r, Ie(e), e.flags &= -3;
	}
}
function ze(e, t = !1) {
	let { dep: n, prevSub: r, nextSub: i } = e;
	if (r && (r.nextSub = i, e.prevSub = void 0), i && (i.prevSub = r, e.nextSub = void 0), n.subs === e && (n.subs = r, !r && n.computed)) {
		n.computed.flags &= -5;
		for (let e = n.computed.deps; e; e = e.nextDep) ze(e, !0);
	}
	!t && !--n.sc && n.map && n.map.delete(n.key);
}
function Be(e) {
	let { prevDep: t, nextDep: n } = e;
	t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
var Ve = !0, He = [];
function Ue() {
	He.push(Ve), Ve = !1;
}
function We() {
	let e = He.pop();
	Ve = e === void 0 || e;
}
function Ge(e) {
	let { cleanup: t } = e;
	if (e.cleanup = void 0, t) {
		let e = j;
		j = void 0;
		try {
			t();
		} finally {
			j = e;
		}
	}
}
var Ke = 0, qe = class {
	constructor(e, t) {
		this.sub = e, this.dep = t, this.version = t.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
	}
}, Je = class {
	constructor(e) {
		this.computed = e, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
	}
	track(e) {
		if (!j || !Ve || j === this.computed) return;
		let t = this.activeLink;
		if (t === void 0 || t.sub !== j) t = this.activeLink = new qe(j, this), j.deps ? (t.prevDep = j.depsTail, j.depsTail.nextDep = t, j.depsTail = t) : j.deps = j.depsTail = t, Ye(t);
		else if (t.version === -1 && (t.version = this.version, t.nextDep)) {
			let e = t.nextDep;
			e.prevDep = t.prevDep, t.prevDep && (t.prevDep.nextDep = e), t.prevDep = j.depsTail, t.nextDep = void 0, j.depsTail.nextDep = t, j.depsTail = t, j.deps === t && (j.deps = e);
		}
		return t;
	}
	trigger(e) {
		this.version++, Ke++, this.notify(e);
	}
	notify(e) {
		Ne();
		try {
			for (let e = this.subs; e; e = e.prevSub) e.sub.notify() && e.sub.dep.notify();
		} finally {
			Pe();
		}
	}
};
function Ye(e) {
	if (e.dep.sc++, e.sub.flags & 4) {
		let t = e.dep.computed;
		if (t && !e.dep.subs) {
			t.flags |= 20;
			for (let e = t.deps; e; e = e.nextDep) Ye(e);
		}
		let n = e.dep.subs;
		n !== e && (e.prevSub = n, n && (n.nextSub = e)), e.dep.subs = e;
	}
}
var Xe = /* @__PURE__ */ new WeakMap(), Ze = /* @__PURE__ */ Symbol(""), Qe = /* @__PURE__ */ Symbol(""), $e = /* @__PURE__ */ Symbol("");
function M(e, t, n) {
	if (Ve && j) {
		let t = Xe.get(e);
		t || Xe.set(e, t = /* @__PURE__ */ new Map());
		let r = t.get(n);
		r || (t.set(n, r = new Je()), r.map = t, r.key = n), r.track();
	}
}
function et(e, t, n, r, i, a) {
	let o = Xe.get(e);
	if (!o) {
		Ke++;
		return;
	}
	let s = (e) => {
		e && e.trigger();
	};
	if (Ne(), t === "clear") o.forEach(s);
	else {
		let i = d(e), a = i && te(n);
		if (i && n === "length") {
			let e = Number(r);
			o.forEach((t, n) => {
				(n === "length" || n === $e || !_(n) && n >= e) && s(t);
			});
		} else switch ((n !== void 0 || o.has(void 0)) && s(o.get(n)), a && s(o.get($e)), t) {
			case "add":
				i ? a && s(o.get("length")) : (s(o.get(Ze)), f(e) && s(o.get(Qe)));
				break;
			case "delete":
				i || (s(o.get(Ze)), f(e) && s(o.get(Qe)));
				break;
			case "set":
				f(e) && s(o.get(Ze));
				break;
		}
	}
	Pe();
}
function tt(e) {
	let t = /* @__PURE__ */ N(e);
	return t === e ? t : (M(t, "iterate", $e), /* @__PURE__ */ Bt(e) ? t : t.map(Ut));
}
function nt(e) {
	return M(e = /* @__PURE__ */ N(e), "iterate", $e), e;
}
function rt(e, t) {
	return /* @__PURE__ */ zt(e) ? Wt(/* @__PURE__ */ Rt(e) ? Ut(t) : t) : Ut(t);
}
var it = {
	__proto__: null,
	[Symbol.iterator]() {
		return at(this, Symbol.iterator, (e) => rt(this, e));
	},
	concat(...e) {
		return tt(this).concat(...e.map((e) => d(e) ? tt(e) : e));
	},
	entries() {
		return at(this, "entries", (e) => (e[1] = rt(this, e[1]), e));
	},
	every(e, t) {
		return st(this, "every", e, t, void 0, arguments);
	},
	filter(e, t) {
		return st(this, "filter", e, t, (e) => e.map((e) => rt(this, e)), arguments);
	},
	find(e, t) {
		return st(this, "find", e, t, (e) => rt(this, e), arguments);
	},
	findIndex(e, t) {
		return st(this, "findIndex", e, t, void 0, arguments);
	},
	findLast(e, t) {
		return st(this, "findLast", e, t, (e) => rt(this, e), arguments);
	},
	findLastIndex(e, t) {
		return st(this, "findLastIndex", e, t, void 0, arguments);
	},
	forEach(e, t) {
		return st(this, "forEach", e, t, void 0, arguments);
	},
	includes(...e) {
		return lt(this, "includes", e);
	},
	indexOf(...e) {
		return lt(this, "indexOf", e);
	},
	join(e) {
		return tt(this).join(e);
	},
	lastIndexOf(...e) {
		return lt(this, "lastIndexOf", e);
	},
	map(e, t) {
		return st(this, "map", e, t, void 0, arguments);
	},
	pop() {
		return ut(this, "pop");
	},
	push(...e) {
		return ut(this, "push", e);
	},
	reduce(e, ...t) {
		return ct(this, "reduce", e, t);
	},
	reduceRight(e, ...t) {
		return ct(this, "reduceRight", e, t);
	},
	shift() {
		return ut(this, "shift");
	},
	some(e, t) {
		return st(this, "some", e, t, void 0, arguments);
	},
	splice(...e) {
		return ut(this, "splice", e);
	},
	toReversed() {
		return tt(this).toReversed();
	},
	toSorted(e) {
		return tt(this).toSorted(e);
	},
	toSpliced(...e) {
		return tt(this).toSpliced(...e);
	},
	unshift(...e) {
		return ut(this, "unshift", e);
	},
	values() {
		return at(this, "values", (e) => rt(this, e));
	}
};
function at(e, t, n) {
	let r = nt(e), i = r[t]();
	return r !== e && !/* @__PURE__ */ Bt(e) && (i._next = i.next, i.next = () => {
		let e = i._next();
		return e.done || (e.value = n(e.value)), e;
	}), i;
}
var ot = Array.prototype;
function st(e, t, n, r, i, a) {
	let o = nt(e), s = o !== e && !/* @__PURE__ */ Bt(e), c = o[t];
	if (c !== ot[t]) {
		let t = c.apply(e, a);
		return s ? Ut(t) : t;
	}
	let l = n;
	o !== e && (s ? l = function(t, r) {
		return n.call(this, rt(e, t), r, e);
	} : n.length > 2 && (l = function(t, r) {
		return n.call(this, t, r, e);
	}));
	let u = c.call(o, l, r);
	return s && i ? i(u) : u;
}
function ct(e, t, n, r) {
	let i = nt(e), a = i !== e && !/* @__PURE__ */ Bt(e), o = n, s = !1;
	i !== e && (a ? (s = r.length === 0, o = function(t, r, i) {
		return s && (s = !1, t = rt(e, t)), n.call(this, t, rt(e, r), i, e);
	}) : n.length > 3 && (o = function(t, r, i) {
		return n.call(this, t, r, i, e);
	}));
	let c = i[t](o, ...r);
	return s ? rt(e, c) : c;
}
function lt(e, t, n) {
	let r = /* @__PURE__ */ N(e);
	M(r, "iterate", $e);
	let i = r[t](...n);
	return (i === -1 || i === !1) && /* @__PURE__ */ Vt(n[0]) ? (n[0] = /* @__PURE__ */ N(n[0]), r[t](...n)) : i;
}
function ut(e, t, n = []) {
	Ue(), Ne();
	let r = (/* @__PURE__ */ N(e))[t].apply(e, n);
	return Pe(), We(), r;
}
var dt = /* @__PURE__ */ e("__proto__,__v_isRef,__isVue"), ft = new Set(/* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(_));
function pt(e) {
	_(e) || (e = String(e));
	let t = /* @__PURE__ */ N(this);
	return M(t, "has", e), t.hasOwnProperty(e);
}
var mt = class {
	constructor(e = !1, t = !1) {
		this._isReadonly = e, this._isShallow = t;
	}
	get(e, t, n) {
		if (t === "__v_skip") return e.__v_skip;
		let r = this._isReadonly, i = this._isShallow;
		if (t === "__v_isReactive") return !r;
		if (t === "__v_isReadonly") return r;
		if (t === "__v_isShallow") return i;
		if (t === "__v_raw") return n === (r ? i ? Mt : jt : i ? At : kt).get(e) || Object.getPrototypeOf(e) === Object.getPrototypeOf(n) ? e : void 0;
		let a = d(e);
		if (!r) {
			let e;
			if (a && (e = it[t])) return e;
			if (t === "hasOwnProperty") return pt;
		}
		let o = Reflect.get(e, t, /* @__PURE__ */ Gt(e) ? e : n);
		if ((_(t) ? ft.has(t) : dt(t)) || (r || M(e, "get", t), i)) return o;
		if (/* @__PURE__ */ Gt(o)) {
			let e = a && te(t) ? o : o.value;
			return r && v(e) ? /* @__PURE__ */ It(e) : e;
		}
		return v(o) ? r ? /* @__PURE__ */ It(o) : /* @__PURE__ */ Pt(o) : o;
	}
}, ht = class extends mt {
	constructor(e = !1) {
		super(!1, e);
	}
	set(e, t, n, r) {
		let i = e[t], a = d(e) && te(t);
		if (!this._isShallow) {
			let e = /* @__PURE__ */ zt(i);
			if (!/* @__PURE__ */ Bt(n) && !/* @__PURE__ */ zt(n) && (i = /* @__PURE__ */ N(i), n = /* @__PURE__ */ N(n)), !a && /* @__PURE__ */ Gt(i) && !/* @__PURE__ */ Gt(n)) return e || (i.value = n), !0;
		}
		let o = a ? Number(t) < e.length : u(e, t), s = Reflect.set(e, t, n, /* @__PURE__ */ Gt(e) ? e : r);
		return e === /* @__PURE__ */ N(r) && s && (o ? T(n, i) && et(e, "set", t, n, i) : et(e, "add", t, n)), s;
	}
	deleteProperty(e, t) {
		let n = u(e, t), r = e[t], i = Reflect.deleteProperty(e, t);
		return i && n && et(e, "delete", t, void 0, r), i;
	}
	has(e, t) {
		let n = Reflect.has(e, t);
		return (!_(t) || !ft.has(t)) && M(e, "has", t), n;
	}
	ownKeys(e) {
		return M(e, "iterate", d(e) ? "length" : Ze), Reflect.ownKeys(e);
	}
}, gt = class extends mt {
	constructor(e = !1) {
		super(!0, e);
	}
	set(e, t) {
		return !0;
	}
	deleteProperty(e, t) {
		return !0;
	}
}, _t = /* @__PURE__ */ new ht(), vt = /* @__PURE__ */ new gt(), yt = /* @__PURE__ */ new ht(!0), bt = (e) => e, xt = (e) => Reflect.getPrototypeOf(e);
function St(e, t, n) {
	return function(...r) {
		let i = this.__v_raw, a = /* @__PURE__ */ N(i), o = f(a), c = e === "entries" || e === Symbol.iterator && o, l = e === "keys" && o, u = i[e](...r), d = n ? bt : t ? Wt : Ut;
		return !t && M(a, "iterate", l ? Qe : Ze), s(Object.create(u), { next() {
			let { value: e, done: t } = u.next();
			return t ? {
				value: e,
				done: t
			} : {
				value: c ? [d(e[0]), d(e[1])] : d(e),
				done: t
			};
		} });
	};
}
function Ct(e) {
	return function(...t) {
		return e === "delete" ? !1 : e === "clear" ? void 0 : this;
	};
}
function wt(e, t) {
	let n = {
		get(n) {
			let r = this.__v_raw, i = /* @__PURE__ */ N(r), a = /* @__PURE__ */ N(n);
			e || (T(n, a) && M(i, "get", n), M(i, "get", a));
			let { has: o } = xt(i), s = t ? bt : e ? Wt : Ut;
			if (o.call(i, n)) return s(r.get(n));
			if (o.call(i, a)) return s(r.get(a));
			r !== i && r.get(n);
		},
		get size() {
			let t = this.__v_raw;
			return !e && M(/* @__PURE__ */ N(t), "iterate", Ze), t.size;
		},
		has(t) {
			let n = this.__v_raw, r = /* @__PURE__ */ N(n), i = /* @__PURE__ */ N(t);
			return e || (T(t, i) && M(r, "has", t), M(r, "has", i)), t === i ? n.has(t) : n.has(t) || n.has(i);
		},
		forEach(n, r) {
			let i = this, a = i.__v_raw, o = /* @__PURE__ */ N(a), s = t ? bt : e ? Wt : Ut;
			return !e && M(o, "iterate", Ze), a.forEach((e, t) => n.call(r, s(e), s(t), i));
		}
	};
	return s(n, e ? {
		add: Ct("add"),
		set: Ct("set"),
		delete: Ct("delete"),
		clear: Ct("clear")
	} : {
		add(e) {
			let n = /* @__PURE__ */ N(this), r = xt(n), i = /* @__PURE__ */ N(e), a = !t && !/* @__PURE__ */ Bt(e) && !/* @__PURE__ */ zt(e) ? i : e;
			return r.has.call(n, a) || T(e, a) && r.has.call(n, e) || T(i, a) && r.has.call(n, i) || (n.add(a), et(n, "add", a, a)), this;
		},
		set(e, n) {
			!t && !/* @__PURE__ */ Bt(n) && !/* @__PURE__ */ zt(n) && (n = /* @__PURE__ */ N(n));
			let r = /* @__PURE__ */ N(this), { has: i, get: a } = xt(r), o = i.call(r, e);
			o ||= (e = /* @__PURE__ */ N(e), i.call(r, e));
			let s = a.call(r, e);
			return r.set(e, n), o ? T(n, s) && et(r, "set", e, n, s) : et(r, "add", e, n), this;
		},
		delete(e) {
			let t = /* @__PURE__ */ N(this), { has: n, get: r } = xt(t), i = n.call(t, e);
			i ||= (e = /* @__PURE__ */ N(e), n.call(t, e));
			let a = r ? r.call(t, e) : void 0, o = t.delete(e);
			return i && et(t, "delete", e, void 0, a), o;
		},
		clear() {
			let e = /* @__PURE__ */ N(this), t = e.size !== 0, n = e.clear();
			return t && et(e, "clear", void 0, void 0, void 0), n;
		}
	}), [
		"keys",
		"values",
		"entries",
		Symbol.iterator
	].forEach((r) => {
		n[r] = St(r, e, t);
	}), n;
}
function Tt(e, t) {
	let n = wt(e, t);
	return (t, r, i) => r === "__v_isReactive" ? !e : r === "__v_isReadonly" ? e : r === "__v_raw" ? t : Reflect.get(u(n, r) && r in t ? n : t, r, i);
}
var Et = { get: /* @__PURE__ */ Tt(!1, !1) }, Dt = { get: /* @__PURE__ */ Tt(!1, !0) }, Ot = { get: /* @__PURE__ */ Tt(!0, !1) }, kt = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), jt = /* @__PURE__ */ new WeakMap(), Mt = /* @__PURE__ */ new WeakMap();
function Nt(e) {
	switch (e) {
		case "Object":
		case "Array": return 1;
		case "Map":
		case "Set":
		case "WeakMap":
		case "WeakSet": return 2;
		default: return 0;
	}
}
// @__NO_SIDE_EFFECTS__
function Pt(e) {
	return /* @__PURE__ */ zt(e) ? e : Lt(e, !1, _t, Et, kt);
}
// @__NO_SIDE_EFFECTS__
function Ft(e) {
	return Lt(e, !1, yt, Dt, At);
}
// @__NO_SIDE_EFFECTS__
function It(e) {
	return Lt(e, !0, vt, Ot, jt);
}
function Lt(e, t, n, r, i) {
	if (!v(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e)) return e;
	let a = i.get(e);
	if (a) return a;
	let o = Nt(ee(e));
	if (o === 0) return e;
	let s = new Proxy(e, o === 2 ? r : n);
	return i.set(e, s), s;
}
// @__NO_SIDE_EFFECTS__
function Rt(e) {
	return /* @__PURE__ */ zt(e) ? /* @__PURE__ */ Rt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function zt(e) {
	return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
	return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function Vt(e) {
	return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function N(e) {
	let t = e && e.__v_raw;
	return t ? /* @__PURE__ */ N(t) : e;
}
function Ht(e) {
	return !u(e, "__v_skip") && Object.isExtensible(e) && E(e, "__v_skip", !0), e;
}
var Ut = (e) => v(e) ? /* @__PURE__ */ Pt(e) : e, Wt = (e) => v(e) ? /* @__PURE__ */ It(e) : e;
// @__NO_SIDE_EFFECTS__
function Gt(e) {
	return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Kt(e) {
	return qt(e, !1);
}
function qt(e, t) {
	return /* @__PURE__ */ Gt(e) ? e : new Jt(e, t);
}
var Jt = class {
	constructor(e, t) {
		this.dep = new Je(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = t ? e : /* @__PURE__ */ N(e), this._value = t ? e : Ut(e), this.__v_isShallow = t;
	}
	get value() {
		return this.dep.track(), this._value;
	}
	set value(e) {
		let t = this._rawValue, n = this.__v_isShallow || /* @__PURE__ */ Bt(e) || /* @__PURE__ */ zt(e);
		e = n ? e : /* @__PURE__ */ N(e), T(e, t) && (this._rawValue = e, this._value = n ? e : Ut(e), this.dep.trigger());
	}
};
function Yt(e) {
	return /* @__PURE__ */ Gt(e) ? e.value : e;
}
var Xt = {
	get: (e, t, n) => t === "__v_raw" ? e : Yt(Reflect.get(e, t, n)),
	set: (e, t, n, r) => {
		let i = e[t];
		return /* @__PURE__ */ Gt(i) && !/* @__PURE__ */ Gt(n) ? (i.value = n, !0) : Reflect.set(e, t, n, r);
	}
};
function Zt(e) {
	return /* @__PURE__ */ Rt(e) ? e : new Proxy(e, Xt);
}
var Qt = class {
	constructor(e, t, n) {
		this.fn = e, this.setter = t, this._value = void 0, this.dep = new Je(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Ke - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !t, this.isSSR = n;
	}
	notify() {
		if (this.flags |= 16, !(this.flags & 8) && j !== this) return Me(this, !0), !0;
	}
	get value() {
		let e = this.dep.track();
		return Re(this), e && (e.version = this.dep.version), this._value;
	}
	set value(e) {
		this.setter && this.setter(e);
	}
};
// @__NO_SIDE_EFFECTS__
function $t(e, t, n = !1) {
	let r, i;
	return h(e) ? r = e : (r = e.get, i = e.set), new Qt(r, i, n);
}
var en = {}, tn = /* @__PURE__ */ new WeakMap(), nn = void 0;
function rn(e, t = !1, n = nn) {
	if (n) {
		let t = tn.get(n);
		t || tn.set(n, t = []), t.push(e);
	}
}
function an(e, n, i = t) {
	let { immediate: a, deep: o, once: s, scheduler: l, augmentJob: u, call: f } = i, p = (e) => o ? e : /* @__PURE__ */ Bt(e) || o === !1 || o === 0 ? on(e, 1) : on(e), m, g, _, v, y = !1, b = !1;
	if (/* @__PURE__ */ Gt(e) ? (g = () => e.value, y = /* @__PURE__ */ Bt(e)) : /* @__PURE__ */ Rt(e) ? (g = () => p(e), y = !0) : d(e) ? (b = !0, y = e.some((e) => /* @__PURE__ */ Rt(e) || /* @__PURE__ */ Bt(e)), g = () => e.map((e) => {
		if (/* @__PURE__ */ Gt(e)) return e.value;
		if (/* @__PURE__ */ Rt(e)) return p(e);
		if (h(e)) return f ? f(e, 2) : e();
	})) : g = h(e) ? n ? f ? () => f(e, 2) : e : () => {
		if (_) {
			Ue();
			try {
				_();
			} finally {
				We();
			}
		}
		let t = nn;
		nn = m;
		try {
			return f ? f(e, 3, [v]) : e(v);
		} finally {
			nn = t;
		}
	} : r, n && o) {
		let e = g, t = o === !0 ? Infinity : o;
		g = () => on(e(), t);
	}
	let x = Ee(), ee = () => {
		m.stop(), x && x.active && c(x.effects, m);
	};
	if (s && n) {
		let e = n;
		n = (...t) => {
			let n = e(...t);
			return ee(), n;
		};
	}
	let S = b ? Array(e.length).fill(en) : en, te = (e) => {
		if (!(!(m.flags & 1) || !m.dirty && !e)) if (n) {
			let t = m.run();
			if (e || o || y || (b ? t.some((e, t) => T(e, S[t])) : T(t, S))) {
				_ && _();
				let e = nn;
				nn = m;
				try {
					let e = [
						t,
						S === en ? void 0 : b && S[0] === en ? [] : S,
						v
					];
					S = t, f ? f(n, 3, e) : n(...e);
				} finally {
					nn = e;
				}
			}
		} else m.run();
	};
	return u && u(te), m = new Oe(g), m.scheduler = l ? () => l(te, !1) : te, v = (e) => rn(e, !1, m), _ = m.onStop = () => {
		let e = tn.get(m);
		if (e) {
			if (f) f(e, 4);
			else for (let t of e) t();
			tn.delete(m);
		}
	}, n ? a ? te(!0) : S = m.run() : l ? l(te.bind(null, !0), !0) : m.run(), ee.pause = m.pause.bind(m), ee.resume = m.resume.bind(m), ee.stop = ee, ee;
}
function on(e, t = Infinity, n) {
	if (t <= 0 || !v(e) || e.__v_skip || (n ||= /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t)) return e;
	if (n.set(e, t), t--, /* @__PURE__ */ Gt(e)) on(e.value, t, n);
	else if (d(e)) for (let r = 0; r < e.length; r++) on(e[r], t, n);
	else if (p(e) || f(e)) e.forEach((e) => {
		on(e, t, n);
	});
	else if (S(e)) {
		for (let r in e) on(e[r], t, n);
		for (let r of Object.getOwnPropertySymbols(e)) Object.prototype.propertyIsEnumerable.call(e, r) && on(e[r], t, n);
	}
	return e;
}
//#endregion
//#region node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js
function sn(e, t, n, r) {
	try {
		return r ? e(...r) : e();
	} catch (e) {
		ln(e, t, n);
	}
}
function cn(e, t, n, r) {
	if (h(e)) {
		let i = sn(e, t, n, r);
		return i && y(i) && i.catch((e) => {
			ln(e, t, n);
		}), i;
	}
	if (d(e)) {
		let i = [];
		for (let a = 0; a < e.length; a++) i.push(cn(e[a], t, n, r));
		return i;
	}
}
function ln(e, n, r, i = !0) {
	let a = n ? n.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: s } = n && n.appContext.config || t;
	if (n) {
		let t = n.parent, i = n.proxy, a = `https://vuejs.org/error-reference/#runtime-${r}`;
		for (; t;) {
			let n = t.ec;
			if (n) {
				for (let t = 0; t < n.length; t++) if (n[t](e, i, a) === !1) return;
			}
			t = t.parent;
		}
		if (o) {
			Ue(), sn(o, null, 10, [
				e,
				i,
				a
			]), We();
			return;
		}
	}
	un(e, r, a, i, s);
}
function un(e, t, n, r = !0, i = !1) {
	if (i) throw e;
	console.error(e);
}
var dn = [], fn = -1, pn = [], mn = null, hn = 0, gn = /* @__PURE__ */ Promise.resolve(), _n = null;
function vn(e) {
	let t = _n || gn;
	return e ? t.then(this ? e.bind(this) : e) : t;
}
function yn(e) {
	let t = fn + 1, n = dn.length;
	for (; t < n;) {
		let r = t + n >>> 1, i = dn[r], a = Tn(i);
		a < e || a === e && i.flags & 2 ? t = r + 1 : n = r;
	}
	return t;
}
function bn(e) {
	if (!(e.flags & 1)) {
		let t = Tn(e), n = dn[dn.length - 1];
		!n || !(e.flags & 2) && t >= Tn(n) ? dn.push(e) : dn.splice(yn(t), 0, e), e.flags |= 1, xn();
	}
}
function xn() {
	_n ||= gn.then(En);
}
function Sn(e) {
	d(e) ? pn.push(...e) : mn && e.id === -1 ? mn.splice(hn + 1, 0, e) : e.flags & 1 || (pn.push(e), e.flags |= 1), xn();
}
function Cn(e, t, n = fn + 1) {
	for (; n < dn.length; n++) {
		let t = dn[n];
		if (t && t.flags & 2) {
			if (e && t.id !== e.uid) continue;
			dn.splice(n, 1), n--, t.flags & 4 && (t.flags &= -2), t(), t.flags & 4 || (t.flags &= -2);
		}
	}
}
function wn(e) {
	if (pn.length) {
		let e = [...new Set(pn)].sort((e, t) => Tn(e) - Tn(t));
		if (pn.length = 0, mn) {
			mn.push(...e);
			return;
		}
		for (mn = e, hn = 0; hn < mn.length; hn++) {
			let e = mn[hn];
			e.flags & 4 && (e.flags &= -2), e.flags & 8 || e(), e.flags &= -2;
		}
		mn = null, hn = 0;
	}
}
var Tn = (e) => e.id == null ? e.flags & 2 ? -1 : Infinity : e.id;
function En(e) {
	try {
		for (fn = 0; fn < dn.length; fn++) {
			let e = dn[fn];
			e && !(e.flags & 8) && (e.flags & 4 && (e.flags &= -2), sn(e, e.i, e.i ? 15 : 14), e.flags & 4 || (e.flags &= -2));
		}
	} finally {
		for (; fn < dn.length; fn++) {
			let e = dn[fn];
			e && (e.flags &= -2);
		}
		fn = -1, dn.length = 0, wn(e), _n = null, (dn.length || pn.length) && En(e);
	}
}
var Dn = null, On = null;
function kn(e) {
	let t = Dn;
	return Dn = e, On = e && e.type.__scopeId || null, t;
}
function An(e, t = Dn, n) {
	if (!t || e._n) return e;
	let r = (...n) => {
		r._d && Zi(-1);
		let i = kn(t), a = qi.length, o;
		try {
			o = e(...n);
		} finally {
			for (let e = qi.length; e > a; e--) Yi();
			kn(i), r._d && Zi(1);
		}
		return o;
	};
	return r._n = !0, r._c = !0, r._d = !0, r;
}
function jn(e, n) {
	if (Dn === null) return e;
	let r = Fa(Dn), i = e.dirs ||= [];
	for (let e = 0; e < n.length; e++) {
		let [a, o, s, c = t] = n[e];
		a && (h(a) && (a = {
			mounted: a,
			updated: a
		}), a.deep && on(o), i.push({
			dir: a,
			instance: r,
			value: o,
			oldValue: void 0,
			arg: s,
			modifiers: c
		}));
	}
	return e;
}
function Mn(e, t, n, r) {
	let i = e.dirs, a = t && t.dirs;
	for (let o = 0; o < i.length; o++) {
		let s = i[o];
		a && (s.oldValue = a[o].value);
		let c = s.dir[r];
		c && (Ue(), cn(c, n, 8, [
			e.el,
			s,
			e,
			t
		]), We());
	}
}
function Nn(e, t) {
	if (ya) {
		let n = ya.provides, r = ya.parent && ya.parent.provides;
		r === n && (n = ya.provides = Object.create(r)), n[e] = t;
	}
}
function Pn(e, t, n = !1) {
	let r = ba();
	if (r || ei) {
		let i = ei ? ei._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
		if (i && e in i) return i[e];
		if (arguments.length > 1) return n && h(t) ? t.call(r && r.proxy) : t;
	}
}
var Fn = /* @__PURE__ */ Symbol.for("v-scx"), In = () => Pn(Fn);
function Ln(e, t, n) {
	return Rn(e, t, n);
}
function Rn(e, n, i = t) {
	let { immediate: a, deep: o, flush: c, once: l } = i, u = s({}, i), d = n && a || !n && c !== "post", f;
	if (Ea) {
		if (c === "sync") {
			let e = In();
			f = e.__watcherHandles ||= [];
		} else if (!d) {
			let e = () => {};
			return e.stop = r, e.resume = r, e.pause = r, e;
		}
	}
	let p = ya;
	u.call = (e, t, n) => cn(e, p, t, n);
	let m = !1;
	c === "post" ? u.scheduler = (e) => {
		ji(e, p && p.suspense);
	} : c !== "sync" && (m = !0, u.scheduler = (e, t) => {
		t ? e() : bn(e);
	}), u.augmentJob = (e) => {
		n && (e.flags |= 4), m && (e.flags |= 2, p && (e.id = p.uid, e.i = p));
	};
	let h = an(e, n, u);
	return Ea && (f ? f.push(h) : d && h()), h;
}
function zn(e, t, n) {
	let r = this.proxy, i = g(e) ? e.includes(".") ? Bn(r, e) : () => r[e] : e.bind(r, r), a;
	h(t) ? a = t : (a = t.handler, n = t);
	let o = Ca(this), s = Rn(i, a.bind(r), n);
	return o(), s;
}
function Bn(e, t) {
	let n = t.split(".");
	return () => {
		let t = e;
		for (let e = 0; e < n.length && t; e++) t = t[n[e]];
		return t;
	};
}
var Vn = /* @__PURE__ */ new WeakMap(), Hn = /* @__PURE__ */ Symbol("_vte"), Un = (e) => e.__isTeleport, Wn = (e) => e && (e.disabled || e.disabled === ""), Gn = (e) => e && (e.defer || e.defer === ""), Kn = (e) => typeof SVGElement < "u" && e instanceof SVGElement, qn = (e) => typeof MathMLElement == "function" && e instanceof MathMLElement, Jn = (e, t) => {
	let n = e && e.to;
	return g(n) ? t ? t(n) : null : n;
}, Yn = {
	name: "Teleport",
	__isTeleport: !0,
	process(e, t, n, r, i, a, o, s, c, l) {
		let { mc: u, pc: d, pbc: f, o: { insert: p, querySelector: m, createText: h, createComment: g, parentNode: _ } } = l, v = Wn(t.props), { dynamicChildren: y } = t, b = (e, t, n) => {
			e.shapeFlag & 16 && u(e.children, t, n, i, a, o, s, c);
		}, x = (e = t) => {
			let n = Wn(e.props), r = e.target = Jn(e.props, m), a = er(r, e, h, p);
			r && (o !== "svg" && Kn(r) ? o = "svg" : o !== "mathml" && qn(r) && (o = "mathml"), i && i.isCE && (i.ce._teleportTargets || (i.ce._teleportTargets = /* @__PURE__ */ new Set())).add(r), n || (b(e, r, a), $n(e, !1)));
		}, ee = (e) => {
			let t = () => {
				if (Vn.get(e) === t) {
					if (Vn.delete(e), Wn(e.props)) {
						let t = _(e.el) || n;
						b(e, t, e.anchor), $n(e, !0);
					}
					x(e);
				}
			};
			Vn.set(e, t), ji(t, a);
		};
		if (e == null) {
			let e = t.el = h(""), i = t.anchor = h("");
			if (p(e, n, r), p(i, n, r), Gn(t.props) || a && a.pendingBranch) {
				ee(t);
				return;
			}
			v && (b(t, n, i), $n(t, !0)), x();
		} else {
			t.el = e.el;
			let r = t.anchor = e.anchor, u = Vn.get(e);
			if (u) {
				u.flags |= 8, Vn.delete(e), ee(t);
				return;
			}
			t.targetStart = e.targetStart;
			let p = t.target = e.target, h = t.targetAnchor = e.targetAnchor, g = Wn(e.props), _ = g ? n : p, b = g ? r : h;
			if (o === "svg" || Kn(p) ? o = "svg" : (o === "mathml" || qn(p)) && (o = "mathml"), y ? (f(e.dynamicChildren, y, _, i, a, o, s), Li(e, t, !0)) : c || d(e, t, _, b, i, a, o, s, !1), v) g ? t.props && e.props && t.props.to !== e.props.to && (t.props.to = e.props.to) : Xn(t, n, r, l, 1);
			else if ((t.props && t.props.to) !== (e.props && e.props.to)) {
				let e = Jn(t.props, m);
				e && (t.target = e, Xn(t, e, null, l, 0));
			} else g && Xn(t, p, h, l, 1);
			$n(t, v);
		}
	},
	remove(e, t, n, { um: r, o: { remove: i } }, a) {
		let { shapeFlag: o, children: s, anchor: c, targetStart: l, targetAnchor: u, target: d, props: f } = e, p = Wn(f), m = a || !p, h = Vn.get(e);
		if (h && (h.flags |= 8, Vn.delete(e)), d && (i(l), i(u)), a && i(c), !h && (p || d) && o & 16) for (let e = 0; e < s.length; e++) {
			let i = s[e];
			r(i, t, n, m, !!i.dynamicChildren);
		}
	},
	move: Xn,
	hydrate: Zn
};
function Xn(e, t, n, { o: { insert: r }, m: i }, a = 2) {
	a === 0 && r(e.targetAnchor, t, n);
	let { el: o, anchor: s, shapeFlag: c, children: l, props: u } = e, d = a === 2;
	if (d && r(o, t, n), !Vn.has(e) && (!d || Wn(u)) && c & 16) for (let e = 0; e < l.length; e++) i(l[e], t, n, 2);
	d && r(s, t, n);
}
function Zn(e, t, n, r, i, a, { o: { nextSibling: o, parentNode: s, querySelector: c, insert: l, createText: u } }, d) {
	function f(e, n) {
		let r = n;
		for (; r;) {
			if (r && r.nodeType === 8) {
				if (r.data === "teleport start anchor") t.targetStart = r;
				else if (r.data === "teleport anchor") {
					t.targetAnchor = r, e._lpa = t.targetAnchor && o(t.targetAnchor);
					break;
				}
			}
			r = o(r);
		}
	}
	function p(e, t) {
		t.anchor = d(o(e), t, s(e), n, r, i, a);
	}
	let m = t.target = Jn(t.props, c), h = Wn(t.props);
	if (m) {
		let c = m._lpa || m.firstChild;
		t.shapeFlag & 16 && (h ? (p(e, t), f(m, c), t.targetAnchor || er(m, t, u, l, s(e) === m ? e : null)) : (t.anchor = o(e), f(m, c), t.targetAnchor || er(m, t, u, l), d(c && o(c), t, m, n, r, i, a))), $n(t, h);
	} else h && t.shapeFlag & 16 && (p(e, t), t.targetStart = e, t.targetAnchor = o(e));
	return t.anchor && o(t.anchor);
}
var Qn = Yn;
function $n(e, t) {
	let n = e.ctx;
	if (n && n.ut) {
		let r, i;
		for (t ? (r = e.el, i = e.anchor) : (r = e.targetStart, i = e.targetAnchor); r && r !== i;) r.nodeType === 1 && r.setAttribute("data-v-owner", n.uid), r = r.nextSibling;
		n.ut();
	}
}
function er(e, t, n, r, i = null) {
	let a = t.targetStart = n(""), o = t.targetAnchor = n("");
	return a[Hn] = o, e && (r(a, e, i), r(o, e, i)), o;
}
var tr = /* @__PURE__ */ Symbol("_leaveCb");
function nr(e, t) {
	e.shapeFlag & 6 && e.component ? (e.transition = t, nr(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function rr(e, t) {
	return h(e) ? /* @__PURE__ */ s({ name: e.name }, t, { setup: e }) : e;
}
function ir(e) {
	e.ids = [
		e.ids[0] + e.ids[2]++ + "-",
		0,
		0
	];
}
function ar(e, t) {
	let n;
	return !!((n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable);
}
var or = /* @__PURE__ */ new WeakMap();
function sr(e, n, r, a, o = !1) {
	if (d(e)) {
		e.forEach((e, t) => sr(e, n && (d(n) ? n[t] : n), r, a, o));
		return;
	}
	if (lr(a) && !o) {
		a.shapeFlag & 512 && a.type.__asyncResolved && a.component.subTree.component && sr(e, n, r, a.component.subTree);
		return;
	}
	let s = a.shapeFlag & 4 ? Fa(a.component) : a.el, l = o ? null : s, { i: f, r: p } = e, m = n && n.r, _ = f.refs === t ? f.refs = {} : f.refs, v = f.setupState, y = /* @__PURE__ */ N(v), b = v === t ? i : (e) => !ar(_, e) && u(y, e), x = (e, t) => !(t && ar(_, t));
	if (m != null && m !== p) {
		if (cr(n), g(m)) _[m] = null, b(m) && (v[m] = null);
		else if (/* @__PURE__ */ Gt(m)) {
			let e = n;
			x(m, e.k) && (m.value = null), e.k && (_[e.k] = null);
		}
	}
	if (h(p)) sn(p, f, 12, [l, _]);
	else {
		let t = g(p), n = /* @__PURE__ */ Gt(p);
		if (t || n) {
			let i = () => {
				if (e.f) {
					let n = t ? b(p) ? v[p] : _[p] : x(p) || !e.k ? p.value : _[e.k];
					if (o) d(n) && c(n, s);
					else if (d(n)) n.includes(s) || n.push(s);
					else if (t) _[p] = [s], b(p) && (v[p] = _[p]);
					else {
						let t = [s];
						x(p, e.k) && (p.value = t), e.k && (_[e.k] = t);
					}
				} else t ? (_[p] = l, b(p) && (v[p] = l)) : n && (x(p, e.k) && (p.value = l), e.k && (_[e.k] = l));
			};
			if (l) {
				let t = () => {
					i(), or.delete(e);
				};
				t.id = -1, or.set(e, t), ji(t, r);
			} else cr(e), i();
		}
	}
}
function cr(e) {
	let t = or.get(e);
	t && (t.flags |= 8, or.delete(e));
}
ue().requestIdleCallback, ue().cancelIdleCallback;
var lr = (e) => !!e.type.__asyncLoader, ur = (e) => e.type.__isKeepAlive;
function dr(e, t) {
	pr(e, "a", t);
}
function fr(e, t) {
	pr(e, "da", t);
}
function pr(e, t, n = ya) {
	let r = e.__wdc ||= () => {
		let t = n;
		for (; t;) {
			if (t.isDeactivated) return;
			t = t.parent;
		}
		return e();
	};
	if (hr(t, r, n), n) {
		let e = n.parent;
		for (; e && e.parent;) ur(e.parent.vnode) && mr(r, t, n, e), e = e.parent;
	}
}
function mr(e, t, n, r) {
	let i = hr(t, e, r, !0);
	Sr(() => {
		c(r[t], i);
	}, n);
}
function hr(e, t, n = ya, r = !1) {
	if (n) {
		let i = n[e] || (n[e] = []), a = t.__weh ||= (...r) => {
			Ue();
			let i = Ca(n), a = cn(t, n, e, r);
			return i(), We(), a;
		};
		return r ? i.unshift(a) : i.push(a), a;
	}
}
var gr = (e) => (t, n = ya) => {
	(!Ea || e === "sp") && hr(e, (...e) => t(...e), n);
}, _r = gr("bm"), vr = gr("m"), yr = gr("bu"), br = gr("u"), xr = gr("bum"), Sr = gr("um"), Cr = gr("sp"), wr = gr("rtg"), Tr = gr("rtc");
function Er(e, t = ya) {
	hr("ec", e, t);
}
var Dr = /* @__PURE__ */ Symbol.for("v-ndc");
function Or(e, t, n, r) {
	let i, a = n && n[r], o = d(e);
	if (o || g(e)) {
		let n = o && /* @__PURE__ */ Rt(e), r = !1, s = !1;
		n && (r = !/* @__PURE__ */ Bt(e), s = /* @__PURE__ */ zt(e), e = nt(e)), i = Array(e.length);
		for (let n = 0, o = e.length; n < o; n++) i[n] = t(r ? s ? Wt(Ut(e[n])) : Ut(e[n]) : e[n], n, void 0, a && a[n]);
	} else if (typeof e == "number") {
		i = Array(e);
		for (let n = 0; n < e; n++) i[n] = t(n + 1, n, void 0, a && a[n]);
	} else if (v(e)) if (e[Symbol.iterator]) i = Array.from(e, (e, n) => t(e, n, void 0, a && a[n]));
	else {
		let n = Object.keys(e);
		i = Array(n.length);
		for (let r = 0, o = n.length; r < o; r++) {
			let o = n[r];
			i[r] = t(e[o], o, r, a && a[r]);
		}
	}
	else i = [];
	return n && (n[r] = i), i;
}
function kr(e, t, n = {}, r, i, a) {
	if (Dn.ce || Dn.parent && lr(Dn.parent) && Dn.parent.ce) {
		let e = a != null && n.key == null ? s({}, n, { key: a }) : n, i = Object.keys(e).length > 0;
		return t !== "default" && (e.name = t), F(), $i(P, null, [ia("slot", e, r && r())], i ? -2 : 64);
	}
	let o = e[t];
	o && o._c && (o._d = !1);
	let c = qi.length;
	F();
	let l;
	try {
		let i = o && Ar(o(n)), s = n.key || a || i && i.key;
		l = $i(P, { key: (s && !_(s) ? s : `_${t}`) + (!i && r ? "_fb" : "") }, i || (r ? r() : []), i && e._ === 1 ? 64 : -2);
	} catch (e) {
		for (let e = qi.length; e > c; e--) Yi();
		throw e;
	} finally {
		o && o._c && (o._d = !0);
	}
	return !i && l.scopeId && (l.slotScopeIds = [l.scopeId + "-s"]), l;
}
function Ar(e) {
	return e.some((e) => !ea(e) || !(e.type === Gi || e.type === P && !Ar(e.children))) ? e : null;
}
var jr = (e) => e ? Ta(e) ? Fa(e) : jr(e.parent) : null, Mr = /* @__PURE__ */ s(/* @__PURE__ */ Object.create(null), {
	$: (e) => e,
	$el: (e) => e.vnode.el,
	$data: (e) => e.data,
	$props: (e) => e.props,
	$attrs: (e) => e.attrs,
	$slots: (e) => e.slots,
	$refs: (e) => e.refs,
	$parent: (e) => jr(e.parent),
	$root: (e) => jr(e.root),
	$host: (e) => e.ce,
	$emit: (e) => e.emit,
	$options: (e) => Vr(e),
	$forceUpdate: (e) => e.f ||= () => {
		bn(e.update);
	},
	$nextTick: (e) => e.n ||= vn.bind(e.proxy),
	$watch: (e) => zn.bind(e)
}), Nr = (e, n) => e !== t && !e.__isScriptSetup && u(e, n), Pr = {
	get({ _: e }, n) {
		if (n === "__v_skip") return !0;
		let { ctx: r, setupState: i, data: a, props: o, accessCache: s, type: c, appContext: l } = e;
		if (n[0] !== "$") {
			let e = s[n];
			if (e !== void 0) switch (e) {
				case 1: return i[n];
				case 2: return a[n];
				case 4: return r[n];
				case 3: return o[n];
			}
			else if (Nr(i, n)) return s[n] = 1, i[n];
			else if (a !== t && u(a, n)) return s[n] = 2, a[n];
			else if (u(o, n)) return s[n] = 3, o[n];
			else if (r !== t && u(r, n)) return s[n] = 4, r[n];
			else Ir && (s[n] = 0);
		}
		let d = Mr[n], f, p;
		if (d) return n === "$attrs" && M(e.attrs, "get", ""), d(e);
		if ((f = c.__cssModules) && (f = f[n])) return f;
		if (r !== t && u(r, n)) return s[n] = 4, r[n];
		if (p = l.config.globalProperties, u(p, n)) return p[n];
	},
	set({ _: e }, n, r) {
		let { data: i, setupState: a, ctx: o } = e;
		return Nr(a, n) ? (a[n] = r, !0) : i !== t && u(i, n) ? (i[n] = r, !0) : u(e.props, n) || n[0] === "$" && n.slice(1) in e ? !1 : (o[n] = r, !0);
	},
	has({ _: { data: e, setupState: n, accessCache: r, ctx: i, appContext: a, props: o, type: s } }, c) {
		let l;
		return !!(r[c] || e !== t && c[0] !== "$" && u(e, c) || Nr(n, c) || u(o, c) || u(i, c) || u(Mr, c) || u(a.config.globalProperties, c) || (l = s.__cssModules) && l[c]);
	},
	defineProperty(e, t, n) {
		return n.get == null ? u(n, "value") && this.set(e, t, n.value, null) : e._.accessCache[t] = 0, Reflect.defineProperty(e, t, n);
	}
};
function Fr(e) {
	return d(e) ? e.reduce((e, t) => (e[t] = null, e), {}) : e;
}
var Ir = !0;
function Lr(e) {
	let t = Vr(e), n = e.proxy, i = e.ctx;
	Ir = !1, t.beforeCreate && zr(t.beforeCreate, e, "bc");
	let { data: a, computed: o, methods: s, watch: c, provide: l, inject: u, created: f, beforeMount: p, mounted: m, beforeUpdate: g, updated: _, activated: y, deactivated: b, beforeDestroy: x, beforeUnmount: ee, destroyed: S, unmounted: te, render: ne, renderTracked: re, renderTriggered: ie, errorCaptured: C, serverPrefetch: ae, expose: w, inheritAttrs: oe, components: se, directives: T, filters: ce } = t;
	if (u && Rr(u, i, null), s) for (let e in s) {
		let t = s[e];
		h(t) && (i[e] = t.bind(n));
	}
	if (a) {
		let t = a.call(n, n);
		v(t) && (e.data = /* @__PURE__ */ Pt(t));
	}
	if (Ir = !0, o) for (let e in o) {
		let t = o[e], a = R({
			get: h(t) ? t.bind(n, n) : h(t.get) ? t.get.bind(n, n) : r,
			set: !h(t) && h(t.set) ? t.set.bind(n) : r
		});
		Object.defineProperty(i, e, {
			enumerable: !0,
			configurable: !0,
			get: () => a.value,
			set: (e) => a.value = e
		});
	}
	if (c) for (let e in c) Br(c[e], i, n, e);
	if (l) {
		let e = h(l) ? l.call(n) : l;
		Reflect.ownKeys(e).forEach((t) => {
			Nn(t, e[t]);
		});
	}
	f && zr(f, e, "c");
	function E(e, t) {
		d(t) ? t.forEach((t) => e(t.bind(n))) : t && e(t.bind(n));
	}
	if (E(_r, p), E(vr, m), E(yr, g), E(br, _), E(dr, y), E(fr, b), E(Er, C), E(Tr, re), E(wr, ie), E(xr, ee), E(Sr, te), E(Cr, ae), d(w)) if (w.length) {
		let t = e.exposed ||= {};
		w.forEach((e) => {
			Object.defineProperty(t, e, {
				get: () => n[e],
				set: (t) => n[e] = t,
				enumerable: !0
			});
		});
	} else e.exposed ||= {};
	ne && e.render === r && (e.render = ne), oe != null && (e.inheritAttrs = oe), se && (e.components = se), T && (e.directives = T), ae && ir(e);
}
function Rr(e, t, n = r) {
	d(e) && (e = Kr(e));
	for (let n in e) {
		let r = e[n], i;
		i = v(r) ? "default" in r ? Pn(r.from || n, r.default, !0) : Pn(r.from || n) : Pn(r), /* @__PURE__ */ Gt(i) ? Object.defineProperty(t, n, {
			enumerable: !0,
			configurable: !0,
			get: () => i.value,
			set: (e) => i.value = e
		}) : t[n] = i;
	}
}
function zr(e, t, n) {
	cn(d(e) ? e.map((e) => e.bind(t.proxy)) : e.bind(t.proxy), t, n);
}
function Br(e, t, n, r) {
	let i = r.includes(".") ? Bn(n, r) : () => n[r];
	if (g(e)) {
		let n = t[e];
		h(n) && Ln(i, n);
	} else if (h(e)) Ln(i, e.bind(n));
	else if (v(e)) if (d(e)) e.forEach((e) => Br(e, t, n, r));
	else {
		let r = h(e.handler) ? e.handler.bind(n) : t[e.handler];
		h(r) && Ln(i, r, e);
	}
}
function Vr(e) {
	let t = e.type, { mixins: n, extends: r } = t, { mixins: i, optionsCache: a, config: { optionMergeStrategies: o } } = e.appContext, s = a.get(t), c;
	return s ? c = s : !i.length && !n && !r ? c = t : (c = {}, i.length && i.forEach((e) => Hr(c, e, o, !0)), Hr(c, t, o)), v(t) && a.set(t, c), c;
}
function Hr(e, t, n, r = !1) {
	let { mixins: i, extends: a } = t;
	a && Hr(e, a, n, !0), i && i.forEach((t) => Hr(e, t, n, !0));
	for (let i in t) if (!(r && i === "expose")) {
		let r = Ur[i] || n && n[i];
		e[i] = r ? r(e[i], t[i]) : t[i];
	}
	return e;
}
var Ur = {
	data: Wr,
	props: Yr,
	emits: Yr,
	methods: Jr,
	computed: Jr,
	beforeCreate: qr,
	created: qr,
	beforeMount: qr,
	mounted: qr,
	beforeUpdate: qr,
	updated: qr,
	beforeDestroy: qr,
	beforeUnmount: qr,
	destroyed: qr,
	unmounted: qr,
	activated: qr,
	deactivated: qr,
	errorCaptured: qr,
	serverPrefetch: qr,
	components: Jr,
	directives: Jr,
	watch: Xr,
	provide: Wr,
	inject: Gr
};
function Wr(e, t) {
	return t ? e ? function() {
		return s(h(e) ? e.call(this, this) : e, h(t) ? t.call(this, this) : t);
	} : t : e;
}
function Gr(e, t) {
	return Jr(Kr(e), Kr(t));
}
function Kr(e) {
	if (d(e)) {
		let t = {};
		for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
		return t;
	}
	return e;
}
function qr(e, t) {
	return e ? [...new Set([].concat(e, t))] : t;
}
function Jr(e, t) {
	return e ? s(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Yr(e, t) {
	return e ? d(e) && d(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : s(/* @__PURE__ */ Object.create(null), Fr(e), Fr(t ?? {})) : t;
}
function Xr(e, t) {
	if (!e) return t;
	if (!t) return e;
	let n = s(/* @__PURE__ */ Object.create(null), e);
	for (let r in t) n[r] = qr(e[r], t[r]);
	return n;
}
function Zr() {
	return {
		app: null,
		config: {
			isNativeTag: i,
			performance: !1,
			globalProperties: {},
			optionMergeStrategies: {},
			errorHandler: void 0,
			warnHandler: void 0,
			compilerOptions: {}
		},
		mixins: [],
		components: {},
		directives: {},
		provides: /* @__PURE__ */ Object.create(null),
		optionsCache: /* @__PURE__ */ new WeakMap(),
		propsCache: /* @__PURE__ */ new WeakMap(),
		emitsCache: /* @__PURE__ */ new WeakMap()
	};
}
var Qr = 0;
function $r(e, t) {
	return function(n, r = null) {
		h(n) || (n = s({}, n)), r != null && !v(r) && (r = null);
		let i = Zr(), a = /* @__PURE__ */ new WeakSet(), o = [], c = !1, l = i.app = {
			_uid: Qr++,
			_component: n,
			_props: r,
			_container: null,
			_context: i,
			_instance: null,
			version: La,
			get config() {
				return i.config;
			},
			set config(e) {},
			use(e, ...t) {
				return a.has(e) || (e && h(e.install) ? (a.add(e), e.install(l, ...t)) : h(e) && (a.add(e), e(l, ...t))), l;
			},
			mixin(e) {
				return i.mixins.includes(e) || i.mixins.push(e), l;
			},
			component(e, t) {
				return t ? (i.components[e] = t, l) : i.components[e];
			},
			directive(e, t) {
				return t ? (i.directives[e] = t, l) : i.directives[e];
			},
			mount(a, o, s) {
				if (!c) {
					let u = l._ceVNode || ia(n, r);
					return u.appContext = i, s === !0 ? s = "svg" : s === !1 && (s = void 0), o && t ? t(u, a) : e(u, a, s), c = !0, l._container = a, a.__vue_app__ = l, Fa(u.component);
				}
			},
			onUnmount(e) {
				o.push(e);
			},
			unmount() {
				c && (cn(o, l._instance, 16), e(null, l._container), delete l._container.__vue_app__);
			},
			provide(e, t) {
				return i.provides[e] = t, l;
			},
			runWithContext(e) {
				let t = ei;
				ei = l;
				try {
					return e();
				} finally {
					ei = t;
				}
			}
		};
		return l;
	};
}
var ei = null, ti = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${C(t)}Modifiers`] || e[`${w(t)}Modifiers`];
function ni(e, n, ...r) {
	if (e.isUnmounted) return;
	let i = e.vnode.props || t, a = r, o = n.startsWith("update:"), s = o && ti(i, n.slice(7));
	s && (s.trim && (a = r.map((e) => g(e) ? e.trim() : e)), s.number && (a = r.map(D)));
	let c, l = i[c = se(n)] || i[c = se(C(n))];
	!l && o && (l = i[c = se(w(n))]), l && cn(l, e, 6, a);
	let u = i[c + "Once"];
	if (u) {
		if (!e.emitted) e.emitted = {};
		else if (e.emitted[c]) return;
		e.emitted[c] = !0, cn(u, e, 6, a);
	}
}
var ri = /* @__PURE__ */ new WeakMap();
function ii(e, t, n = !1) {
	let r = n ? ri : t.emitsCache, i = r.get(e);
	if (i !== void 0) return i;
	let a = e.emits, o = {}, c = !1;
	if (!h(e)) {
		let r = (e) => {
			let n = ii(e, t, !0);
			n && (c = !0, s(o, n));
		};
		!n && t.mixins.length && t.mixins.forEach(r), e.extends && r(e.extends), e.mixins && e.mixins.forEach(r);
	}
	return !a && !c ? (v(e) && r.set(e, null), null) : (d(a) ? a.forEach((e) => o[e] = null) : s(o, a), v(e) && r.set(e, o), o);
}
function ai(e, t) {
	return !e || !a(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), u(e, t[0].toLowerCase() + t.slice(1)) || u(e, w(t)) || u(e, t));
}
function oi(e) {
	let { type: t, vnode: n, proxy: r, withProxy: i, propsOptions: [a], slots: s, attrs: c, emit: l, render: u, renderCache: d, props: f, data: p, setupState: m, ctx: h, inheritAttrs: g } = e, _ = kn(e), v, y;
	try {
		if (n.shapeFlag & 4) {
			let e = i || r, t = e;
			v = da(u.call(t, e, d, f, m, p, h)), y = c;
		} else {
			let e = t;
			v = da(e.length > 1 ? e(f, {
				attrs: c,
				slots: s,
				emit: l
			}) : e(f, null)), y = t.props ? c : si(c);
		}
	} catch (t) {
		qi.length = 0, ln(t, e, 1), v = ia(Gi);
	}
	let b = v;
	if (y && g !== !1) {
		let e = Object.keys(y), { shapeFlag: t } = b;
		e.length && t & 7 && (a && e.some(o) && (y = ci(y, a)), b = sa(b, y, !1, !0));
	}
	return n.dirs && (b = sa(b, null, !1, !0), b.dirs = b.dirs ? b.dirs.concat(n.dirs) : n.dirs), n.transition && nr(b, n.transition), v = b, kn(_), v;
}
var si = (e) => {
	let t;
	for (let n in e) (n === "class" || n === "style" || a(n)) && ((t ||= {})[n] = e[n]);
	return t;
}, ci = (e, t) => {
	let n = {};
	for (let r in e) (!o(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
	return n;
};
function li(e, t, n) {
	let { props: r, children: i, component: a } = e, { props: o, children: s, patchFlag: c } = t, l = a.emitsOptions;
	if (t.dirs || t.transition) return !0;
	if (n && c >= 0) {
		if (c & 1024) return !0;
		if (c & 16) return r ? ui(r, o, l) : !!o;
		if (c & 8) {
			let e = t.dynamicProps;
			for (let t = 0; t < e.length; t++) {
				let n = e[t];
				if (di(o, r, n) && !ai(l, n)) return !0;
			}
		}
	} else return (i || s) && (!s || !s.$stable) ? !0 : r === o ? !1 : r ? !o || ui(r, o, l) : !!o;
	return !1;
}
function ui(e, t, n) {
	let r = Object.keys(t);
	if (r.length !== Object.keys(e).length) return !0;
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		if (di(t, e, a) && !ai(n, a)) return !0;
	}
	return !1;
}
function di(e, t, n) {
	let r = e[n], i = t[n];
	return n === "style" && v(r) && v(i) ? !be(r, i) : r !== i;
}
function fi({ vnode: e, parent: t, suspense: n }, r) {
	for (; t;) {
		let n = t.subTree;
		if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = r, e = n), n === e) (e = t.vnode).el = r, t = t.parent;
		else break;
	}
	n && n.activeBranch === e && (n.vnode.el = r);
}
var pi = {}, mi = () => Object.create(pi), hi = (e) => Object.getPrototypeOf(e) === pi;
function gi(e, t, n, r = !1) {
	let i = {}, a = mi();
	e.propsDefaults = /* @__PURE__ */ Object.create(null), vi(e, t, i, a);
	for (let t in e.propsOptions[0]) t in i || (i[t] = void 0);
	n ? e.props = r ? i : /* @__PURE__ */ Ft(i) : e.type.props ? e.props = i : e.props = a, e.attrs = a;
}
function _i(e, t, n, r) {
	let { props: i, attrs: a, vnode: { patchFlag: o } } = e, s = /* @__PURE__ */ N(i), [c] = e.propsOptions, l = !1;
	if ((r || o > 0) && !(o & 16)) {
		if (o & 8) {
			let n = e.vnode.dynamicProps;
			for (let r = 0; r < n.length; r++) {
				let o = n[r];
				if (ai(e.emitsOptions, o)) continue;
				let d = t[o];
				if (c) if (u(a, o)) d !== a[o] && (a[o] = d, l = !0);
				else {
					let t = C(o);
					i[t] = yi(c, s, t, d, e, !1);
				}
				else d !== a[o] && (a[o] = d, l = !0);
			}
		}
	} else {
		vi(e, t, i, a) && (l = !0);
		let r;
		for (let a in s) (!t || !u(t, a) && ((r = w(a)) === a || !u(t, r))) && (c ? n && (n[a] !== void 0 || n[r] !== void 0) && (i[a] = yi(c, s, a, void 0, e, !0)) : delete i[a]);
		if (a !== s) for (let e in a) (!t || !u(t, e)) && (delete a[e], l = !0);
	}
	l && et(e.attrs, "set", "");
}
function vi(e, n, r, i) {
	let [a, o] = e.propsOptions, s = !1, c;
	if (n) for (let t in n) {
		if (ne(t)) continue;
		let l = n[t], d;
		a && u(a, d = C(t)) ? !o || !o.includes(d) ? r[d] = l : (c ||= {})[d] = l : ai(e.emitsOptions, t) || (!(t in i) || l !== i[t]) && (i[t] = l, s = !0);
	}
	if (o) {
		let n = /* @__PURE__ */ N(r), i = c || t;
		for (let t = 0; t < o.length; t++) {
			let s = o[t];
			r[s] = yi(a, n, s, i[s], e, !u(i, s));
		}
	}
	return s;
}
function yi(e, t, n, r, i, a) {
	let o = e[n];
	if (o != null) {
		let e = u(o, "default");
		if (e && r === void 0) {
			let e = o.default;
			if (o.type !== Function && !o.skipFactory && h(e)) {
				let { propsDefaults: a } = i;
				if (n in a) r = a[n];
				else {
					let o = Ca(i);
					r = a[n] = e.call(null, t), o();
				}
			} else r = e;
			i.ce && i.ce._setProp(n, r);
		}
		o[0] && (a && !e ? r = !1 : o[1] && (r === "" || r === w(n)) && (r = !0));
	}
	return r;
}
var bi = /* @__PURE__ */ new WeakMap();
function xi(e, r, i = !1) {
	let a = i ? bi : r.propsCache, o = a.get(e);
	if (o) return o;
	let c = e.props, l = {}, f = [], p = !1;
	if (!h(e)) {
		let t = (e) => {
			p = !0;
			let [t, n] = xi(e, r, !0);
			s(l, t), n && f.push(...n);
		};
		!i && r.mixins.length && r.mixins.forEach(t), e.extends && t(e.extends), e.mixins && e.mixins.forEach(t);
	}
	if (!c && !p) return v(e) && a.set(e, n), n;
	if (d(c)) for (let e = 0; e < c.length; e++) {
		let n = C(c[e]);
		Si(n) && (l[n] = t);
	}
	else if (c) for (let e in c) {
		let t = C(e);
		if (Si(t)) {
			let n = c[e], r = l[t] = d(n) || h(n) ? { type: n } : s({}, n), i = r.type, a = !1, o = !0;
			if (d(i)) for (let e = 0; e < i.length; ++e) {
				let t = i[e], n = h(t) && t.name;
				if (n === "Boolean") {
					a = !0;
					break;
				} else n === "String" && (o = !1);
			}
			else a = h(i) && i.name === "Boolean";
			r[0] = a, r[1] = o, (a || u(r, "default")) && f.push(t);
		}
	}
	let m = [l, f];
	return v(e) && a.set(e, m), m;
}
function Si(e) {
	return e[0] !== "$" && !ne(e);
}
var Ci = (e) => e === "_" || e === "_ctx" || e === "$stable", wi = (e) => d(e) ? e.map(da) : [da(e)], Ti = (e, t, n) => {
	if (t._n) return t;
	let r = An((...e) => wi(t(...e)), n);
	return r._c = !1, r;
}, Ei = (e, t, n) => {
	let r = e._ctx;
	for (let n in e) {
		if (Ci(n)) continue;
		let i = e[n];
		if (h(i)) t[n] = Ti(n, i, r);
		else if (i != null) {
			let e = wi(i);
			t[n] = () => e;
		}
	}
}, Di = (e, t) => {
	let n = wi(t);
	e.slots.default = () => n;
}, Oi = (e, t, n) => {
	for (let r in t) (n || !Ci(r)) && (e[r] = t[r]);
}, ki = (e, t, n) => {
	let r = e.slots = mi();
	if (e.vnode.shapeFlag & 32) {
		let e = t._;
		e ? (Oi(r, t, n), n && E(r, "_", e, !0)) : Ei(t, r);
	} else t && Di(e, t);
}, Ai = (e, n, r) => {
	let { vnode: i, slots: a } = e, o = !0, s = t;
	if (i.shapeFlag & 32) {
		let e = n._;
		e ? r && e === 1 ? o = !1 : Oi(a, n, r) : (o = !n.$stable, Ei(n, a)), s = n;
	} else n && (Di(e, n), s = { default: 1 });
	if (o) for (let e in a) !Ci(e) && s[e] == null && delete a[e];
}, ji = Ui;
function Mi(e) {
	return Ni(e);
}
function Ni(e, i) {
	let a = ue();
	a.__VUE__ = !0;
	let { insert: o, remove: s, patchProp: c, createElement: l, createText: u, createComment: d, setText: f, setElementText: p, parentNode: m, nextSibling: h, setScopeId: g = r, insertStaticContent: _ } = e, v = (e, t, n, r = null, i = null, a = null, o = void 0, s = null, c = !!t.dynamicChildren) => {
		if (e === t) return;
		e && !ta(e, t) && (r = ye(e), me(e, i, a, !0), e = null), t.patchFlag === -2 && (c = !1, t.dynamicChildren = null);
		let { type: l, ref: u, shapeFlag: d } = t;
		switch (l) {
			case Wi:
				y(e, t, n, r);
				break;
			case Gi:
				b(e, t, n, r);
				break;
			case Ki:
				e ?? x(t, n, r, o);
				break;
			case P:
				se(e, t, n, r, i, a, o, s, c);
				break;
			default: d & 1 ? te(e, t, n, r, i, a, o, s, c) : d & 6 ? T(e, t, n, r, i, a, o, s, c) : (d & 64 || d & 128) && l.process(e, t, n, r, i, a, o, s, c, Se);
		}
		u != null && i ? sr(u, e && e.ref, a, t || e, !t) : u == null && e && e.ref != null && sr(e.ref, null, a, e, !0);
	}, y = (e, t, n, r) => {
		if (e == null) o(t.el = u(t.children), n, r);
		else {
			let n = t.el = e.el;
			t.children !== e.children && f(n, t.children);
		}
	}, b = (e, t, n, r) => {
		e == null ? o(t.el = d(t.children || ""), n, r) : t.el = e.el;
	}, x = (e, t, n, r) => {
		[e.el, e.anchor] = _(e.children, t, n, r, e.el, e.anchor);
	}, ee = ({ el: e, anchor: t }, n, r) => {
		let i;
		for (; e && e !== t;) i = h(e), o(e, n, r), e = i;
		o(t, n, r);
	}, S = ({ el: e, anchor: t }) => {
		let n;
		for (; e && e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, te = (e, t, n, r, i, a, o, s, c) => {
		if (t.type === "svg" ? o = "svg" : t.type === "math" && (o = "mathml"), e == null) re(t, n, r, i, a, o, s, c);
		else {
			let n = e.el && e.el._isVueCE ? e.el : null;
			try {
				n && n._beginPatch(), ae(e, t, i, a, o, s, c);
			} finally {
				n && n._endPatch();
			}
		}
	}, re = (e, t, n, r, i, a, s, u) => {
		let d, f, { props: m, shapeFlag: h, transition: g, dirs: _ } = e;
		if (d = e.el = l(e.type, a, m && m.is, m), h & 8 ? p(d, e.children) : h & 16 && C(e.children, d, null, r, i, Pi(e, a), s, u), _ && Mn(e, null, r, "created"), ie(d, e, e.scopeId, s, r), m) {
			for (let e in m) e !== "value" && !ne(e) && c(d, e, null, m[e], a, r);
			"value" in m && c(d, "value", null, m.value, a), (f = m.onVnodeBeforeMount) && ha(f, r, e);
		}
		_ && Mn(e, null, r, "beforeMount");
		let v = Ii(i, g);
		v && g.beforeEnter(d), o(d, t, n), ((f = m && m.onVnodeMounted) || v || _) && ji(() => {
			try {
				f && ha(f, r, e), v && g.enter(d), _ && Mn(e, null, r, "mounted");
			} finally {}
		}, i);
	}, ie = (e, t, n, r, i) => {
		if (n && g(e, n), r) for (let t = 0; t < r.length; t++) g(e, r[t]);
		if (i) {
			let n = i.subTree;
			if (t === n || Hi(n.type) && (n.ssContent === t || n.ssFallback === t)) {
				let t = i.vnode;
				ie(e, t, t.scopeId, t.slotScopeIds, i.parent);
			}
		}
	}, C = (e, t, n, r, i, a, o, s, c = 0) => {
		for (let l = c; l < e.length; l++) {
			let c = e[l] = s ? fa(e[l]) : da(e[l]);
			v(null, c, t, n, r, i, a, o, s);
		}
	}, ae = (e, n, r, i, a, o, s) => {
		let l = n.el = e.el, { patchFlag: u, dynamicChildren: d, dirs: f } = n;
		u |= e.patchFlag & 16;
		let m = e.props || t, h = n.props || t, g;
		if (r && Fi(r, !1), (g = h.onVnodeBeforeUpdate) && ha(g, r, n, e), f && Mn(n, e, r, "beforeUpdate"), r && Fi(r, !0), d && (!e.dynamicChildren || e.dynamicChildren.length !== d.length) && (u = 0, s = !1, d = null), (m.innerHTML && h.innerHTML == null || m.textContent && h.textContent == null) && p(l, ""), d ? w(e.dynamicChildren, d, l, r, i, Pi(n, a), o) : s || k(e, n, l, null, r, i, Pi(n, a), o, !1), u > 0) {
			if (u & 16) oe(l, m, h, r, a);
			else if (u & 2 && m.class !== h.class && c(l, "class", null, h.class, a), u & 4 && c(l, "style", m.style, h.style, a), u & 8) {
				let e = n.dynamicProps;
				for (let t = 0; t < e.length; t++) {
					let n = e[t], i = m[n], o = h[n];
					(o !== i || n === "value") && c(l, n, i, o, a, r);
				}
			}
			u & 1 && e.children !== n.children && p(l, n.children);
		} else !s && d == null && oe(l, m, h, r, a);
		((g = h.onVnodeUpdated) || f) && ji(() => {
			g && ha(g, r, n, e), f && Mn(n, e, r, "updated");
		}, i);
	}, w = (e, t, n, r, i, a, o) => {
		for (let s = 0; s < t.length; s++) {
			let c = e[s], l = t[s], u = c.el && (c.type === P || !ta(c, l) || c.shapeFlag & 198) ? m(c.el) : n;
			v(c, l, u, null, r, i, a, o, !0);
		}
	}, oe = (e, n, r, i, a) => {
		if (n !== r) {
			if (n !== t) for (let t in n) !ne(t) && !(t in r) && c(e, t, n[t], null, a, i);
			for (let t in r) {
				if (ne(t)) continue;
				let o = r[t], s = n[t];
				o !== s && t !== "value" && c(e, t, s, o, a, i);
			}
			"value" in r && c(e, "value", n.value, r.value, a);
		}
	}, se = (e, t, n, r, i, a, s, c, l) => {
		let d = t.el = e ? e.el : u(""), f = t.anchor = e ? e.anchor : u(""), { patchFlag: p, dynamicChildren: m, slotScopeIds: h } = t;
		h && (c = c ? c.concat(h) : h), e == null ? (o(d, n, r), o(f, n, r), C(t.children || [], n, f, i, a, s, c, l)) : p > 0 && p & 64 && m && e.dynamicChildren && e.dynamicChildren.length === m.length ? (w(e.dynamicChildren, m, n, i, a, s, c), (t.key != null || i && t === i.subTree) && Li(e, t, !0)) : k(e, t, n, f, i, a, s, c, l);
	}, T = (e, t, n, r, i, a, o, s, c) => {
		t.slotScopeIds = s, e == null ? t.shapeFlag & 512 ? i.ctx.activate(t, n, r, o, c) : E(t, n, r, i, a, o, c) : D(e, t, c);
	}, E = (e, t, n, r, i, a, o) => {
		let s = e.component = va(e, r, i);
		if (ur(e) && (s.ctx.renderer = Se), Da(s, !1, o), s.asyncDep) {
			if (i && i.registerDep(s, le, o), !e.el) {
				let r = s.subTree = ia(Gi);
				b(null, r, t, n), e.placeholder = r.el;
			}
		} else le(s, e, t, n, i, a, o);
	}, D = (e, t, n) => {
		let r = t.component = e.component;
		if (li(e, t, n)) if (r.asyncDep && !r.asyncResolved) {
			O(r, t, n);
			return;
		} else r.next = t, r.update();
		else t.el = e.el, r.vnode = t;
	}, le = (e, t, n, r, i, a, o) => {
		let s = () => {
			if (e.isMounted) {
				let { next: t, bu: n, u: r, parent: s, vnode: c } = e;
				{
					let n = zi(e);
					if (n) {
						t && (t.el = c.el, O(e, t, o)), n.asyncDep.then(() => {
							ji(() => {
								e.isUnmounted || l();
							}, i);
						});
						return;
					}
				}
				let u = t, d;
				Fi(e, !1), t ? (t.el = c.el, O(e, t, o)) : t = c, n && ce(n), (d = t.props && t.props.onVnodeBeforeUpdate) && ha(d, s, t, c), Fi(e, !0);
				let f = oi(e), p = e.subTree;
				e.subTree = f, v(p, f, m(p.el), ye(p), e, i, a), t.el = f.el, u === null && fi(e, f.el), r && ji(r, i), (d = t.props && t.props.onVnodeUpdated) && ji(() => ha(d, s, t, c), i);
			} else {
				let o, { el: s, props: c } = t, { bm: l, m: u, parent: d, root: f, type: p } = e, m = lr(t);
				if (Fi(e, !1), l && ce(l), !m && (o = c && c.onVnodeBeforeMount) && ha(o, d, t), Fi(e, !0), s && we) {
					let t = () => {
						e.subTree = oi(e), we(s, e.subTree, e, i, null);
					};
					m && p.__asyncHydrate ? p.__asyncHydrate(s, e, t) : t();
				} else {
					f.ce && f.ce._hasShadowRoot() && f.ce._injectChildStyle(p, e.parent ? e.parent.type : void 0);
					let o = e.subTree = oi(e);
					v(null, o, n, r, e, i, a), t.el = o.el;
				}
				if (u && ji(u, i), !m && (o = c && c.onVnodeMounted)) {
					let e = t;
					ji(() => ha(o, d, e), i);
				}
				(t.shapeFlag & 256 || d && lr(d.vnode) && d.vnode.shapeFlag & 256) && e.a && ji(e.a, i), e.isMounted = !0, t = n = r = null;
			}
		};
		e.scope.on();
		let c = e.effect = new Oe(s);
		e.scope.off();
		let l = e.update = c.run.bind(c), u = e.job = c.runIfDirty.bind(c);
		u.i = e, u.id = e.uid, c.scheduler = () => bn(u), Fi(e, !0), l();
	}, O = (e, t, n) => {
		t.component = e;
		let r = e.vnode.props;
		e.vnode = t, e.next = null, _i(e, t.props, r, n), Ai(e, t.children, n), Ue(), Cn(e), We();
	}, k = (e, t, n, r, i, a, o, s, c = !1) => {
		let l = e && e.children, u = e ? e.shapeFlag : 0, d = t.children, { patchFlag: f, shapeFlag: m } = t;
		if (f > 0) {
			if (f & 128) {
				fe(l, d, n, r, i, a, o, s, c);
				return;
			} else if (f & 256) {
				de(l, d, n, r, i, a, o, s, c);
				return;
			}
		}
		m & 8 ? (u & 16 && ve(l, i, a), d !== l && p(n, d)) : u & 16 ? m & 16 ? fe(l, d, n, r, i, a, o, s, c) : ve(l, i, a, !0) : (u & 8 && p(n, ""), m & 16 && C(d, n, r, i, a, o, s, c));
	}, de = (e, t, r, i, a, o, s, c, l) => {
		e ||= n, t ||= n;
		let u = e.length, d = t.length, f = Math.min(u, d), p;
		for (p = 0; p < f; p++) {
			let n = t[p] = l ? fa(t[p]) : da(t[p]);
			v(e[p], n, r, null, a, o, s, c, l);
		}
		u > d ? ve(e, a, o, !0, !1, f) : C(t, r, i, a, o, s, c, l, f);
	}, fe = (e, t, r, i, a, o, s, c, l) => {
		let u = 0, d = t.length, f = e.length - 1, p = d - 1;
		for (; u <= f && u <= p;) {
			let n = e[u], i = t[u] = l ? fa(t[u]) : da(t[u]);
			if (ta(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			u++;
		}
		for (; u <= f && u <= p;) {
			let n = e[f], i = t[p] = l ? fa(t[p]) : da(t[p]);
			if (ta(n, i)) v(n, i, r, null, a, o, s, c, l);
			else break;
			f--, p--;
		}
		if (u > f) {
			if (u <= p) {
				let e = p + 1, n = e < d ? t[e].el : i;
				for (; u <= p;) v(null, t[u] = l ? fa(t[u]) : da(t[u]), r, n, a, o, s, c, l), u++;
			}
		} else if (u > p) for (; u <= f;) me(e[u], a, o, !0), u++;
		else {
			let m = u, h = u, g = /* @__PURE__ */ new Map();
			for (u = h; u <= p; u++) {
				let e = t[u] = l ? fa(t[u]) : da(t[u]);
				e.key != null && g.set(e.key, u);
			}
			let _, y = 0, b = p - h + 1, x = !1, ee = 0, S = Array(b);
			for (u = 0; u < b; u++) S[u] = 0;
			for (u = m; u <= f; u++) {
				let n = e[u];
				if (y >= b) {
					me(n, a, o, !0);
					continue;
				}
				let i;
				if (n.key != null) i = g.get(n.key);
				else for (_ = h; _ <= p; _++) if (S[_ - h] === 0 && ta(n, t[_])) {
					i = _;
					break;
				}
				i === void 0 ? me(n, a, o, !0) : (S[i - h] = u + 1, i >= ee ? ee = i : x = !0, v(n, t[i], r, null, a, o, s, c, l), y++);
			}
			let te = x ? Ri(S) : n;
			for (_ = te.length - 1, u = b - 1; u >= 0; u--) {
				let e = h + u, n = t[e], f = t[e + 1], p = e + 1 < d ? f.el || Vi(f) : i;
				S[u] === 0 ? v(null, n, r, p, a, o, s, c, l) : x && (_ < 0 || u !== te[_] ? pe(n, r, p, 2) : _--);
			}
		}
	}, pe = (e, t, n, r, i = null) => {
		let { el: a, type: c, transition: l, children: u, shapeFlag: d } = e;
		if (d & 6) {
			pe(e.component.subTree, t, n, r);
			return;
		}
		if (d & 128) {
			e.suspense.move(t, n, r);
			return;
		}
		if (d & 64) {
			c.move(e, t, n, Se);
			return;
		}
		if (c === P) {
			o(a, t, n);
			for (let e = 0; e < u.length; e++) pe(u[e], t, n, r);
			o(e.anchor, t, n);
			return;
		}
		if (c === Ki) {
			ee(e, t, n);
			return;
		}
		if (r !== 2 && d & 1 && l) if (r === 0) l.persisted && !a[tr] ? o(a, t, n) : (l.beforeEnter(a), o(a, t, n), ji(() => l.enter(a), i));
		else {
			let { leave: r, delayLeave: i, afterLeave: c } = l, u = () => {
				e.ctx.isUnmounted ? s(a) : o(a, t, n);
			}, d = () => {
				let e = a._isLeaving || !!a[tr];
				a._isLeaving && a[tr](!0), l.persisted && !e ? u() : r(a, () => {
					u(), c && c();
				});
			};
			i ? i(a, u, d) : d();
		}
		else o(a, t, n);
	}, me = (e, t, n, r = !1, i = !1) => {
		let { type: a, props: o, ref: s, children: c, dynamicChildren: l, shapeFlag: u, patchFlag: d, dirs: f, cacheIndex: p, memo: m } = e;
		if (d === -2 && (i = !1), s != null && (Ue(), sr(s, null, n, e, !0), We()), p != null && (t.renderCache[p] = void 0), u & 256) {
			t.ctx.deactivate(e);
			return;
		}
		let h = u & 1 && f, g = !lr(e), _;
		if (g && (_ = o && o.onVnodeBeforeUnmount) && ha(_, t, e), u & 6) _e(e.component, n, r);
		else {
			if (u & 128) {
				e.suspense.unmount(n, r);
				return;
			}
			h && Mn(e, null, t, "beforeUnmount"), u & 64 ? e.type.remove(e, t, n, Se, r) : l && !l.hasOnce && (a !== P || d > 0 && d & 64) ? ve(l, t, n, !1, !0) : (a === P && d & 384 || !i && u & 16) && ve(c, t, n), r && he(e);
		}
		let v = m != null && p == null;
		(g && (_ = o && o.onVnodeUnmounted) || h || v) && ji(() => {
			_ && ha(_, t, e), h && Mn(e, null, t, "unmounted"), v && (e.el = null);
		}, n);
	}, he = (e) => {
		let { type: t, el: n, anchor: r, transition: i } = e;
		if (t === P) {
			ge(n, r);
			return;
		}
		if (t === Ki) {
			S(e);
			return;
		}
		let a = () => {
			s(n), i && !i.persisted && i.afterLeave && i.afterLeave();
		};
		if (e.shapeFlag & 1 && i && !i.persisted) {
			let { leave: t, delayLeave: r } = i, o = () => t(n, a);
			r ? r(e.el, a, o) : o();
		} else a();
	}, ge = (e, t) => {
		let n;
		for (; e !== t;) n = h(e), s(e), e = n;
		s(t);
	}, _e = (e, t, n) => {
		let { bum: r, scope: i, job: a, subTree: o, um: s, m: c, a: l } = e;
		Bi(c), Bi(l), r && ce(r), i.stop(), a && (a.flags |= 8, me(o, e, t, n)), s && ji(s, t), ji(() => {
			e.isUnmounted = !0;
		}, t);
	}, ve = (e, t, n, r = !1, i = !1, a = 0) => {
		for (let o = a; o < e.length; o++) me(e[o], t, n, r, i);
	}, ye = (e) => {
		if (e.shapeFlag & 6) return ye(e.component.subTree);
		if (e.shapeFlag & 128) return e.suspense.next();
		let t = h(e.anchor || e.el), n = t && t[Hn];
		return n ? h(n) : t;
	}, be = !1, xe = (e, t, n) => {
		let r;
		e == null ? t._vnode && (me(t._vnode, null, null, !0), r = t._vnode.component) : v(t._vnode || null, e, t, null, null, null, n), t._vnode = e, be ||= (be = !0, Cn(r), wn(), !1);
	}, Se = {
		p: v,
		um: me,
		m: pe,
		r: he,
		mt: E,
		mc: C,
		pc: k,
		pbc: w,
		n: ye,
		o: e
	}, Ce, we;
	return i && ([Ce, we] = i(Se)), {
		render: xe,
		hydrate: Ce,
		createApp: $r(xe, Ce)
	};
}
function Pi({ type: e, props: t }, n) {
	return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Fi({ effect: e, job: t }, n) {
	n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Ii(e, t) {
	return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function Li(e, t, n = !1) {
	let r = e.children, i = t.children;
	if (d(r) && d(i)) for (let e = 0; e < r.length; e++) {
		let t = r[e], a = i[e];
		a.shapeFlag & 1 && !a.dynamicChildren && ((a.patchFlag <= 0 || a.patchFlag === 32) && (a = i[e] = fa(i[e]), a.el = t.el), !n && a.patchFlag !== -2 && Li(t, a)), a.type === Wi && (a.patchFlag === -1 && (a = i[e] = fa(a)), a.el = t.el), a.type === Gi && !a.el && (a.el = t.el);
	}
}
function Ri(e) {
	let t = e.slice(), n = [0], r, i, a, o, s, c = e.length;
	for (r = 0; r < c; r++) {
		let c = e[r];
		if (c !== 0) {
			if (i = n[n.length - 1], e[i] < c) {
				t[r] = i, n.push(r);
				continue;
			}
			for (a = 0, o = n.length - 1; a < o;) s = a + o >> 1, e[n[s]] < c ? a = s + 1 : o = s;
			c < e[n[a]] && (a > 0 && (t[r] = n[a - 1]), n[a] = r);
		}
	}
	for (a = n.length, o = n[a - 1]; a-- > 0;) n[a] = o, o = t[o];
	return n;
}
function zi(e) {
	let t = e.subTree.component;
	if (t) return t.asyncDep && !t.asyncResolved ? t : zi(t);
}
function Bi(e) {
	if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
}
function Vi(e) {
	if (e.placeholder) return e.placeholder;
	let t = e.component;
	return t ? Vi(t.subTree) : null;
}
var Hi = (e) => e.__isSuspense;
function Ui(e, t) {
	t && t.pendingBranch ? d(e) ? t.effects.push(...e) : t.effects.push(e) : Sn(e);
}
var P = /* @__PURE__ */ Symbol.for("v-fgt"), Wi = /* @__PURE__ */ Symbol.for("v-txt"), Gi = /* @__PURE__ */ Symbol.for("v-cmt"), Ki = /* @__PURE__ */ Symbol.for("v-stc"), qi = [], Ji = null;
function F(e = !1) {
	qi.push(Ji = e ? null : []);
}
function Yi() {
	qi.pop(), Ji = qi[qi.length - 1] || null;
}
var Xi = 1;
function Zi(e, t = !1) {
	Xi += e, e < 0 && Ji && t && (Ji.hasOnce = !0);
}
function Qi(e) {
	return e.dynamicChildren = Xi > 0 ? Ji || n : null, Yi(), Xi > 0 && Ji && Ji.push(e), e;
}
function I(e, t, n, r, i, a) {
	return Qi(L(e, t, n, r, i, a, !0));
}
function $i(e, t, n, r, i) {
	return Qi(ia(e, t, n, r, i, !0));
}
function ea(e) {
	return e ? e.__v_isVNode === !0 : !1;
}
function ta(e, t) {
	return e.type === t.type && e.key === t.key;
}
var na = ({ key: e }) => e ?? null, ra = ({ ref: e, ref_key: t, ref_for: n }) => (typeof e == "number" && (e = "" + e), e == null ? null : g(e) || /* @__PURE__ */ Gt(e) || h(e) ? {
	i: Dn,
	r: e,
	k: t,
	f: !!n
} : e);
function L(e, t = null, n = null, r = 0, i = null, a = e === P ? 0 : 1, o = !1, s = !1) {
	let c = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e,
		props: t,
		key: t && na(t),
		ref: t && ra(t),
		scopeId: On,
		slotScopeIds: null,
		children: n,
		component: null,
		suspense: null,
		ssContent: null,
		ssFallback: null,
		dirs: null,
		transition: null,
		el: null,
		anchor: null,
		target: null,
		targetStart: null,
		targetAnchor: null,
		staticCount: 0,
		shapeFlag: a,
		patchFlag: r,
		dynamicProps: i,
		dynamicChildren: null,
		appContext: null,
		ctx: Dn
	};
	return s ? (pa(c, n), a & 128 && e.normalize(c)) : n && (c.shapeFlag |= g(n) ? 8 : 16), Xi > 0 && !o && Ji && (c.patchFlag > 0 || a & 6) && c.patchFlag !== 32 && Ji.push(c), c;
}
var ia = aa;
function aa(e, t = null, n = null, r = 0, i = null, a = !1) {
	if ((!e || e === Dr) && (e = Gi), ea(e)) {
		let r = sa(e, t, !0);
		return n && pa(r, n), Xi > 0 && !a && Ji && (r.shapeFlag & 6 ? Ji[Ji.indexOf(e)] = r : Ji.push(r)), r.patchFlag = -2, r;
	}
	if (Ia(e) && (e = e.__vccOpts), t) {
		t = oa(t);
		let { class: e, style: n } = t;
		e && !g(e) && (t.class = he(e)), v(n) && (/* @__PURE__ */ Vt(n) && !d(n) && (n = s({}, n)), t.style = k(n));
	}
	let o = g(e) ? 1 : Hi(e) ? 128 : Un(e) ? 64 : v(e) ? 4 : h(e) ? 2 : 0;
	return L(e, t, n, r, i, o, a, !0);
}
function oa(e) {
	return e ? /* @__PURE__ */ Vt(e) || hi(e) ? s({}, e) : e : null;
}
function sa(e, t, n = !1, r = !1) {
	let { props: i, ref: a, patchFlag: o, children: s, transition: c } = e, l = t ? ma(i || {}, t) : i, u = {
		__v_isVNode: !0,
		__v_skip: !0,
		type: e.type,
		props: l,
		key: l && na(l),
		ref: t && t.ref ? n && a ? d(a) ? a.concat(ra(t)) : [a, ra(t)] : ra(t) : a,
		scopeId: e.scopeId,
		slotScopeIds: e.slotScopeIds,
		children: s,
		target: e.target,
		targetStart: e.targetStart,
		targetAnchor: e.targetAnchor,
		staticCount: e.staticCount,
		shapeFlag: e.shapeFlag,
		patchFlag: t && e.type !== P ? o === -1 ? 16 : o | 16 : o,
		dynamicProps: e.dynamicProps,
		dynamicChildren: e.dynamicChildren,
		appContext: e.appContext,
		dirs: e.dirs,
		transition: c,
		component: e.component,
		suspense: e.suspense,
		ssContent: e.ssContent && sa(e.ssContent),
		ssFallback: e.ssFallback && sa(e.ssFallback),
		placeholder: e.placeholder,
		el: e.el,
		anchor: e.anchor,
		ctx: e.ctx,
		ce: e.ce
	};
	return c && r && nr(u, c.clone(u)), u;
}
function ca(e = " ", t = 0) {
	return ia(Wi, null, e, t);
}
function la(e, t) {
	let n = ia(Ki, null, e);
	return n.staticCount = t, n;
}
function ua(e = "", t = !1) {
	return t ? (F(), $i(Gi, null, e)) : ia(Gi, null, e);
}
function da(e) {
	return e == null || typeof e == "boolean" ? ia(Gi) : d(e) ? ia(P, null, e.slice()) : ea(e) ? fa(e) : ia(Wi, null, String(e));
}
function fa(e) {
	return e.el === null && e.patchFlag !== -1 || e.memo ? e : sa(e);
}
function pa(e, t) {
	let n = 0, { shapeFlag: r } = e;
	if (t == null) t = null;
	else if (d(t)) n = 16;
	else if (typeof t == "object") if (r & 65) {
		let n = t.default;
		n && (n._c && (n._d = !1), pa(e, n()), n._c && (n._d = !0));
		return;
	} else {
		n = 32;
		let r = t._;
		!r && !hi(t) ? t._ctx = Dn : r === 3 && Dn && (Dn.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
	}
	else if (h(t)) {
		if (r & 65) {
			pa(e, { default: t });
			return;
		}
		t = {
			default: t,
			_ctx: Dn
		}, n = 32;
	} else t = String(t), r & 64 ? (n = 16, t = [ca(t)]) : n = 8;
	e.children = t, e.shapeFlag |= n;
}
function ma(...e) {
	let t = {};
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (let e in r) if (e === "class") t.class !== r.class && (t.class = he([t.class, r.class]));
		else if (e === "style") t.style = k([t.style, r.style]);
		else if (a(e)) {
			let n = t[e], i = r[e];
			i && n !== i && !(d(n) && n.includes(i)) ? t[e] = n ? [].concat(n, i) : i : i == null && n == null && !o(e) && (t[e] = i);
		} else e !== "" && (t[e] = r[e]);
	}
	return t;
}
function ha(e, t, n, r = null) {
	cn(e, t, 7, [n, r]);
}
var ga = Zr(), _a = 0;
function va(e, n, r) {
	let i = e.type, a = (n ? n.appContext : e.appContext) || ga, o = {
		uid: _a++,
		vnode: e,
		type: i,
		parent: n,
		appContext: a,
		root: null,
		next: null,
		subTree: null,
		effect: null,
		update: null,
		job: null,
		scope: new Te(!0),
		render: null,
		proxy: null,
		exposed: null,
		exposeProxy: null,
		withProxy: null,
		provides: n ? n.provides : Object.create(a.provides),
		ids: n ? n.ids : [
			"",
			0,
			0
		],
		accessCache: null,
		renderCache: [],
		components: null,
		directives: null,
		propsOptions: xi(i, a),
		emitsOptions: ii(i, a),
		emit: null,
		emitted: null,
		propsDefaults: t,
		inheritAttrs: i.inheritAttrs,
		ctx: t,
		data: t,
		props: t,
		attrs: t,
		slots: t,
		refs: t,
		setupState: t,
		setupContext: null,
		suspense: r,
		suspenseId: r ? r.pendingId : 0,
		asyncDep: null,
		asyncResolved: !1,
		isMounted: !1,
		isUnmounted: !1,
		isDeactivated: !1,
		bc: null,
		c: null,
		bm: null,
		m: null,
		bu: null,
		u: null,
		um: null,
		bum: null,
		da: null,
		a: null,
		rtg: null,
		rtc: null,
		ec: null,
		sp: null
	};
	return o.ctx = { _: o }, o.root = n ? n.root : o, o.emit = ni.bind(null, o), e.ce && e.ce(o), o;
}
var ya = null, ba = () => ya || Dn, xa, Sa;
{
	let e = ue(), t = (t, n) => {
		let r;
		return (r = e[t]) || (r = e[t] = []), r.push(n), (e) => {
			r.length > 1 ? r.forEach((t) => t(e)) : r[0](e);
		};
	};
	xa = t("__VUE_INSTANCE_SETTERS__", (e) => ya = e), Sa = t("__VUE_SSR_SETTERS__", (e) => Ea = e);
}
var Ca = (e) => {
	let t = ya;
	return xa(e), e.scope.on(), () => {
		e.scope.off(), xa(t);
	};
}, wa = () => {
	ya && ya.scope.off(), xa(null);
};
function Ta(e) {
	return e.vnode.shapeFlag & 4;
}
var Ea = !1;
function Da(e, t = !1, n = !1) {
	t && Sa(t);
	let { props: r, children: i } = e.vnode, a = Ta(e);
	gi(e, r, a, t), ki(e, i, n || t);
	let o = a ? Oa(e, t) : void 0;
	return t && Sa(!1), o;
}
function Oa(e, t) {
	let n = e.type;
	e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, Pr);
	let { setup: r } = n;
	if (r) {
		Ue();
		let n = e.setupContext = r.length > 1 ? Pa(e) : null, i = Ca(e), a = sn(r, e, 0, [e.props, n]), o = y(a);
		if (We(), i(), (o || e.sp) && !lr(e) && ir(e), o) {
			if (a.then(wa, wa), t) return a.then((n) => {
				ka(e, n, t);
			}).catch((t) => {
				ln(t, e, 0);
			});
			e.asyncDep = a;
		} else ka(e, a, t);
	} else Ma(e, t);
}
function ka(e, t, n) {
	h(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : v(t) && (e.setupState = Zt(t)), Ma(e, n);
}
var Aa, ja;
function Ma(e, t, n) {
	let i = e.type;
	if (!e.render) {
		if (!t && Aa && !i.render) {
			let t = i.template || Vr(e).template;
			if (t) {
				let { isCustomElement: n, compilerOptions: r } = e.appContext.config, { delimiters: a, compilerOptions: o } = i;
				i.render = Aa(t, s(s({
					isCustomElement: n,
					delimiters: a
				}, r), o));
			}
		}
		e.render = i.render || r, ja && ja(e);
	}
	{
		let t = Ca(e);
		Ue();
		try {
			Lr(e);
		} finally {
			We(), t();
		}
	}
}
var Na = { get(e, t) {
	return M(e, "get", ""), e[t];
} };
function Pa(e) {
	return {
		attrs: new Proxy(e.attrs, Na),
		slots: e.slots,
		emit: e.emit,
		expose: (t) => {
			e.exposed = t || {};
		}
	};
}
function Fa(e) {
	return e.exposed ? e.exposeProxy ||= new Proxy(Zt(Ht(e.exposed)), {
		get(t, n) {
			if (n in t) return t[n];
			if (n in Mr) return Mr[n](e);
		},
		has(e, t) {
			return t in e || t in Mr;
		}
	}) : e.proxy;
}
function Ia(e) {
	return h(e) && "__vccOpts" in e;
}
var R = (e, t) => /* @__PURE__ */ $t(e, t, Ea), La = "3.5.40", Ra = void 0, za = typeof window < "u" && window.trustedTypes;
if (za) try {
	Ra = /* @__PURE__ */ za.createPolicy("vue", { createHTML: (e) => e });
} catch {}
var Ba = Ra ? (e) => Ra.createHTML(e) : (e) => e, Va = "http://www.w3.org/2000/svg", Ha = "http://www.w3.org/1998/Math/MathML", Ua = typeof document < "u" ? document : null, Wa = Ua && /* @__PURE__ */ Ua.createElement("template"), Ga = {
	insert: (e, t, n) => {
		t.insertBefore(e, n || null);
	},
	remove: (e) => {
		let t = e.parentNode;
		t && t.removeChild(e);
	},
	createElement: (e, t, n, r) => {
		let i = t === "svg" ? Ua.createElementNS(Va, e) : t === "mathml" ? Ua.createElementNS(Ha, e) : n ? Ua.createElement(e, { is: n }) : Ua.createElement(e);
		return e === "select" && r && r.multiple != null && i.setAttribute("multiple", r.multiple), i;
	},
	createText: (e) => Ua.createTextNode(e),
	createComment: (e) => Ua.createComment(e),
	setText: (e, t) => {
		e.nodeValue = t;
	},
	setElementText: (e, t) => {
		e.textContent = t;
	},
	parentNode: (e) => e.parentNode,
	nextSibling: (e) => e.nextSibling,
	querySelector: (e) => Ua.querySelector(e),
	setScopeId(e, t) {
		e.setAttribute(t, "");
	},
	insertStaticContent(e, t, n, r, i, a) {
		let o = n ? n.previousSibling : t.lastChild;
		if (i && (i === a || i.nextSibling)) for (; t.insertBefore(i.cloneNode(!0), n), !(i === a || !(i = i.nextSibling)););
		else {
			Wa.innerHTML = Ba(r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e);
			let i = Wa.content;
			if (r === "svg" || r === "mathml") {
				let e = i.firstChild;
				for (; e.firstChild;) i.appendChild(e.firstChild);
				i.removeChild(e);
			}
			t.insertBefore(i, n);
		}
		return [o ? o.nextSibling : t.firstChild, n ? n.previousSibling : t.lastChild];
	}
}, Ka = /* @__PURE__ */ Symbol("_vtc");
function qa(e, t, n) {
	let r = e[Ka];
	r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
var Ja = /* @__PURE__ */ Symbol("_vod"), Ya = /* @__PURE__ */ Symbol("_vsh"), Xa = {
	name: "show",
	beforeMount(e, { value: t }, { transition: n }) {
		e[Ja] = e.style.display === "none" ? "" : e.style.display, n && t ? n.beforeEnter(e) : Za(e, t);
	},
	mounted(e, { value: t }, { transition: n }) {
		n && t && n.enter(e);
	},
	updated(e, { value: t, oldValue: n }, { transition: r }) {
		!t != !n && (r ? t ? (r.beforeEnter(e), Za(e, !0), r.enter(e)) : r.leave(e, () => {
			Za(e, !1);
		}) : Za(e, t));
	},
	beforeUnmount(e, { value: t }) {
		Za(e, t);
	}
};
function Za(e, t) {
	e.style.display = t ? e[Ja] : "none", e[Ya] = !t;
}
var Qa = /* @__PURE__ */ Symbol(""), $a = /(?:^|;)\s*display\s*:/;
function eo(e, t, n) {
	let r = e.style, i = g(n), a = !1;
	if (n && !i) {
		if (t) if (g(t)) for (let e of t.split(";")) {
			let t = e.slice(0, e.indexOf(":")).trim();
			n[t] ?? no(r, t, "");
		}
		else for (let e in t) n[e] ?? no(r, e, "");
		for (let i in n) {
			i === "display" && (a = !0);
			let o = n[i];
			o == null ? no(r, i, "") : oo(e, i, !g(t) && t ? t[i] : void 0, o) || no(r, i, o);
		}
	} else if (i) {
		if (t !== n) {
			let e = r[Qa];
			e && (n += ";" + e), r.cssText = n, a = $a.test(n);
		}
	} else t && e.removeAttribute("style");
	Ja in e && (e[Ja] = a ? r.display : "", e[Ya] && (r.display = "none"));
}
var to = /\s*!important$/;
function no(e, t, n) {
	if (d(n)) n.forEach((n) => no(e, t, n));
	else if (n ??= "", t.startsWith("--")) e.setProperty(t, n);
	else {
		let r = ao(e, t);
		to.test(n) ? e.setProperty(w(r), n.replace(to, ""), "important") : e[r] = n;
	}
}
var ro = [
	"Webkit",
	"Moz",
	"ms"
], io = {};
function ao(e, t) {
	let n = io[t];
	if (n) return n;
	let r = C(t);
	if (r !== "filter" && r in e) return io[t] = r;
	r = oe(r);
	for (let n = 0; n < ro.length; n++) {
		let i = ro[n] + r;
		if (i in e) return io[t] = i;
	}
	return t;
}
function oo(e, t, n, r) {
	return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && g(r) && n === r;
}
var so = "http://www.w3.org/1999/xlink";
function co(e, t, n, r, i, a = _e(t)) {
	r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(so, t.slice(6, t.length)) : e.setAttributeNS(so, t, n) : n == null || a && !ve(n) ? e.removeAttribute(t) : e.setAttribute(t, a ? "" : _(n) ? String(n) : n);
}
function lo(e, t, n, r, i) {
	if (t === "innerHTML" || t === "textContent") {
		n != null && (e[t] = t === "innerHTML" ? Ba(n) : n);
		return;
	}
	let a = e.tagName;
	if (t === "value" && a !== "PROGRESS" && !a.includes("-")) {
		let r = a === "OPTION" ? e.getAttribute("value") || "" : e.value, i = n == null ? e.type === "checkbox" ? "on" : "" : String(n);
		(r !== i || !("_value" in e)) && (e.value = i), n ?? e.removeAttribute(t), e._value = n;
		return;
	}
	let o = !1;
	if (n === "" || n == null) {
		let r = typeof e[t];
		r === "boolean" ? n = ve(n) : n == null && r === "string" ? (n = "", o = !0) : r === "number" && (n = 0, o = !0);
	}
	try {
		e[t] = n;
	} catch {}
	o && e.removeAttribute(i || t);
}
function uo(e, t, n, r) {
	e.addEventListener(t, n, r);
}
function fo(e, t, n, r) {
	e.removeEventListener(t, n, r);
}
var po = /* @__PURE__ */ Symbol("_vei");
function mo(e, t, n, r, i = null) {
	let a = e[po] || (e[po] = {}), o = a[t];
	if (r && o) o.value = r;
	else {
		let [n, s] = _o(t);
		r ? uo(e, n, a[t] = xo(r, i), s) : o && (fo(e, n, o, s), a[t] = void 0);
	}
}
var ho = /(Once|Passive|Capture)$/, go = /^on:?(?:Once|Passive|Capture)$/;
function _o(e) {
	let t, n;
	for (; (n = e.match(ho)) && !go.test(e);) t ||= {}, e = e.slice(0, e.length - n[1].length), t[n[1].toLowerCase()] = !0;
	return [e[2] === ":" ? e.slice(3) : w(e.slice(2)), t];
}
var vo = 0, yo = /* @__PURE__ */ Promise.resolve(), bo = () => vo ||= (yo.then(() => vo = 0), Date.now());
function xo(e, t) {
	let n = (e) => {
		if (!e._vts) e._vts = Date.now();
		else if (e._vts <= n.attached) return;
		let r = n.value;
		if (d(r)) {
			let n = e.stopImmediatePropagation;
			e.stopImmediatePropagation = () => {
				n.call(e), e._stopped = !0;
			};
			let i = r.slice(), a = [e];
			for (let n = 0; n < i.length && !e._stopped; n++) {
				let e = i[n];
				e && cn(e, t, 5, a);
			}
		} else cn(r, t, 5, [e]);
	};
	return n.value = e, n.attached = bo(), n;
}
var So = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, Co = (e, t, n, r, i, s) => {
	let c = i === "svg";
	t === "class" ? qa(e, r, c) : t === "style" ? eo(e, n, r) : a(t) ? o(t) || mo(e, t, n, r, s) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : wo(e, t, r, c)) ? (lo(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && co(e, t, r, c, s, t !== "value")) : e._isVueCE && (To(e, t) || e._def.__asyncLoader && (/[A-Z]/.test(t) || !g(r))) ? lo(e, C(t), r, s, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), co(e, t, r, c));
};
function wo(e, t, n, r) {
	if (r) return !!(t === "innerHTML" || t === "textContent" || t in e && So(t) && h(n));
	if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA") return !1;
	if (t === "width" || t === "height") {
		let t = e.tagName;
		if (t === "IMG" || t === "VIDEO" || t === "CANVAS" || t === "SOURCE") return !1;
	}
	return So(t) && g(n) ? !1 : t in e;
}
function To(e, t) {
	let n = e._def.props;
	if (!n) return !1;
	let r = C(t);
	return Array.isArray(n) ? n.some((e) => C(e) === r) : Object.keys(n).some((e) => C(e) === r);
}
var Eo = {};
// @__NO_SIDE_EFFECTS__
function Do(e, t, n) {
	let r = /* @__PURE__ */ rr(e, t);
	S(r) && (r = s({}, r, t));
	class i extends ko {
		constructor(e) {
			super(r, e, n);
		}
	}
	return i.def = r, i;
}
var Oo = typeof HTMLElement < "u" ? HTMLElement : class {}, ko = class e extends Oo {
	constructor(e, t = {}, n = Lo) {
		super(), this._def = e, this._props = t, this._createApp = n, this._isVueCE = !0, this._instance = null, this._app = null, this._nonce = this._def.nonce, this._connected = !1, this._resolved = !1, this._patching = !1, this._dirty = !1, this._numberProps = null, this._styleChildren = /* @__PURE__ */ new WeakSet(), this._styleAnchors = /* @__PURE__ */ new WeakMap(), this._ob = null, this.shadowRoot && n !== Lo ? this._root = this.shadowRoot : e.shadowRoot === !1 ? this._root = this : (this.attachShadow(s({}, e.shadowRootOptions, { mode: "open" })), this._root = this.shadowRoot);
	}
	connectedCallback() {
		if (!this.isConnected) return;
		!this.shadowRoot && !this._resolved && this._parseSlots(), this._connected = !0;
		let t = this;
		for (; t &&= t.assignedSlot || t.parentNode || t.host;) if (t instanceof e) {
			this._parent = t;
			break;
		}
		this._instance || (this._resolved ? this._mount(this._def) : t && t._pendingResolve ? this._pendingResolve = t._pendingResolve.then(() => {
			this._pendingResolve = void 0, this._resolveDef();
		}) : this._resolveDef());
	}
	_setParent(e = this._parent) {
		e && (this._instance.parent = e._instance, this._inheritParentContext(e));
	}
	_inheritParentContext(e = this._parent) {
		e && this._app && Object.setPrototypeOf(this._app._context.provides, e._instance.provides);
	}
	disconnectedCallback() {
		this._connected = !1, vn(() => {
			this._connected || (this._ob &&= (this._ob.disconnect(), null), this._app && this._app.unmount(), this._instance && (this._instance.ce = void 0), this._app = this._instance = null, this._teleportTargets &&= (this._teleportTargets.clear(), void 0));
		});
	}
	_processMutations(e) {
		for (let t of e) this._setAttr(t.attributeName);
	}
	_resolveDef() {
		if (this._pendingResolve) return;
		for (let e = 0; e < this.attributes.length; e++) this._setAttr(this.attributes[e].name);
		this._ob = new MutationObserver(this._processMutations.bind(this)), this._ob.observe(this, { attributes: !0 });
		let e = (e, t = !1) => {
			this._resolved = !0, this._pendingResolve = void 0;
			let { props: n, styles: r } = e, i;
			if (n && !d(n)) for (let e in n) {
				let t = n[e];
				(t === Number || t && t.type === Number) && (e in this._props && (this._props[e] = le(this._props[e])), (i ||= /* @__PURE__ */ Object.create(null))[C(e)] = !0);
			}
			this._numberProps = i, this._resolveProps(e), this.shadowRoot && this._applyStyles(r), this._mount(e);
		}, t = this._def.__asyncLoader;
		t ? this._pendingResolve = t().then((t) => {
			t.configureApp = this._def.configureApp, e(this._def = t, !0);
		}) : e(this._def);
	}
	_mount(e) {
		this._app = this._createApp(e), this._inheritParentContext(), e.configureApp && e.configureApp(this._app), this._app._ceVNode = this._createVNode(), this._app.mount(this._root);
		let t = this._instance && this._instance.exposed;
		if (t) for (let e in t) u(this, e) || Object.defineProperty(this, e, { get: () => Yt(t[e]) });
	}
	_resolveProps(e) {
		let { props: t } = e, n = d(t) ? t : Object.keys(t || {});
		for (let e of Object.keys(this)) e[0] !== "_" && n.includes(e) && this._setProp(e, this[e]);
		for (let e of n.map(C)) Object.defineProperty(this, e, {
			get() {
				return this._getProp(e);
			},
			set(t) {
				this._setProp(e, t, !0, !this._patching);
			}
		});
	}
	_setAttr(e) {
		if (e.startsWith("data-v-")) return;
		let t = this.hasAttribute(e), n = t ? this.getAttribute(e) : Eo, r = C(e);
		t && this._numberProps && this._numberProps[r] && (n = le(n)), this._setProp(r, n, !1, !0);
	}
	_getProp(e) {
		return this._props[e];
	}
	_setProp(e, t, n = !0, r = !1) {
		if (t !== this._props[e] && (this._dirty = !0, t === Eo ? delete this._props[e] : (this._props[e] = t, e === "key" && this._app && (this._app._ceVNode.key = t)), r && this._instance && this._update(), n)) {
			let n = this._ob;
			n && (this._processMutations(n.takeRecords()), n.disconnect()), t === !0 ? this.setAttribute(w(e), "") : typeof t == "string" || typeof t == "number" ? this.setAttribute(w(e), t + "") : t || this.removeAttribute(w(e)), n && n.observe(this, { attributes: !0 });
		}
	}
	_update() {
		let e = this._createVNode();
		this._app && (e.appContext = this._app._context), Io(e, this._root);
	}
	_createVNode() {
		let e = {};
		this.shadowRoot || (e.onVnodeMounted = e.onVnodeUpdated = this._renderSlots.bind(this));
		let t = ia(this._def, s(e, this._props));
		return this._instance || (t.ce = (e) => {
			this._instance = e, e.ce = this, e.isCE = !0;
			let t = (e, t) => {
				this.dispatchEvent(new CustomEvent(e, S(t[0]) ? s({ detail: t }, t[0]) : { detail: t }));
			};
			e.emit = (e, ...n) => {
				t(e, n), w(e) !== e && t(w(e), n);
			}, this._setParent();
		}), t;
	}
	_applyStyles(e, t, n) {
		if (!e) return;
		if (t) {
			if (t === this._def || this._styleChildren.has(t)) return;
			this._styleChildren.add(t);
		}
		let r = this._nonce, i = this.shadowRoot, a = n ? this._getStyleAnchor(n) || this._getStyleAnchor(this._def) : this._getRootStyleInsertionAnchor(i), o = null;
		for (let s = e.length - 1; s >= 0; s--) {
			let c = document.createElement("style");
			r && c.setAttribute("nonce", r), c.textContent = e[s], i.insertBefore(c, o || a), o = c, s === 0 && (n || this._styleAnchors.set(this._def, c), t && this._styleAnchors.set(t, c));
		}
	}
	_getStyleAnchor(e) {
		if (!e) return null;
		let t = this._styleAnchors.get(e);
		return t && t.parentNode === this.shadowRoot ? t : (t && this._styleAnchors.delete(e), null);
	}
	_getRootStyleInsertionAnchor(e) {
		for (let t = 0; t < e.childNodes.length; t++) {
			let n = e.childNodes[t];
			if (!(n instanceof HTMLStyleElement)) return n;
		}
		return null;
	}
	_parseSlots() {
		let e = this._slots = {}, t;
		for (; t = this.firstChild;) {
			let n = t.nodeType === 1 && t.getAttribute("slot") || "default";
			(e[n] || (e[n] = [])).push(t), this.removeChild(t);
		}
	}
	_renderSlots() {
		let e = this._getSlots(), t = this._instance.type.__scopeId;
		for (let n = 0; n < e.length; n++) {
			let r = e[n], i = r.getAttribute("name") || "default", a = this._slots[i], o = r.parentNode;
			if (a) for (let e of a) {
				if (t && e.nodeType === 1) {
					let n = t + "-s", r = document.createTreeWalker(e, 1);
					e.setAttribute(n, "");
					let i;
					for (; i = r.nextNode();) i.setAttribute(n, "");
				}
				o.insertBefore(e, r);
			}
			else for (; r.firstChild;) o.insertBefore(r.firstChild, r);
			o.removeChild(r);
		}
	}
	_getSlots() {
		let e = [this];
		this._teleportTargets && e.push(...this._teleportTargets);
		let t = /* @__PURE__ */ new Set();
		for (let n of e) {
			let e = n.querySelectorAll("slot");
			for (let n = 0; n < e.length; n++) t.add(e[n]);
		}
		return Array.from(t);
	}
	_injectChildStyle(e, t) {
		this._applyStyles(e.styles, e, t);
	}
	_beginPatch() {
		this._patching = !0, this._dirty = !1;
	}
	_endPatch() {
		this._patching = !1, this._dirty && this._instance && this._update();
	}
	_hasShadowRoot() {
		return this._def.shadowRoot !== !1;
	}
	_removeChildStyle(e) {}
}, Ao = [
	"ctrl",
	"shift",
	"alt",
	"meta"
], jo = {
	stop: (e) => e.stopPropagation(),
	prevent: (e) => e.preventDefault(),
	self: (e) => e.target !== e.currentTarget,
	ctrl: (e) => !e.ctrlKey,
	shift: (e) => !e.shiftKey,
	alt: (e) => !e.altKey,
	meta: (e) => !e.metaKey,
	left: (e) => "button" in e && e.button !== 0,
	middle: (e) => "button" in e && e.button !== 1,
	right: (e) => "button" in e && e.button !== 2,
	exact: (e, t) => Ao.some((n) => e[`${n}Key`] && !t.includes(n))
}, Mo = (e, t) => {
	if (!e) return e;
	let n = e._withMods ||= {}, r = t.join(".");
	return n[r] || (n[r] = ((n, ...r) => {
		for (let e = 0; e < t.length; e++) {
			let r = jo[t[e]];
			if (r && r(n, t)) return;
		}
		return e(n, ...r);
	}));
}, No = /* @__PURE__ */ s({ patchProp: Co }, Ga), Po;
function Fo() {
	return Po ||= Mi(No);
}
var Io = ((...e) => {
	Fo().render(...e);
}), Lo = ((...e) => {
	let t = Fo().createApp(...e), { mount: n } = t;
	return t.mount = (e) => {
		let r = zo(e);
		if (!r) return;
		let i = t._component;
		!h(i) && !i.render && !i.template && (i.template = r.innerHTML), r.nodeType === 1 && (r.textContent = "");
		let a = n(r, !1, Ro(r));
		return r instanceof Element && (r.removeAttribute("v-cloak"), r.setAttribute("data-v-app", "")), a;
	}, t;
});
function Ro(e) {
	if (e instanceof SVGElement) return "svg";
	if (typeof MathMLElement == "function" && e instanceof MathMLElement) return "mathml";
}
function zo(e) {
	return g(e) ? document.querySelector(e) : e;
}
//#endregion
//#region node_modules/tsshogi/dist/esm/helpers/time.mjs
function Bo(e) {
	let t = Math.floor(e / 3600), n = Math.floor((e - t * 3600) / 60), r = e % 60;
	return String(t).padStart(2, "0") + ":" + String(n).padStart(2, "0") + ":" + String(r).padStart(2, "0");
}
//#endregion
//#region node_modules/tsshogi/dist/esm/color.mjs
var z;
(function(e) {
	e.BLACK = "black", e.WHITE = "white";
})(z ||= {});
function B(e) {
	return e === z.BLACK ? z.WHITE : z.BLACK;
}
function Vo(e) {
	return e === z.BLACK ? "b" : "w";
}
function Ho(e) {
	return e === "b" || e === "w";
}
function Uo(e) {
	return e === "b" ? z.BLACK : z.WHITE;
}
//#endregion
//#region node_modules/tsshogi/dist/esm/piece.mjs
var V;
(function(e) {
	e.PAWN = "pawn", e.LANCE = "lance", e.KNIGHT = "knight", e.SILVER = "silver", e.GOLD = "gold", e.BISHOP = "bishop", e.ROOK = "rook", e.KING = "king", e.PROM_PAWN = "promPawn", e.PROM_LANCE = "promLance", e.PROM_KNIGHT = "promKnight", e.PROM_SILVER = "promSilver", e.HORSE = "horse", e.DRAGON = "dragon";
})(V ||= {});
var Wo = [
	V.PAWN,
	V.LANCE,
	V.KNIGHT,
	V.SILVER,
	V.GOLD,
	V.BISHOP,
	V.ROOK,
	V.KING,
	V.PROM_PAWN,
	V.PROM_LANCE,
	V.PROM_KNIGHT,
	V.PROM_SILVER,
	V.HORSE,
	V.DRAGON
], Go = [
	V.PAWN,
	V.LANCE,
	V.KNIGHT,
	V.SILVER,
	V.GOLD,
	V.BISHOP,
	V.ROOK
], Ko = {
	pawn: !0,
	lance: !0,
	knight: !0,
	silver: !0,
	gold: !1,
	bishop: !0,
	rook: !0,
	king: !1,
	promPawn: !1,
	promLance: !1,
	promKnight: !1,
	promSilver: !1,
	horse: !1,
	dragon: !1
};
function qo(e) {
	return !!Ko[e];
}
var Jo = {
	pawn: V.PROM_PAWN,
	lance: V.PROM_LANCE,
	knight: V.PROM_KNIGHT,
	silver: V.PROM_SILVER,
	bishop: V.HORSE,
	rook: V.DRAGON
}, Yo = {
	promPawn: V.PAWN,
	promLance: V.LANCE,
	promKnight: V.KNIGHT,
	promSilver: V.SILVER,
	horse: V.BISHOP,
	dragon: V.ROOK
}, Xo = {
	pawn: "P",
	lance: "L",
	knight: "N",
	silver: "S",
	gold: "G",
	bishop: "B",
	rook: "R",
	king: "K",
	promPawn: "+P",
	promLance: "+L",
	promKnight: "+N",
	promSilver: "+S",
	horse: "+B",
	dragon: "+R"
};
function Zo(e) {
	return Xo[e];
}
var Qo = {
	pawn: "p",
	lance: "l",
	knight: "n",
	silver: "s",
	gold: "g",
	bishop: "b",
	rook: "r",
	king: "k",
	promPawn: "+p",
	promLance: "+l",
	promKnight: "+n",
	promSilver: "+s",
	horse: "+b",
	dragon: "+r"
}, $o = {
	P: V.PAWN,
	L: V.LANCE,
	N: V.KNIGHT,
	S: V.SILVER,
	G: V.GOLD,
	B: V.BISHOP,
	R: V.ROOK,
	K: V.KING,
	"+P": V.PROM_PAWN,
	"+L": V.PROM_LANCE,
	"+N": V.PROM_KNIGHT,
	"+S": V.PROM_SILVER,
	"+B": V.HORSE,
	"+R": V.DRAGON,
	p: V.PAWN,
	l: V.LANCE,
	n: V.KNIGHT,
	s: V.SILVER,
	g: V.GOLD,
	b: V.BISHOP,
	r: V.ROOK,
	k: V.KING,
	"+p": V.PROM_PAWN,
	"+l": V.PROM_LANCE,
	"+n": V.PROM_KNIGHT,
	"+s": V.PROM_SILVER,
	"+b": V.HORSE,
	"+r": V.DRAGON
}, es = {
	P: z.BLACK,
	L: z.BLACK,
	N: z.BLACK,
	S: z.BLACK,
	G: z.BLACK,
	B: z.BLACK,
	R: z.BLACK,
	K: z.BLACK,
	"+P": z.BLACK,
	"+L": z.BLACK,
	"+N": z.BLACK,
	"+S": z.BLACK,
	"+B": z.BLACK,
	"+R": z.BLACK,
	p: z.WHITE,
	l: z.WHITE,
	n: z.WHITE,
	s: z.WHITE,
	g: z.WHITE,
	b: z.WHITE,
	r: z.WHITE,
	k: z.WHITE,
	"+p": z.WHITE,
	"+l": z.WHITE,
	"+n": z.WHITE,
	"+s": z.WHITE,
	"+b": z.WHITE,
	"+r": z.WHITE
}, ts = /* @__PURE__ */ new Map();
ts.set(V.PAWN, {
	type: V.PROM_PAWN,
	reverseColor: !1
}), ts.set(V.LANCE, {
	type: V.PROM_LANCE,
	reverseColor: !1
}), ts.set(V.KNIGHT, {
	type: V.PROM_KNIGHT,
	reverseColor: !1
}), ts.set(V.SILVER, {
	type: V.PROM_SILVER,
	reverseColor: !1
}), ts.set(V.GOLD, {
	type: V.GOLD,
	reverseColor: !0
}), ts.set(V.BISHOP, {
	type: V.HORSE,
	reverseColor: !1
}), ts.set(V.ROOK, {
	type: V.DRAGON,
	reverseColor: !1
}), ts.set(V.KING, {
	type: V.KING,
	reverseColor: !0
}), ts.set(V.PROM_PAWN, {
	type: V.PAWN,
	reverseColor: !0
}), ts.set(V.PROM_LANCE, {
	type: V.LANCE,
	reverseColor: !0
}), ts.set(V.PROM_KNIGHT, {
	type: V.KNIGHT,
	reverseColor: !0
}), ts.set(V.PROM_SILVER, {
	type: V.SILVER,
	reverseColor: !0
}), ts.set(V.HORSE, {
	type: V.BISHOP,
	reverseColor: !0
}), ts.set(V.DRAGON, {
	type: V.ROOK,
	reverseColor: !0
});
var H = class e {
	color;
	type;
	constructor(e, t) {
		this.color = e, this.type = t;
	}
	black() {
		return this.withColor(z.BLACK);
	}
	white() {
		return this.withColor(z.WHITE);
	}
	withColor(t) {
		return new e(t, this.type);
	}
	equals(e) {
		return this.type === e.type && this.color === e.color;
	}
	promoted() {
		let t = Jo[this.type];
		return new e(this.color, t || this.type);
	}
	unpromoted() {
		let t = Yo[this.type];
		return new e(this.color, t || this.type);
	}
	isPromotable() {
		return qo(this.type);
	}
	rotate() {
		let t = ts.get(this.type), n = new e(this.color, t ? t.type : this.type);
		return t && t.reverseColor && (n.color = B(this.color)), n;
	}
	get id() {
		return this.color + "_" + this.type;
	}
	get sfen() {
		switch (this.color) {
			default:
			case z.BLACK: return Xo[this.type];
			case z.WHITE: return Qo[this.type];
		}
	}
	static isValidSFEN(e) {
		return !!$o[e];
	}
	static newBySFEN(t) {
		let n = $o[t];
		if (!n) return null;
		let r = es[t];
		return r ? new e(r, n) : null;
	}
}, U;
(function(e) {
	e.UP = "up", e.DOWN = "down", e.LEFT = "left", e.RIGHT = "right", e.LEFT_UP = "left_up", e.RIGHT_UP = "right_up", e.LEFT_DOWN = "left_down", e.RIGHT_DOWN = "right_down", e.LEFT_UP_KNIGHT = "left_up_knight", e.RIGHT_UP_KNIGHT = "right_up_knight", e.LEFT_DOWN_KNIGHT = "left_down_knight", e.RIGHT_DOWN_KNIGHT = "right_down_knight";
})(U ||= {});
var ns = {
	up: U.DOWN,
	down: U.UP,
	left: U.RIGHT,
	right: U.LEFT,
	left_up: U.RIGHT_DOWN,
	right_up: U.LEFT_DOWN,
	left_down: U.RIGHT_UP,
	right_down: U.LEFT_UP,
	left_up_knight: U.RIGHT_DOWN_KNIGHT,
	right_up_knight: U.LEFT_DOWN_KNIGHT,
	left_down_knight: U.RIGHT_UP_KNIGHT,
	right_down_knight: U.LEFT_UP_KNIGHT
};
function rs(e) {
	return ns[e];
}
var is = [
	U.UP,
	U.DOWN,
	U.LEFT,
	U.RIGHT,
	U.LEFT_UP,
	U.RIGHT_UP,
	U.LEFT_DOWN,
	U.RIGHT_DOWN,
	U.LEFT_UP_KNIGHT,
	U.RIGHT_UP_KNIGHT,
	U.LEFT_DOWN_KNIGHT,
	U.RIGHT_DOWN_KNIGHT
], W;
(function(e) {
	e.SHORT = "short", e.LONG = "long";
})(W ||= {});
var as = {
	black: {
		pawn: { up: W.SHORT },
		lance: { up: W.LONG },
		knight: {
			left_up_knight: W.SHORT,
			right_up_knight: W.SHORT
		},
		silver: {
			left_up: W.SHORT,
			up: W.SHORT,
			right_up: W.SHORT,
			left_down: W.SHORT,
			right_down: W.SHORT
		},
		gold: {
			left_up: W.SHORT,
			up: W.SHORT,
			right_up: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			down: W.SHORT
		},
		bishop: {
			left_up: W.LONG,
			right_up: W.LONG,
			left_down: W.LONG,
			right_down: W.LONG
		},
		rook: {
			up: W.LONG,
			left: W.LONG,
			right: W.LONG,
			down: W.LONG
		},
		king: {
			left_down: W.SHORT,
			right_down: W.SHORT,
			left_up: W.SHORT,
			right_up: W.SHORT,
			down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		promPawn: {
			left_up: W.SHORT,
			up: W.SHORT,
			right_up: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			down: W.SHORT
		},
		promLance: {
			left_up: W.SHORT,
			up: W.SHORT,
			right_up: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			down: W.SHORT
		},
		promKnight: {
			left_up: W.SHORT,
			up: W.SHORT,
			right_up: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			down: W.SHORT
		},
		promSilver: {
			left_up: W.SHORT,
			up: W.SHORT,
			right_up: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			down: W.SHORT
		},
		horse: {
			left_up: W.LONG,
			right_up: W.LONG,
			left_down: W.LONG,
			right_down: W.LONG,
			up: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			down: W.SHORT
		},
		dragon: {
			up: W.LONG,
			left: W.LONG,
			right: W.LONG,
			down: W.LONG,
			left_up: W.SHORT,
			right_up: W.SHORT,
			left_down: W.SHORT,
			right_down: W.SHORT
		}
	},
	white: {
		pawn: { down: W.SHORT },
		lance: { down: W.LONG },
		knight: {
			left_down_knight: W.SHORT,
			right_down_knight: W.SHORT
		},
		silver: {
			left_down: W.SHORT,
			down: W.SHORT,
			right_down: W.SHORT,
			left_up: W.SHORT,
			right_up: W.SHORT
		},
		gold: {
			left_down: W.SHORT,
			down: W.SHORT,
			right_down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		bishop: {
			left_down: W.LONG,
			right_down: W.LONG,
			left_up: W.LONG,
			right_up: W.LONG
		},
		rook: {
			down: W.LONG,
			left: W.LONG,
			right: W.LONG,
			up: W.LONG
		},
		king: {
			left_down: W.SHORT,
			right_down: W.SHORT,
			left_up: W.SHORT,
			right_up: W.SHORT,
			down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		promPawn: {
			left_down: W.SHORT,
			down: W.SHORT,
			right_down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		promLance: {
			left_down: W.SHORT,
			down: W.SHORT,
			right_down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		promKnight: {
			left_down: W.SHORT,
			down: W.SHORT,
			right_down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		promSilver: {
			left_down: W.SHORT,
			down: W.SHORT,
			right_down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		horse: {
			left_down: W.LONG,
			right_down: W.LONG,
			left_up: W.LONG,
			right_up: W.LONG,
			down: W.SHORT,
			left: W.SHORT,
			right: W.SHORT,
			up: W.SHORT
		},
		dragon: {
			down: W.LONG,
			left: W.LONG,
			right: W.LONG,
			up: W.LONG,
			left_down: W.SHORT,
			right_down: W.SHORT,
			left_up: W.SHORT,
			right_up: W.SHORT
		}
	}
};
function os(e) {
	return Object.keys(as[e.color][e.type]);
}
function ss(e, t) {
	return as[e.color][e.type][t];
}
var cs = {
	up: {
		x: 0,
		y: -1
	},
	down: {
		x: 0,
		y: 1
	},
	left: {
		x: -1,
		y: 0
	},
	right: {
		x: 1,
		y: 0
	},
	left_up: {
		x: -1,
		y: -1
	},
	right_up: {
		x: 1,
		y: -1
	},
	left_down: {
		x: -1,
		y: 1
	},
	right_down: {
		x: 1,
		y: 1
	},
	left_up_knight: {
		x: -1,
		y: -2
	},
	right_up_knight: {
		x: 1,
		y: -2
	},
	left_down_knight: {
		x: -1,
		y: 2
	},
	right_down_knight: {
		x: 1,
		y: 2
	}
};
function ls(e, t) {
	if (e === 1 && t === -2) return {
		direction: U.RIGHT_UP_KNIGHT,
		distance: 1,
		ok: !0
	};
	if (e === -1 && t === -2) return {
		direction: U.LEFT_UP_KNIGHT,
		distance: 1,
		ok: !0
	};
	if (e === 1 && t === 2) return {
		direction: U.RIGHT_DOWN_KNIGHT,
		distance: 1,
		ok: !0
	};
	if (e === -1 && t === 2) return {
		direction: U.LEFT_DOWN_KNIGHT,
		distance: 1,
		ok: !0
	};
	if (e !== 0 && t !== 0 && Math.abs(e) !== Math.abs(t)) return {
		direction: "",
		distance: 0,
		ok: !1
	};
	let n = e, r = t, i = 0;
	return n !== 0 && (i = Math.abs(n), n /= i), r !== 0 && (i = Math.abs(r), r /= i), n === -1 && r === -1 ? {
		direction: U.LEFT_UP,
		distance: i,
		ok: !0
	} : n === 0 && r === -1 ? {
		direction: U.UP,
		distance: i,
		ok: !0
	} : n === 1 && r === -1 ? {
		direction: U.RIGHT_UP,
		distance: i,
		ok: !0
	} : n === -1 && r === 0 ? {
		direction: U.LEFT,
		distance: i,
		ok: !0
	} : n === 1 && r === 0 ? {
		direction: U.RIGHT,
		distance: i,
		ok: !0
	} : n === -1 && r === 1 ? {
		direction: U.LEFT_DOWN,
		distance: i,
		ok: !0
	} : n === 0 && r === 1 ? {
		direction: U.DOWN,
		distance: i,
		ok: !0
	} : n === 1 && r === 1 ? {
		direction: U.RIGHT_DOWN,
		distance: i,
		ok: !0
	} : {
		direction: "",
		distance: 0,
		ok: !1
	};
}
var us;
(function(e) {
	e.UP = "up", e.NONE = "none", e.DOWN = "down";
})(us ||= {});
var ds;
(function(e) {
	e.LEFT = "left", e.NONE = "none", e.RIGHT = "right";
})(ds ||= {});
//#endregion
//#region node_modules/tsshogi/dist/esm/square.mjs
function fs(e) {
	return e >= "1" && e <= "9" ? Number(e) : null;
}
function ps(e) {
	switch (e) {
		case "a": return 1;
		case "b": return 2;
		case "c": return 3;
		case "d": return 4;
		case "e": return 5;
		case "f": return 6;
		case "g": return 7;
		case "h": return 8;
		case "i": return 9;
		default: return null;
	}
}
var ms = [
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i"
], G = class e {
	file;
	rank;
	constructor(e, t) {
		this.file = e, this.rank = t;
	}
	get x() {
		return 9 - this.file;
	}
	get y() {
		return this.rank - 1;
	}
	get index() {
		return this.y * 9 + this.x;
	}
	get opposite() {
		return new e(10 - this.file, 10 - this.rank);
	}
	neighbor(t, n) {
		switch (t) {
			case U.UP: return new e(this.file, this.rank - 1);
			case U.DOWN: return new e(this.file, this.rank + 1);
			case U.LEFT: return new e(this.file + 1, this.rank);
			case U.RIGHT: return new e(this.file - 1, this.rank);
			case U.LEFT_UP: return new e(this.file + 1, this.rank - 1);
			case U.RIGHT_UP: return new e(this.file - 1, this.rank - 1);
			case U.LEFT_DOWN: return new e(this.file + 1, this.rank + 1);
			case U.RIGHT_DOWN: return new e(this.file - 1, this.rank + 1);
			case U.LEFT_UP_KNIGHT: return new e(this.file + 1, this.rank - 2);
			case U.RIGHT_UP_KNIGHT: return new e(this.file - 1, this.rank - 2);
			case U.LEFT_DOWN_KNIGHT: return new e(this.file + 1, this.rank + 2);
			case U.RIGHT_DOWN_KNIGHT: return new e(this.file - 1, this.rank + 2);
		}
		let r = t, i = n;
		return new e(this.file - r, this.rank + i);
	}
	directionTo(e) {
		return ls(e.x - this.x, e.y - this.y).direction;
	}
	get valid() {
		return this.file >= 1 && this.file <= 9 && this.rank >= 1 && this.rank <= 9;
	}
	equals(e) {
		return !!e && this.file === e.file && this.rank === e.rank;
	}
	static newByXY(t, n) {
		return new e(9 - t, n + 1);
	}
	static newByIndex(t) {
		return new e(9 - t % 9, Math.trunc(t / 9) + 1);
	}
	static all = [];
	get sfen() {
		return this.usi;
	}
	get usi() {
		return this.file + ms[this.rank - 1];
	}
	static parseSFENSquare(t) {
		return e.newByUSI(t);
	}
	static newByUSI(t) {
		let n = fs(t[0]), r = ps(t[1]);
		return !n || !r ? null : new e(n, r);
	}
};
for (let e = 0; e < 81; e += 1) G.all.push(G.newByIndex(e));
//#endregion
//#region node_modules/tsshogi/dist/esm/move.mjs
var hs = class e {
	from;
	to;
	promote;
	color;
	pieceType;
	capturedPieceType;
	constructor(e, t, n, r, i, a) {
		this.from = e, this.to = t, this.promote = n, this.color = r, this.pieceType = i, this.capturedPieceType = a;
	}
	equals(e) {
		return e ? (this.from instanceof G && e.from instanceof G && this.from.equals(e.from) || !(this.from instanceof G) && !(e.from instanceof G) && this.from === e.from) && this.to.equals(e.to) && this.promote === e.promote && this.color === e.color && this.pieceType === e.pieceType && this.capturedPieceType === e.capturedPieceType : !1;
	}
	withPromote() {
		return new e(this.from, this.to, !0, this.color, this.pieceType, this.capturedPieceType);
	}
	get usi() {
		let e = "";
		return this.from instanceof G ? e += this.from.usi : e += Zo(this.from) + "*", e += this.to.usi, this.promote && (e += "+"), e;
	}
};
function gs(e) {
	let t;
	if (e[1] === "*") {
		let n = H.newBySFEN(e[0]);
		if (!n) return null;
		t = n.type;
	} else {
		let n = G.newByUSI(e);
		if (!n) return null;
		t = n;
	}
	let n = G.newByUSI(e.substring(2));
	if (!n) return null;
	let r = e.length >= 5 && e[4] === "+";
	return {
		from: t,
		to: n,
		promote: r
	};
}
var K;
(function(e) {
	e.START = "start", e.INTERRUPT = "interrupt", e.RESIGN = "resign", e.MAX_MOVES = "maxMoves", e.IMPASS = "impass", e.DRAW = "draw", e.REPETITION_DRAW = "repetitionDraw", e.MATE = "mate", e.NO_MATE = "noMate", e.TIMEOUT = "timeout", e.FOUL_WIN = "foulWin", e.FOUL_LOSE = "foulLose", e.ENTERING_OF_KING = "enteringOfKing", e.WIN_BY_DEFAULT = "winByDefault", e.LOSE_BY_DEFAULT = "loseByDefault", e.TRY = "try";
})(K ||= {});
//#endregion
//#region node_modules/tsshogi/dist/esm/board.mjs
function _s(e) {
	switch (e) {
		case "1": return 1;
		case "2": return 2;
		case "3": return 3;
		case "4": return 4;
		case "5": return 5;
		case "6": return 6;
		case "7": return 7;
		case "8": return 8;
		case "9": return 9;
		default: return null;
	}
}
var vs = class e {
	squares;
	constructor() {
		this.squares = [];
		for (let e = 0; e < 81; e += 1) this.squares.push(null);
		this.resetBySFEN("lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL");
	}
	at(e) {
		return this.squares[e.index];
	}
	set(e, t) {
		this.squares[e.index] = t;
	}
	swap(e, t) {
		let n = this.squares[e.index];
		this.squares[e.index] = this.squares[t.index], this.squares[t.index] = n;
	}
	remove(e) {
		let t = this.squares[e.index];
		return this.squares[e.index] = null, t;
	}
	listNonEmptySquares() {
		return G.all.filter((e) => this.squares[e.index]);
	}
	listSquaresByColor(e) {
		return G.all.filter((t) => {
			let n = this.squares[t.index];
			return n && n.color === e;
		});
	}
	listSquaresByPiece(e) {
		return G.all.filter((t) => {
			let n = this.squares[t.index];
			return n && e.equals(n);
		});
	}
	clear() {
		G.all.forEach((e) => {
			this.squares[e.index] = null;
		});
	}
	get sfen() {
		let e = "", t = 0;
		for (let n = 0; n < 9; n += 1) {
			for (let r = 0; r < 9; r += 1) {
				let i = this.at(G.newByXY(r, n));
				i ? (t &&= (e += t, 0), e += i.sfen) : t += 1;
			}
			t &&= (e += t, 0), n !== 8 && (e += "/");
		}
		return e;
	}
	resetBySFEN(t) {
		if (!e.isValidSFEN(t)) return !1;
		this.clear();
		let n = t.split("/");
		for (let e = 0; e < 9; e += 1) {
			let t = 0;
			for (let r = 0; r < n[e].length; r += 1) {
				let i = n[e][r];
				i === "+" && (r += 1, i += n[e][r]);
				let a = _s(i);
				a ? t += a : (this.set(G.newByXY(t, e), H.newBySFEN(i)), t += 1);
			}
		}
		return !0;
	}
	findKing(e) {
		let t = new H(e, V.KING);
		return G.all.find((e) => {
			let n = this.at(e);
			if (n && t.equals(n)) return !0;
		});
	}
	hasPower(e, t, n) {
		return !!is.find((r) => {
			let i = 0;
			for (let a = e.neighbor(r); a.valid && (i += 1, !(n && n.filled && a.equals(n.filled))); a = a.neighbor(r)) {
				if (n && n.ignore && a.equals(n.ignore)) continue;
				let e = this.at(a);
				if (e) {
					if (e.color !== t) return !1;
					let n = ss(e, rs(r));
					return n === W.LONG || n === W.SHORT && i === 1;
				}
			}
			return !1;
		});
	}
	isChecked(e, t) {
		let n = this.findKing(e);
		return n ? this.hasPower(n, B(e), {
			filled: t && t.filled,
			ignore: t && t.ignore
		}) : !1;
	}
	static isValidSFEN(e) {
		let t = e.split("/");
		if (t.length !== 9) return !1;
		for (let e = 0; e < 9; e += 1) {
			let n = 0;
			for (let r = 0; r < t[e].length; r += 1) {
				let i = t[e][r];
				i === "+" && (r += 1, i += t[e][r]);
				let a = _s(i);
				if (a) n += a;
				else if (H.isValidSFEN(i)) n += 1;
				else return !1;
			}
			if (n !== 9) return !1;
		}
		return !0;
	}
	copyFrom(e) {
		G.all.forEach((t) => {
			this.squares[t.index] = e.at(t);
		});
	}
};
//#endregion
//#region node_modules/tsshogi/dist/esm/hand.mjs
function ys(e, t) {
	return e === 0 ? "" : (e === 1 ? "" : e) + t.sfen;
}
var bs = class e {
	pieces;
	constructor() {
		this.pieces = /* @__PURE__ */ new Map(), this.pieces.set(V.PAWN, 0), this.pieces.set(V.LANCE, 0), this.pieces.set(V.KNIGHT, 0), this.pieces.set(V.SILVER, 0), this.pieces.set(V.GOLD, 0), this.pieces.set(V.BISHOP, 0), this.pieces.set(V.ROOK, 0);
	}
	get counts() {
		return [
			{
				type: V.ROOK,
				count: this.count(V.ROOK)
			},
			{
				type: V.BISHOP,
				count: this.count(V.BISHOP)
			},
			{
				type: V.GOLD,
				count: this.count(V.GOLD)
			},
			{
				type: V.SILVER,
				count: this.count(V.SILVER)
			},
			{
				type: V.KNIGHT,
				count: this.count(V.KNIGHT)
			},
			{
				type: V.LANCE,
				count: this.count(V.LANCE)
			},
			{
				type: V.PAWN,
				count: this.count(V.PAWN)
			}
		];
	}
	count(e) {
		return Math.max(this.pieces.get(e), 0);
	}
	set(e, t) {
		this.pieces.set(e, t);
	}
	add(e, t) {
		let n = this.pieces.get(e);
		return n += t, this.pieces.set(e, n), n;
	}
	reduce(e, t) {
		let n = this.pieces.get(e);
		return n -= t, this.pieces.set(e, n), n;
	}
	forEach(e) {
		e(V.PAWN, this.pieces.get(V.PAWN)), e(V.LANCE, this.pieces.get(V.LANCE)), e(V.KNIGHT, this.pieces.get(V.KNIGHT)), e(V.SILVER, this.pieces.get(V.SILVER)), e(V.GOLD, this.pieces.get(V.GOLD)), e(V.BISHOP, this.pieces.get(V.BISHOP)), e(V.ROOK, this.pieces.get(V.ROOK));
	}
	get sfenBlack() {
		return this.formatSFEN(z.BLACK);
	}
	get sfenWhite() {
		return this.formatSFEN(z.WHITE);
	}
	formatSFEN(e) {
		let t = "";
		return t += ys(this.count(V.ROOK), new H(e, V.ROOK)), t += ys(this.count(V.BISHOP), new H(e, V.BISHOP)), t += ys(this.count(V.GOLD), new H(e, V.GOLD)), t += ys(this.count(V.SILVER), new H(e, V.SILVER)), t += ys(this.count(V.KNIGHT), new H(e, V.KNIGHT)), t += ys(this.count(V.LANCE), new H(e, V.LANCE)), t += ys(this.count(V.PAWN), new H(e, V.PAWN)), t === "" ? "-" : t;
	}
	static formatSFEN(e, t) {
		let n = e.sfenBlack, r = t.sfenWhite;
		return n === "-" && r === "-" ? "-" : r === "-" ? n : n === "-" ? r : n + r;
	}
	static isValidSFEN(e) {
		return e === "-" || /^(?:[0-9]{0,2}[PLNSGBRplnsgbr])+$/.test(e);
	}
	static parseSFEN(t) {
		if (t === "-") return {
			black: new e(),
			white: new e()
		};
		let n = t.match(/([0-9]{0,2}[PLNSGBRplnsgbr])/g);
		if (!n) return null;
		let r = new e(), i = new e();
		for (let e = 0; e < n.length; e += 1) {
			let t = n[e], a = 1;
			t.length >= 2 && (a = Number(t.substring(0, t.length - 1)));
			let o = H.newBySFEN(t[t.length - 1]);
			o.color === z.BLACK ? r.add(o.type, a) : i.add(o.type, a);
		}
		return {
			black: r,
			white: i
		};
	}
	copyFrom(e) {
		e.pieces.forEach((e, t) => {
			this.pieces.set(t, e);
		});
	}
}, xs;
(function(e) {
	e.STANDARD = "standard", e.EMPTY = "empty", e.HANDICAP_LANCE = "handicapLance", e.HANDICAP_RIGHT_LANCE = "handicapRightLance", e.HANDICAP_BISHOP = "handicapBishop", e.HANDICAP_ROOK = "handicapRook", e.HANDICAP_ROOK_LANCE = "handicapRookLance", e.HANDICAP_2PIECES = "handicap2Pieces", e.HANDICAP_4PIECES = "handicap4Pieces", e.HANDICAP_6PIECES = "handicap6Pieces", e.HANDICAP_8PIECES = "handicap8Pieces", e.HANDICAP_10PIECES = "handicap10Pieces", e.TSUME_SHOGI = "tsumeShogi", e.TSUME_SHOGI_2KINGS = "tsumeShogi2Kings";
})(xs ||= {});
var q;
(function(e) {
	e.STANDARD = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1", e.EMPTY = "9/9/9/9/9/9/9/9/9 b - 1", e.HANDICAP_LANCE = "lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_RIGHT_LANCE = "1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_BISHOP = "lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_ROOK = "lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_ROOK_LANCE = "lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_2PIECES = "lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_4PIECES = "1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_6PIECES = "2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_8PIECES = "3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.HANDICAP_10PIECES = "4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1", e.TSUME_SHOGI = "4k4/9/9/9/9/9/9/9/9 b 2r2b4g4s4n4l18p 1", e.TSUME_SHOGI_2KINGS = "4k4/9/9/9/9/9/9/9/4K4 b 2r2b4g4s4n4l18p 1";
})(q ||= {});
function Ss(e) {
	return {
		[xs.STANDARD]: q.STANDARD,
		[xs.EMPTY]: q.EMPTY,
		[xs.HANDICAP_LANCE]: q.HANDICAP_LANCE,
		[xs.HANDICAP_RIGHT_LANCE]: q.HANDICAP_RIGHT_LANCE,
		[xs.HANDICAP_BISHOP]: q.HANDICAP_BISHOP,
		[xs.HANDICAP_ROOK]: q.HANDICAP_ROOK,
		[xs.HANDICAP_ROOK_LANCE]: q.HANDICAP_ROOK_LANCE,
		[xs.HANDICAP_2PIECES]: q.HANDICAP_2PIECES,
		[xs.HANDICAP_4PIECES]: q.HANDICAP_4PIECES,
		[xs.HANDICAP_6PIECES]: q.HANDICAP_6PIECES,
		[xs.HANDICAP_8PIECES]: q.HANDICAP_8PIECES,
		[xs.HANDICAP_10PIECES]: q.HANDICAP_10PIECES,
		[xs.TSUME_SHOGI]: q.TSUME_SHOGI,
		[xs.TSUME_SHOGI_2KINGS]: q.TSUME_SHOGI_2KINGS
	}[e];
}
var Cs = {
	black: {
		pawn: { 1: !0 },
		lance: { 1: !0 },
		knight: {
			1: !0,
			2: !0
		}
	},
	white: {
		pawn: { 9: !0 },
		lance: { 9: !0 },
		knight: {
			9: !0,
			8: !0
		}
	}
};
function ws(e, t, n) {
	let r = Cs[e][t];
	return r ? r[n] : !1;
}
function Ts(e, t) {
	return e === z.BLACK ? t <= 3 : t >= 7;
}
function Es(e, t, n) {
	for (let r = 1; r <= 9; r += 1) {
		let i = t.at(new G(n, r));
		if (i && i.type === V.PAWN && i.color === e) return !0;
	}
	return !1;
}
var Ds = class e {
	_board = new vs();
	_color = z.BLACK;
	_blackHand = new bs();
	_whiteHand = new bs();
	get board() {
		return this._board;
	}
	get color() {
		return this._color;
	}
	get blackHand() {
		return this._blackHand;
	}
	get whiteHand() {
		return this._whiteHand;
	}
	hand(e) {
		return e === z.BLACK ? this._blackHand : this._whiteHand;
	}
	get checked() {
		return this._board.isChecked(this.color);
	}
	createMove(e, t) {
		let n;
		if (e instanceof G) {
			let t = this._board.at(e);
			if (!t) return null;
			n = t.type;
		} else n = e;
		let r = this._board.at(t);
		return new hs(e, t, !1, this.color, n, r ? r.type : null);
	}
	createMoveByUSI(e) {
		let t = gs(e);
		if (!t) return null;
		let n = this.createMove(t.from, t.to);
		return n ? (t.promote && (n = n.withPromote()), n) : null;
	}
	isPawnDropMate(e) {
		if (e.from instanceof G || e.pieceType !== V.PAWN) return !1;
		let t = e.to.neighbor(e.color === z.BLACK ? U.UP : U.DOWN), n = this.board.at(t);
		return !n || n.type !== V.KING || n.color === e.color || os(n).find((r) => {
			let i = t.neighbor(r);
			if (!i.valid) return !1;
			let a = this.board.at(i);
			return a && a.color == n.color ? !1 : !this.board.hasPower(i, e.color, { filled: e.to });
		}) ? !1 : !this.board.listSquaresByColor(n.color).find((r) => !r.equals(t) && this.isMovable(r, e.to) && !this.board.isChecked(n.color, {
			filled: e.to,
			ignore: r
		}));
	}
	listAttackers(e) {
		return this.board.listNonEmptySquares().filter((t) => this.isMovable(t, e));
	}
	listAttackersByPiece(e, t) {
		return this.board.listSquaresByPiece(t).filter((t) => this.isMovable(t, e));
	}
	isValidMove(e) {
		if (e.from instanceof G) {
			let t = this._board.at(e.from);
			if (!t || t.color !== this.color || t.type !== e.pieceType || !this.isMovable(e.from, e.to)) return !1;
			let n = this._board.at(e.to);
			if (n && n.color === this.color || n === null != (e.capturedPieceType === null) || n && e.capturedPieceType && n.type !== e.capturedPieceType) return !1;
			if (e.promote) {
				if (!t.isPromotable() || !Ts(this.color, e.from.rank) && !Ts(this.color, e.to.rank)) return !1;
			} else if (ws(this.color, t.type, e.to.rank)) return !1;
			if (e.pieceType === V.KING ? this._board.hasPower(e.to, B(this.color), { ignore: e.from }) : this._board.isChecked(this.color, {
				filled: e.to,
				ignore: e.from
			})) return !1;
		} else if (e.promote || e.color !== this.color || this.hand(this.color).count(e.from) === 0 || this._board.at(e.to) || ws(this.color, e.from, e.to.rank) || e.from === V.PAWN && Es(this.color, this._board, e.to.file) || this._board.isChecked(this.color, { filled: e.to }) || this.isPawnDropMate(e)) return !1;
		return !0;
	}
	doMove(e, t) {
		if (!(t && t.ignoreValidation) && !this.isValidMove(e)) return !1;
		if (e.from instanceof G) {
			let t = this._board.at(e.from);
			if (!t) return !1;
			let n = this._board.at(e.to);
			this._board.remove(e.from), this._board.set(e.to, e.promote ? t.promoted() : t), n && n.type !== V.KING && this.hand(this.color).add(n.unpromoted().type, 1);
		} else this.hand(this.color).reduce(e.from, 1), this._board.set(e.to, new H(this.color, e.from));
		return this._color = B(this.color), !0;
	}
	undoMove(e) {
		if (this._color = B(this.color), e.from instanceof G) if (this._board.set(e.from, new H(this.color, e.pieceType)), e.capturedPieceType) {
			let t = new H(B(this.color), e.capturedPieceType);
			this._board.set(e.to, t), t.type !== V.KING && this.hand(this.color).reduce(t.unpromoted().type, 1);
		} else this._board.remove(e.to);
		else this.hand(this.color).add(e.from, 1), this._board.remove(e.to);
	}
	isValidEditing(e, t) {
		if (e instanceof G) {
			let n = this._board.at(e);
			if (!n) return !1;
			if (t instanceof G) {
				if (e.equals(t)) return !1;
			} else if (n.type === V.KING) return !1;
		} else {
			if (!e.color || this.hand(e.color).count(e.type) === 0) return !1;
			if (t instanceof G) {
				if (this._board.at(t)) return !1;
			} else if (e.color === t) return !1;
		}
		return !0;
	}
	edit(e) {
		if (e.move) {
			if (!this.isValidEditing(e.move.from, e.move.to)) return !1;
			if (!(e.move.from instanceof G)) this.hand(e.move.from.color).reduce(e.move.from.type, 1), e.move.to instanceof G ? this._board.set(e.move.to, e.move.from) : this.hand(e.move.to).add(e.move.from.type, 1);
			else if (e.move.to instanceof G) this._board.swap(e.move.from, e.move.to);
			else {
				let t = this._board.remove(e.move.from);
				this.hand(e.move.to).add(t.unpromoted().type, 1);
			}
		}
		if (e.rotate) {
			let t = this._board.at(e.rotate);
			t && this._board.set(e.rotate, t.rotate());
		}
		return !0;
	}
	reset(e) {
		this.resetBySFEN(Ss(e));
	}
	get sfen() {
		return this.getSFEN(1);
	}
	getSFEN(e) {
		let t = `${this._board.sfen} ${Vo(this.color)} `;
		return t += bs.formatSFEN(this._blackHand, this._whiteHand), t += " " + Math.max(e, 1), t;
	}
	resetBySFEN(t) {
		if (!e.isValidSFEN(t)) return !1;
		let n = t.split(" ");
		n[0] === "sfen" && n.shift(), this._board.resetBySFEN(n[0]), this._color = Uo(n[1]);
		let r = bs.parseSFEN(n[2]);
		return this._blackHand = r.black, this._whiteHand = r.white, !0;
	}
	setColor(e) {
		this._color = e;
	}
	static isValidSFEN(e) {
		let t = e.split(" ");
		return (t.length === 5 || t.length === 4) && t[0] === "sfen" && t.shift(), !(t.length !== 4 && t.length !== 3 || !vs.isValidSFEN(t[0]) || !Ho(t[1]) || !bs.isValidSFEN(t[2]) || t.length === 4 && !/[0-9]+/.test(t[3]));
	}
	static newBySFEN(t) {
		let n = new e();
		return n.resetBySFEN(t) ? n : null;
	}
	isMovable(e, t) {
		let { direction: n, distance: r, ok: i } = ls(t.x - e.x, t.y - e.y);
		if (!i) return !1;
		let a = this._board.at(e);
		if (!a) return !1;
		switch (ss(a, n)) {
			default: return !1;
			case W.SHORT: return r === 1;
			case W.LONG: {
				let r = cs[n];
				for (let n = e.neighbor(r.x, r.y); n.valid; n = n.neighbor(r.x, r.y)) {
					if (n.equals(t)) return !0;
					if (this._board.at(n)) return !1;
				}
				return !1;
			}
		}
	}
	copyFrom(e) {
		this._board.copyFrom(e._board), this._color = e.color, this._blackHand.copyFrom(e._blackHand), this._whiteHand.copyFrom(e._whiteHand);
	}
	clone() {
		let t = new e();
		return t.copyFrom(this), t;
	}
}, Os;
(function(e) {
	e.GENERAL24 = "general24", e.GENERAL27 = "general27";
})(Os ||= {});
var ks;
(function(e) {
	e.WIN = "win", e.LOSE = "lose", e.DRAW = "draw";
})(ks ||= {}), V.KING, V.KING, V.ROOK, V.DRAGON, V.DRAGON, V.BISHOP, V.HORSE, V.GOLD, V.SILVER, V.PROM_SILVER, V.PROM_SILVER, V.KNIGHT, V.PROM_KNIGHT, V.PROM_KNIGHT, V.LANCE, V.PROM_LANCE, V.PROM_LANCE, V.PAWN, V.PROM_PAWN, K.START, K.RESIGN, K.INTERRUPT, K.MAX_MOVES, K.IMPASS, K.DRAW, K.REPETITION_DRAW, K.MATE, K.NO_MATE, K.TIMEOUT, K.FOUL_WIN, K.FOUL_LOSE, K.ENTERING_OF_KING, K.WIN_BY_DEFAULT, K.LOSE_BY_DEFAULT, K.TRY, V.PAWN, V.LANCE, V.KNIGHT, V.SILVER, V.GOLD, V.BISHOP, V.ROOK, V.KING, V.PROM_PAWN, V.PROM_LANCE, V.PROM_KNIGHT, V.PROM_SILVER, V.HORSE, V.DRAGON, V.PAWN, V.LANCE, V.KNIGHT, V.SILVER, V.GOLD, V.BISHOP, V.ROOK, V.KING, V.PROM_PAWN, V.PROM_LANCE, V.PROM_KNIGHT, V.PROM_SILVER, V.HORSE, V.DRAGON;
var J;
(function(e) {
	e.TITLE = "title", e.BLACK_NAME = "blackName", e.WHITE_NAME = "whiteName", e.SHITATE_NAME = "shitateName", e.UWATE_NAME = "uwateName", e.BLACK_SHORT_NAME = "blackShortName", e.WHITE_SHORT_NAME = "whiteShortName", e.START_DATETIME = "startDatetime", e.END_DATETIME = "endDatetime", e.DATE = "date", e.TOURNAMENT = "tournament", e.STRATEGY = "strategy", e.TIME_LIMIT = "timeLimit", e.BLACK_TIME_LIMIT = "blackTimeLimit", e.WHITE_TIME_LIMIT = "whiteTimeLimit", e.BYOYOMI = "byoyomi", e.TIME_SPENT = "timeSpent", e.MAX_MOVES = "maxMoves", e.JISHOGI = "jishogi", e.PLACE = "place", e.POSTED_ON = "postedOn", e.NOTE = "note", e.SCOREKEEPER = "scorekeeper", e.OPUS_NO = "opusNo", e.OPUS_NAME = "opusName", e.AUTHOR = "author", e.PUBLISHED_BY = "publishedBy", e.PUBLISHED_AT = "publishedAt", e.SOURCE = "source", e.LENGTH = "length", e.INTEGRITY = "integrity", e.CATEGORY = "category", e.AWARD = "award";
})(J ||= {});
//#endregion
//#region node_modules/tsshogi/dist/esm/kakinoki.mjs
var As;
(function(e) {
	e.KIF = "KIF", e.KI2 = "KI2";
})(As ||= {}), J.BLACK_NAME, J.WHITE_NAME, J.SHITATE_NAME, J.UWATE_NAME, J.START_DATETIME, J.END_DATETIME, J.DATE, J.TOURNAMENT, J.STRATEGY, J.TITLE, J.TIME_LIMIT, J.BYOYOMI, J.TIME_SPENT, J.PLACE, J.POSTED_ON, J.NOTE, J.BLACK_SHORT_NAME, J.WHITE_SHORT_NAME, J.SCOREKEEPER, J.OPUS_NO, J.OPUS_NAME, J.AUTHOR, J.PUBLISHED_BY, J.PUBLISHED_AT, J.SOURCE, J.LENGTH, J.INTEGRITY, J.CATEGORY, J.AWARD, J.BLACK_TIME_LIMIT, J.WHITE_TIME_LIMIT, J.MAX_MOVES, J.JISHOGI, J.BLACK_NAME, J.WHITE_NAME, J.SHITATE_NAME, J.UWATE_NAME, J.START_DATETIME, J.END_DATETIME, J.DATE, J.TOURNAMENT, J.STRATEGY, J.TITLE, J.TIME_LIMIT, J.BYOYOMI, J.TIME_SPENT, J.PLACE, J.POSTED_ON, J.NOTE, J.BLACK_SHORT_NAME, J.WHITE_SHORT_NAME, J.SCOREKEEPER, J.OPUS_NO, J.OPUS_NAME, J.AUTHOR, J.PUBLISHED_BY, J.PUBLISHED_AT, J.SOURCE, J.LENGTH, J.INTEGRITY, J.CATEGORY, J.AWARD, J.BLACK_TIME_LIMIT, J.WHITE_TIME_LIMIT, J.MAX_MOVES, J.JISHOGI;
var js;
(function(e) {
	e[e.PROGRAM_COMMENT = 0] = "PROGRAM_COMMENT", e[e.METADATA = 1] = "METADATA", e[e.HANDICAP = 2] = "HANDICAP", e[e.BLACK_HAND = 3] = "BLACK_HAND", e[e.WHITE_HAND = 4] = "WHITE_HAND", e[e.BOARD = 5] = "BOARD", e[e.BLACK_TURN = 6] = "BLACK_TURN", e[e.WHITE_TURN = 7] = "WHITE_TURN", e[e.MOVE = 8] = "MOVE", e[e.MOVE2 = 9] = "MOVE2", e[e.BRANCH = 10] = "BRANCH", e[e.COMMENT = 11] = "COMMENT", e[e.BOOKMARK = 12] = "BOOKMARK", e[e.END_OF_GAME = 13] = "END_OF_GAME", e[e.UNKNOWN = 14] = "UNKNOWN";
})(js ||= {}), js.PROGRAM_COMMENT, js.HANDICAP, js.BLACK_HAND, js.WHITE_HAND, js.BOARD, js.BLACK_TURN, js.WHITE_TURN, js.MOVE, js.MOVE2, js.BRANCH, js.COMMENT, js.BOOKMARK, js.END_OF_GAME, K.INTERRUPT, K.RESIGN, K.IMPASS, K.REPETITION_DRAW, K.MATE, K.MATE, K.NO_MATE, K.TIMEOUT, K.FOUL_WIN, K.FOUL_LOSE, K.ENTERING_OF_KING, K.WIN_BY_DEFAULT, K.LOSE_BY_DEFAULT, K.START, K.RESIGN, K.INTERRUPT, K.MAX_MOVES, K.IMPASS, K.DRAW, K.REPETITION_DRAW, K.MATE, K.NO_MATE, K.TIMEOUT, K.FOUL_WIN, K.FOUL_LOSE, K.ENTERING_OF_KING, K.WIN_BY_DEFAULT, K.LOSE_BY_DEFAULT, K.TRY;
//#endregion
//#region node_modules/tsshogi/dist/esm/csa.mjs
var Ms;
(function(e) {
	e[e.VERSION = 0] = "VERSION", e[e.EXTENDED_COMMENT = 1] = "EXTENDED_COMMENT", e[e.COMMENT = 2] = "COMMENT", e[e.BLACK_NAME = 3] = "BLACK_NAME", e[e.WHITE_NAME = 4] = "WHITE_NAME", e[e.METADATA = 5] = "METADATA", e[e.POSITION = 6] = "POSITION", e[e.RANK = 7] = "RANK", e[e.PIECES = 8] = "PIECES", e[e.FIRST_TURN = 9] = "FIRST_TURN", e[e.MOVE = 10] = "MOVE", e[e.SPECIAL_MOVE = 11] = "SPECIAL_MOVE", e[e.ELAPSED = 12] = "ELAPSED";
})(Ms ||= {});
var Ns;
(function(e) {
	e[e.HEADER = 0] = "HEADER", e[e.MOVE = 1] = "MOVE", e[e.NEUTRAL = 2] = "NEUTRAL";
})(Ns ||= {}), Ms.VERSION, Ns.HEADER, Ms.EXTENDED_COMMENT, Ns.NEUTRAL, Ms.COMMENT, Ns.NEUTRAL, Ms.BLACK_NAME, Ns.HEADER, Ms.WHITE_NAME, Ns.HEADER, Ms.METADATA, Ns.HEADER, Ms.POSITION, Ns.HEADER, Ms.RANK, Ns.HEADER, Ms.PIECES, Ns.HEADER, Ms.FIRST_TURN, Ns.HEADER, Ms.MOVE, Ns.MOVE, Ms.SPECIAL_MOVE, Ns.MOVE, Ms.ELAPSED, Ns.MOVE, J.TITLE, J.PLACE, J.START_DATETIME, J.END_DATETIME, J.TIME_LIMIT, J.TIME_LIMIT, J.BLACK_TIME_LIMIT, J.WHITE_TIME_LIMIT, J.STRATEGY, J.MAX_MOVES, J.JISHOGI, J.NOTE, V.PAWN, V.LANCE, V.KNIGHT, V.SILVER, V.GOLD, V.BISHOP, V.ROOK, V.KING, V.PROM_PAWN, V.PROM_LANCE, V.PROM_KNIGHT, V.PROM_SILVER, V.HORSE, V.DRAGON, q.STANDARD, q.HANDICAP_LANCE, q.HANDICAP_RIGHT_LANCE, q.HANDICAP_BISHOP, q.HANDICAP_ROOK, q.HANDICAP_ROOK_LANCE, q.HANDICAP_2PIECES, q.HANDICAP_4PIECES, q.HANDICAP_6PIECES, q.HANDICAP_8PIECES, q.HANDICAP_10PIECES;
//#endregion
//#region node_modules/tsshogi/dist/esm/jkf.mjs
var Ps;
(function(e) {
	e[e.BLACK = 0] = "BLACK", e[e.WHITE = 1] = "WHITE";
})(Ps ||= {});
var Fs;
(function(e) {
	e.TORYO = "TORYO", e.CHUDAN = "CHUDAN", e.SENNICHITE = "SENNICHITE", e.TIME_UP = "TIME_UP", e.ILLEGAL_MOVE = "ILLEGAL_MOVE", e.BLACK_ILLEGAL_ACTION = "+ILLEGAL_ACTION", e.WHITE_ILLEGAL_ACTION = "-ILLEGAL_ACTION", e.JISHOGI = "JISHOGI", e.KACHI = "KACHI", e.HIKIWAKE = "HIKIWAKE", e.MAX_MOVES = "MAX_MOVES", e.MATTA = "MATTA", e.TSUMI = "TSUMI", e.FUZUMI = "FUZUMI", e.ERROR = "ERROR";
})(Fs ||= {});
var Is;
(function(e) {
	e.FU = "FU", e.KY = "KY", e.KE = "KE", e.GI = "GI", e.KI = "KI", e.KA = "KA", e.HI = "HI", e.OU = "OU", e.TO = "TO", e.NY = "NY", e.NK = "NK", e.NG = "NG", e.UM = "UM", e.RY = "RY";
})(Is ||= {});
//#endregion
//#region node_modules/tsshogi/dist/esm/detect.mjs
var Ls;
(function(e) {
	e[e.USI = 0] = "USI", e[e.SFEN = 1] = "SFEN", e[e.KIF = 2] = "KIF", e[e.KI2 = 3] = "KI2", e[e.CSA = 4] = "CSA", e[e.JKF = 5] = "JKF", e[e.USEN = 6] = "USEN";
})(Ls ||= {});
//#endregion
//#region src/common/settings/app.ts
var Y = /* @__PURE__ */ function(e) {
	return e.LIGHT = "light", e.LIGHT2 = "light2", e.LIGHT3 = "light3", e.WARM = "warm", e.WARM2 = "warm2", e.DARK = "dark", e.CUSTOM_IMAGE = "custom-image", e;
}({}), Rs = /* @__PURE__ */ function(e) {
	return e.GYOKU_AND_OSHO = "gyokuAndOsho", e.GYOKU_AND_GYOKU = "gyokuAndGyoku", e;
}({}), zs = /* @__PURE__ */ function(e) {
	return e.STANDARD = "standard", e.DARK_WOOD = "dark-wood", e.CUSTOM_IMAGE = "custom-image", e;
}({}), Bs = /* @__PURE__ */ function(e) {
	return e.STRONGER_TO_LEFT = "strongerToLeft", e.STRONGER_TO_RIGHT = "strongerToRight", e;
}({}), Vs = /* @__PURE__ */ function(e) {
	return e.HORIZONTAL = "horizontal", e.VERTICAL_PREFER_BOTTOM = "verticalPreferBottom", e.HORIZONTAL_PREFER_RIGHT = "horizontalPreferRight", e;
}({}), Hs = /* @__PURE__ */ function(e) {
	return e.NONE = "none", e.STANDARD = "standard", e;
}({}), Us = class e {
	width;
	height;
	constructor(e, t) {
		this.width = e, this.height = t;
	}
	add(t) {
		return new e(this.width + t.width, this.height + t.height);
	}
	reduce(t) {
		return new e(this.width - t.width, this.height - t.height);
	}
	equals(e) {
		return this.width === e.width && this.height === e.height;
	}
}, Ws = class e {
	x;
	y;
	constructor(e, t) {
		this.x = e, this.y = t;
	}
	add(t) {
		return new e(this.x + t.x, this.y + t.y);
	}
	reduce(t) {
		return new e(this.x - t.x, this.y - t.y);
	}
	distanceTo(e) {
		return Math.sqrt((this.x - e.x) ** 2 + (this.y - e.y) ** 2);
	}
	angleTo(e) {
		return Math.atan2(e.y - this.y, e.x - this.x);
	}
	multiply(t) {
		return new e(this.x * t, this.y * t);
	}
	equals(e) {
		return this.x === e.x && this.y === e.y;
	}
}, Gs = [...Wo, "king2"];
function Ks(e, t) {
	return `${e}_${t.replace(/([A-Z])/g, "_$1").toLowerCase()}`;
}
//#endregion
//#region src/renderer/assets/preload.ts
var qs = {};
function Js(e) {
	if (qs[e]) return;
	let t = document.createElement("img");
	t.src = e, qs[e] = t;
}
//#endregion
//#region src/renderer/view/primitive/board/config.ts
function Ys(e) {
	let t = {
		boardImageType: e.boardImageType,
		pieceStandImageType: e.pieceStandImageType,
		handPieceOrder: e.handPieceOrder ?? Bs.STRONGER_TO_LEFT,
		kingPieceType: e.kingPieceType,
		pieceImages: Zs(e.pieceImageURLTemplate, e.kingPieceType),
		boardGridColor: Qs(e.boardImageType),
		boardTextureImage: $s(e.boardImageType, e.customBoardImageURL),
		pieceStandImage: Xs(e.pieceStandImageType, e.customPieceStandImageURL),
		boardImageOpacity: e.boardImageOpacity,
		pieceStandImageOpacity: e.pieceStandImageOpacity,
		promotionSelectorStyle: e.promotionSelectorStyle,
		boardLabelType: e.boardLabelType,
		upperSizeLimit: e.upperSizeLimit,
		flip: e.flip,
		hideClock: e.hideClock
	};
	return t.boardTextureImage && Js(t.boardTextureImage), t.pieceStandImage && Js(t.pieceStandImage), Object.values(t.pieceImages.black).forEach(Js), Object.values(t.pieceImages.white).forEach(Js), t;
}
function Xs(e, t) {
	switch (e) {
		case zs.DARK_WOOD: return "./stand/wood_dark.png";
		case zs.CUSTOM_IMAGE: return t || null;
	}
	return null;
}
function Zs(e, t) {
	let n = {}, r = {};
	for (let t of Gs) n[t] = e.replaceAll("${piece}", Ks(z.BLACK, t)), r[t] = e.replaceAll("${piece}", Ks(z.WHITE, t));
	let i = {
		black: n,
		white: r
	};
	return t === Rs.GYOKU_AND_GYOKU && (i.black.king = i.black.king2, i.white.king = i.white.king2), i;
}
function Qs(e) {
	switch (e) {
		default: return "black";
		case Y.DARK: return "white";
	}
}
function $s(e, t) {
	switch (e) {
		case Y.LIGHT: return "./board/wood_light.png";
		case Y.LIGHT2: return "./board/wood_light2.png";
		case Y.LIGHT3: return "./board/wood_light3.png";
		case Y.WARM: return "./board/wood_warm.png";
		case Y.WARM2: return "./board/wood_warm2.png";
		case Y.CUSTOM_IMAGE: return t || null;
	}
	return null;
}
//#endregion
//#region src/renderer/view/primitive/board/params.ts
var ec = { piece: {
	width: 88,
	height: 93
} }, X = {
	width: 878,
	height: 960,
	squareWidth: 94.85,
	squareHeight: 104,
	leftSquarePadding: 12.6,
	topSquarePadding: 12.8,
	leftPiecePadding: 16,
	topPiecePadding: 18.5,
	highlight: {
		selected: {
			"background-color": "#0088ff",
			opacity: "0.8"
		},
		lastMoveTo: {
			"background-color": "#44cc44",
			opacity: "0.8"
		},
		lastMoveFrom: {
			"background-color": "#44cc44",
			opacity: "0.4"
		}
	},
	label: { fontSize: 24 }
}, tc = {
	width: 288,
	height: 360,
	highlight: { selected: {
		"background-color": "#ff4800",
		opacity: "0.7"
	} },
	black: {
		pawn: {
			row: 3,
			column: 0,
			width: 2
		},
		lance: {
			row: 2,
			column: 1,
			width: 1
		},
		knight: {
			row: 2,
			column: 0,
			width: 1
		},
		silver: {
			row: 1,
			column: 1,
			width: 1
		},
		gold: {
			row: 1,
			column: 0,
			width: 1
		},
		bishop: {
			row: 0,
			column: 1,
			width: 1
		},
		rook: {
			row: 0,
			column: 0,
			width: 1
		},
		king: {
			row: 0,
			column: 0,
			width: 0
		},
		promPawn: {
			row: 0,
			column: 0,
			width: 0
		},
		promLance: {
			row: 0,
			column: 0,
			width: 0
		},
		promKnight: {
			row: 0,
			column: 0,
			width: 0
		},
		promSilver: {
			row: 0,
			column: 0,
			width: 0
		},
		horse: {
			row: 0,
			column: 0,
			width: 0
		},
		dragon: {
			row: 0,
			column: 0,
			width: 0
		}
	},
	white: {
		pawn: {
			row: 0,
			column: 0,
			width: 2
		},
		lance: {
			row: 1,
			column: 0,
			width: 1
		},
		knight: {
			row: 1,
			column: 1,
			width: 1
		},
		silver: {
			row: 2,
			column: 0,
			width: 1
		},
		gold: {
			row: 2,
			column: 1,
			width: 1
		},
		bishop: {
			row: 3,
			column: 0,
			width: 1
		},
		rook: {
			row: 3,
			column: 1,
			width: 1
		},
		king: {
			row: 0,
			column: 0,
			width: 0
		},
		promPawn: {
			row: 0,
			column: 0,
			width: 0
		},
		promLance: {
			row: 0,
			column: 0,
			width: 0
		},
		promKnight: {
			row: 0,
			column: 0,
			width: 0
		},
		promSilver: {
			row: 0,
			column: 0,
			width: 0
		},
		horse: {
			row: 0,
			column: 0,
			width: 0
		},
		dragon: {
			row: 0,
			column: 0,
			width: 0
		}
	}
}, Z = {
	frame: {
		width: 1471,
		height: 959
	},
	board: {
		x: 296.5,
		y: 0
	},
	hand: {
		black: {
			x: 1184,
			y: 600
		},
		white: {
			x: 0,
			y: 0
		}
	},
	turn: {
		black: {
			x: 1184,
			y: 425,
			y2: 490
		},
		white: {
			x: 0,
			y: 495,
			y2: 430
		},
		width: 288,
		height: 45,
		fontSize: 32
	},
	playerName: {
		black: {
			x: 1184,
			y: 480,
			y2: 545
		},
		white: {
			x: 0,
			y: 370,
			y2: 370
		},
		width: 288,
		height: 45,
		fontSize: 25
	},
	clock: {
		black: {
			x: 1184,
			y: 535
		},
		white: {
			x: 0,
			y: 425
		},
		width: 288,
		height: 55,
		fontSize: 40
	},
	control: {
		left: {
			x: 0,
			y: 547,
			width: 288,
			height: 412,
			fontSize: 32
		},
		right: {
			x: 1184,
			y: 0,
			width: 288,
			height: 412,
			fontSize: 32
		}
	}
}, nc = {
	width: 95,
	height: 728,
	highlight: { selected: {
		"background-color": "#ff4800",
		opacity: "0.7"
	} },
	squareWidth: 95,
	squareHeight: 104,
	leftPiecePadding: 3.4,
	topPiecePadding: 5.7
}, Q = {
	frame: {
		width: 1088,
		height: 1015
	},
	board: {
		x: 105,
		y: 56
	},
	hand: {
		black: {
			x: 993,
			y: 287
		},
		white: {
			x: 0,
			y: 56
		}
	},
	turn: {
		black: {
			x: 575,
			y: 3
		},
		white: {
			x: 304,
			y: 3
		},
		width: 214,
		height: 50,
		fontSize: 30
	},
	playerName: {
		black: {
			x: 788,
			y: 0
		},
		white: {
			x: 0,
			y: 0
		},
		width: 300,
		height: 52,
		fontSize: 25
	},
	clock: {
		black: {
			x: 575,
			y: 0
		},
		white: {
			x: 300,
			y: 0
		},
		width: 214,
		height: 52,
		fontSize: 30
	}
}, rc = {
	width: 664,
	height: 104,
	highlight: { selected: {
		"background-color": "#ff4800",
		opacity: "0.7"
	} },
	squareWidth: 94.85,
	squareHeight: 104,
	leftPiecePadding: 3.4,
	topPiecePadding: 5.7
}, $ = {
	frame: {
		width: 878,
		height: 1168
	},
	board: {
		x: 0,
		y: 104
	},
	hand: {
		black: {
			x: 0,
			y: 1064
		},
		white: {
			x: 214,
			y: 0
		}
	},
	turn: {
		black: {
			x: 664,
			y: 1068
		},
		white: {
			x: 0,
			y: 54
		},
		width: 214,
		height: 50,
		fontSize: 30
	},
	playerName: {
		black: {
			x: 664,
			y: 1116
		},
		white: {
			x: 0,
			y: 0
		},
		width: 214,
		height: 52,
		fontSize: 25
	},
	clock: {
		black: {
			x: 664,
			y: 1064
		},
		white: {
			x: 0,
			y: 50
		},
		width: 214,
		height: 52,
		fontSize: 30
	}
}, ic = class {
	config;
	constructor(e) {
		this.config = e;
	}
	get ratio() {
		let e = this.config.upperSizeLimit.width / Z.frame.width;
		return Z.frame.height * e > this.config.upperSizeLimit.height && (e = this.config.upperSizeLimit.height / Z.frame.height), e;
	}
	get boardBasePoint() {
		return new Ws(Z.board.x, Z.board.y).multiply(this.ratio);
	}
	get blackHandBasePoint() {
		let e = this.config.flip ? Z.hand.white : Z.hand.black;
		return new Ws(e.x, e.y).multiply(this.ratio);
	}
	get whiteHandBasePoint() {
		let e = this.config.flip ? Z.hand.black : Z.hand.white;
		return new Ws(e.x, e.y).multiply(this.ratio);
	}
	build(e) {
		let t = this.ratio, n = () => {
			let e = Z.frame.height * t, n = Z.frame.width * t;
			return {
				style: {
					height: e + "px",
					width: n + "px"
				},
				size: new Us(n, e)
			};
		}, r = () => {
			let n = e.color, r = this.config.flip ? B(n) : n, i = Z.turn[r], a = i.x, o = this.config.hideClock ? i.y2 : i.y;
			return { style: {
				left: a * t - 2 + "px",
				top: o * t - 2 + "px",
				width: Z.turn.width * t - 2 + "px",
				height: Z.turn.height * t - 2 + "px",
				"font-size": Z.turn.fontSize * t + "px",
				"border-radius": Z.turn.height * t * .4 + "px",
				"border-width": "2px",
				"border-style": "solid"
			} };
		}, i = (e) => {
			let n = this.config.flip ? B(e) : e, r = Z.playerName[n], i = r.x, a = this.config.hideClock ? r.y2 : r.y;
			return { style: {
				left: i * t + "px",
				top: a * t + "px",
				width: Z.playerName.width * t + "px",
				height: Z.playerName.height * t + "px",
				"font-size": Z.playerName.fontSize * t + "px"
			} };
		}, a = (e) => {
			let n = this.config.flip ? B(e) : e;
			return { style: {
				left: Z.clock[n].x * t + "px",
				top: Z.clock[n].y * t + "px",
				width: Z.clock.width * t + "px",
				height: Z.clock.height * t + "px",
				"font-size": Z.clock.fontSize * t + "px"
			} };
		}, o = () => ({
			left: { style: {
				left: Z.control.left.x * t + "px",
				top: Z.control.left.y * t + "px",
				width: Z.control.left.width * t + "px",
				height: Z.control.left.height * t + "px",
				"font-size": Z.control.left.fontSize * t + "px"
			} },
			right: { style: {
				left: Z.control.right.x * t + "px",
				top: Z.control.right.y * t + "px",
				width: Z.control.right.width * t + "px",
				height: Z.control.right.height * t + "px",
				"font-size": Z.control.right.fontSize * t + "px"
			} }
		}), s = this.boardBasePoint, c = this.blackHandBasePoint, l = this.whiteHandBasePoint;
		return {
			ratio: t,
			frame: n(),
			boardStyle: {
				left: s.x + "px",
				top: s.y + "px"
			},
			blackHandStyle: {
				left: c.x + "px",
				top: c.y + "px"
			},
			whiteHandStyle: {
				left: l.x + "px",
				top: l.y + "px"
			},
			turn: r(),
			blackPlayerName: i(z.BLACK),
			whitePlayerName: i(z.WHITE),
			blackClock: this.config.hideClock ? void 0 : a(z.BLACK),
			whiteClock: this.config.hideClock ? void 0 : a(z.WHITE),
			control: o()
		};
	}
}, ac = class {
	config;
	constructor(e) {
		this.config = e;
	}
	get ratio() {
		let e = this.config.upperSizeLimit.width / $.frame.width;
		return $.frame.height * e > this.config.upperSizeLimit.height && (e = this.config.upperSizeLimit.height / $.frame.height), e;
	}
	get boardBasePoint() {
		return new Ws($.board.x, $.board.y).multiply(this.ratio);
	}
	get blackHandBasePoint() {
		let e = this.config.flip ? $.hand.white : $.hand.black;
		return new Ws(e.x, e.y).multiply(this.ratio);
	}
	get whiteHandBasePoint() {
		let e = this.config.flip ? $.hand.black : $.hand.white;
		return new Ws(e.x, e.y).multiply(this.ratio);
	}
	build(e) {
		let t = this.ratio, n = () => {
			let e = $.frame.height * t, n = $.frame.width * t;
			return {
				style: {
					height: e + "px",
					width: n + "px"
				},
				size: new Us(n, e)
			};
		}, r = () => {
			let n = e.color, r = this.config.flip ? B(n) : n, i = $.turn[r];
			return { style: {
				left: i.x * t - 2 + "px",
				top: i.y * t - 2 + "px",
				width: $.turn.width * t - 2 + "px",
				height: $.turn.height * t - 2 + "px",
				"font-size": $.turn.fontSize * t + "px",
				"border-radius": $.turn.height * t * .4 + "px",
				"border-width": "2px",
				"border-style": "solid"
			} };
		}, i = (e) => {
			let n = this.config.flip ? B(e) : e, r = $.playerName[n];
			return { style: {
				left: r.x * t + "px",
				top: r.y * t + "px",
				width: $.playerName.width * t + "px",
				height: $.playerName.height * t + "px",
				"font-size": $.playerName.fontSize * t + "px"
			} };
		}, a = (e) => {
			let n = this.config.flip ? B(e) : e, r = $.clock[n];
			return { style: {
				left: r.x * t + "px",
				top: r.y * t + "px",
				width: $.clock.width * t + "px",
				height: $.clock.height * t + "px",
				"font-size": $.clock.fontSize * t + "px"
			} };
		}, o = this.boardBasePoint, s = this.blackHandBasePoint, c = this.whiteHandBasePoint;
		return {
			ratio: t,
			frame: n(),
			boardStyle: {
				left: o.x + "px",
				top: o.y + "px"
			},
			blackHandStyle: {
				left: s.x + "px",
				top: s.y + "px"
			},
			whiteHandStyle: {
				left: c.x + "px",
				top: c.y + "px"
			},
			turn: this.config.hideClock ? r() : void 0,
			blackPlayerName: i(z.BLACK),
			whitePlayerName: i(z.WHITE),
			blackClock: this.config.hideClock ? void 0 : a(z.BLACK),
			whiteClock: this.config.hideClock ? void 0 : a(z.WHITE)
		};
	}
}, oc = {
	[Y.LIGHT]: "rgba(0, 0, 0, 0)",
	[Y.LIGHT2]: "rgba(0, 0, 0, 0)",
	[Y.LIGHT3]: "rgba(0, 0, 0, 0)",
	[Y.WARM]: "rgba(0, 0, 0, 0)",
	[Y.WARM2]: "rgba(0, 0, 0, 0)",
	[Y.RESIN]: "#d69b00",
	[Y.RESIN2]: "#efbf63",
	[Y.RESIN3]: "#ad7624",
	[Y.GREEN]: "#598459",
	[Y.CHERRY_BLOSSOM]: "#ecb6b6",
	[Y.AUTUMN]: "#d09f51",
	[Y.SNOW]: "#c3c0d3",
	[Y.DARK_GREEN]: "#465e5e",
	[Y.DARK]: "#333333",
	[Y.CUSTOM_IMAGE]: "rgba(0, 0, 0, 0)"
}, sc = {
	1: "一",
	2: "二",
	3: "三",
	4: "四",
	5: "五",
	6: "六",
	7: "七",
	8: "八",
	9: "九"
}, cc = class {
	config;
	ratio;
	constructor(e, t) {
		this.config = e, this.ratio = t;
	}
	centerOfSquare(e) {
		return new Ws((X.leftSquarePadding + X.squareWidth * ((this.config.flip ? e.opposite : e).x + .5)) * this.ratio, (X.topSquarePadding + X.squareHeight * ((this.config.flip ? e.opposite : e).y + .5)) * this.ratio);
	}
	get background() {
		let e = {
			"background-color": oc[this.config.boardImageType],
			left: "0px",
			top: "0px",
			height: X.height * this.ratio + "px",
			width: X.width * this.ratio + "px",
			opacity: this.config.boardImageOpacity.toString()
		};
		return {
			gridColor: this.config.boardGridColor,
			textureImagePath: this.config.boardTextureImage,
			style: e
		};
	}
	get labels() {
		if (this.config.boardLabelType == Hs.NONE) return [];
		let e = [], t = X.label.fontSize * this.ratio, n = t * .1, r = {
			color: "black",
			"font-size": t + "px",
			"font-weight": "bold",
			"text-shadow": `${n}px ${n}px  ${n}px white`
		};
		for (let n = 1; n <= 9; n++) {
			let i = X.leftPiecePadding * .5 * this.ratio * (this.config.flip ? 1 : -1) - t * .5 + (this.config.flip ? 0 : X.width) * this.ratio, a = (X.topSquarePadding + ((this.config.flip ? 10 - n : n) - .5) * X.squareHeight) * this.ratio - t * .5;
			e.push({
				id: "rank" + n,
				character: sc[n],
				style: {
					left: i + "px",
					top: a + "px",
					...r
				}
			});
		}
		for (let n = 1; n <= 9; n++) {
			let i = (X.leftPiecePadding + (9.5 - (this.config.flip ? 10 - n : n)) * X.squareWidth) * this.ratio - t * .5, a = (this.config.flip ? X.height : 0) * this.ratio + X.topSquarePadding * .7 * this.ratio * (this.config.flip ? -1 : 1) - t * .6;
			e.push({
				id: "file" + n,
				character: String(n),
				style: {
					left: i + "px",
					top: a + "px",
					...r
				}
			});
		}
		return e;
	}
	getPieces(e, t) {
		let n = [];
		return e.listNonEmptySquares().forEach((r) => {
			if (t && r.equals(t)) return;
			let i = e.at(r), a = i.id + r.index, o = this.config.flip ? B(i.color) : i.color, s = i.type == V.KING && i.color == z.BLACK ? "king2" : i.type, c = this.config.pieceImages[o][s], l = (X.leftPiecePadding + X.squareWidth * (this.config.flip ? r.opposite : r).x) * this.ratio, u = (X.topPiecePadding + X.squareHeight * (this.config.flip ? r.opposite : r).y) * this.ratio, d = ec.piece.width * this.ratio, f = ec.piece.height * this.ratio;
			n.push({
				id: a,
				imagePath: c,
				style: {
					left: l + "px",
					top: u + "px",
					width: d + "px",
					height: f + "px"
				}
			});
		}), n;
	}
	getSquares(e, t) {
		let n = [];
		return G.all.forEach((r) => {
			let i = r.index, { file: a } = r, { rank: o } = r, s = (X.leftSquarePadding + X.squareWidth * (this.config.flip ? r.opposite : r).x) * this.ratio, c = (X.topSquarePadding + X.squareHeight * (this.config.flip ? r.opposite : r).y) * this.ratio, l = X.squareWidth * this.ratio, u = X.squareHeight * this.ratio, d = {
				left: s + "px",
				top: c + "px",
				width: l + "px",
				height: u + "px"
			}, f = d;
			e && r.equals(e.to) && (f = {
				...f,
				...X.highlight.lastMoveTo
			}), e && e.from instanceof G && r.equals(e.from) && (f = {
				...f,
				...X.highlight.lastMoveFrom
			}), t instanceof G && t.equals(r) && (f = {
				...f,
				...X.highlight.selected
			}), n.push({
				id: i,
				file: a,
				rank: o,
				style: d,
				backgroundStyle: f
			});
		}), n;
	}
	getPromotionControls(e) {
		if (!e) return [null, null];
		let t = this.config.flip ? B(e.color) : e.color, n = this.config.flip ? e.to.opposite : e.to, r = new H(t, e.pieceType), i = r.promoted(), a = r.unpromoted(), o = this.config.pieceImages[t][i.type], s = this.config.pieceImages[t][a.type], c = X.squareWidth * this.ratio, l = X.squareHeight * this.ratio, u, d, f, p;
		switch (this.config.promotionSelectorStyle) {
			case Vs.HORIZONTAL:
				u = (X.leftSquarePadding + X.squareWidth * (n.x === 0 ? 0 : n.x === 8 ? 7 : n.x - .5)) * this.ratio, d = p = (X.topSquarePadding + X.squareHeight * n.y) * this.ratio, f = u + c;
				break;
			case Vs.VERTICAL_PREFER_BOTTOM:
				u = f = (X.leftSquarePadding + X.squareWidth * n.x) * this.ratio, d = (X.topSquarePadding + X.squareHeight * n.y) * this.ratio, p = d + (n.y === 8 ? -l : l);
				break;
			case Vs.HORIZONTAL_PREFER_RIGHT:
				u = (X.leftSquarePadding + X.squareWidth * n.x) * this.ratio, d = p = (X.topSquarePadding + X.squareHeight * n.y) * this.ratio, f = u + (n.x === 8 ? -c : c);
				break;
		}
		let m = {
			left: u + "px",
			top: d + "px",
			width: c + "px",
			height: l + "px"
		}, h = {
			left: f + "px",
			top: p + "px",
			width: c + "px",
			height: l + "px"
		};
		return [{
			imagePath: o,
			style: m
		}, {
			imagePath: s,
			style: h
		}];
	}
	build(e, t, n, r, i) {
		let [a, o] = this.getPromotionControls(r);
		return {
			background: this.background,
			labels: this.labels,
			pieces: this.getPieces(e, i),
			squares: this.getSquares(t, n),
			promote: a,
			doNotPromote: o
		};
	}
}, lc = {
	[zs.STANDARD]: "#8b4513",
	[zs.DARK_WOOD]: "rgba(0, 0, 0, 0)",
	[zs.GREEN]: "#527a52",
	[zs.CHERRY_BLOSSOM]: "#e8a9a9",
	[zs.AUTUMN]: "#792509",
	[zs.SNOW]: "#9c98b7",
	[zs.DARK_GREEN]: "#465e5e",
	[zs.DARK]: "#333333",
	[zs.CUSTOM_IMAGE]: "rgba(0, 0, 0, 0)"
}, uc = class {
	config;
	ratio;
	constructor(e, t) {
		this.config = e, this.ratio = t;
	}
	getRule(e, t) {
		let n = tc[e][t];
		return this.config.handPieceOrder === Bs.STRONGER_TO_RIGHT && n.width === 1 ? {
			...n,
			column: 1 - n.column
		} : n;
	}
	centerOfPieceType(e, t, n) {
		let r = this.config.flip ? B(t) : t, i = this.getRule(r, n);
		return new Ws((i.column + .5) * i.width * (tc.width / 2), (i.row + .5) * (tc.height / 4)).multiply(this.ratio);
	}
	build(e, t, n, r) {
		let i = this.config.flip ? B(t) : t, a = lc[this.config.pieceStandImageType], o = tc.width * this.ratio, s = tc.height * this.ratio, c = {
			left: "0px",
			top: "0px",
			width: o + "px",
			height: s + "px"
		}, l = {
			left: "0px",
			top: "0px",
			width: o + "px",
			height: s + "px",
			"background-color": a,
			opacity: this.config.pieceStandImageOpacity.toString()
		}, u = [], d = [];
		return Go.forEach((a) => {
			let o = e.count(a), s = this.getRule(i, a), c = tc.width / 2 * s.width * this.ratio, l = tc.height / 4 * this.ratio, f = c * s.column, p = l * s.row, m = ec.piece.width * this.ratio, h = ec.piece.height * this.ratio, g = Math.max(c - m * o, 0) / (o * 2), _ = (c - m - g * 2) / Math.max(o - 1, 1);
			for (let e = o - 1; e >= 0; --e) {
				let t = a + e, n = this.config.pieceImages[i][a], o = f + g + _ * e, s = p;
				u.push({
					id: t,
					imagePath: n,
					style: {
						left: o + "px",
						top: s + "px",
						width: m + "px",
						height: h + "px",
						opacity: e === 0 && a === r ? "0.3" : "1"
					}
				});
			}
			let v = a, y = {
				left: f + "px",
				top: p + "px",
				width: c + "px",
				height: l + "px"
			}, b = y;
			n && n instanceof H && n.color === t && n.type === a && (b = {
				...b,
				...tc.highlight.selected
			}), d.push({
				id: v,
				type: a,
				style: y,
				backgroundStyle: b
			});
		}), {
			textureImagePath: this.config.pieceStandImage,
			touchAreaStyle: c,
			backgroundStyle: l,
			pieces: u,
			pointers: d
		};
	}
}, dc = class {
	config;
	ratio;
	constructor(e, t) {
		this.config = e, this.ratio = t;
	}
	centerOfPieceType(e, t, n) {
		let r = this.config.flip ? B(t) : t, i = 0;
		for (let t = Go.length - 1; t >= 0; --t) {
			if (Go[t] !== n) {
				e.count(Go[t]) > 0 && i++;
				continue;
			}
			let a = r === z.BLACK ? i : Go.length - i - 1;
			return new Ws(nc.squareWidth * .5, nc.squareHeight * (a + .5)).multiply(this.ratio);
		}
		return new Ws(0, 0);
	}
	build(e, t, n, r) {
		let i = this.config.flip ? B(t) : t, a = lc[this.config.pieceStandImageType], o = nc.width * this.ratio, s = nc.height * this.ratio, c = {
			left: "0px",
			top: "0px",
			width: o + "px",
			height: s + "px"
		}, l = {
			left: "0px",
			top: "0px",
			width: o + "px",
			height: s + "px",
			"background-color": a,
			opacity: this.config.pieceStandImageOpacity.toString()
		}, u = [], d = [], f = [];
		for (let a = Go.length - 1; a >= 0; --a) {
			let o = Go[a];
			if (!e.count(o)) continue;
			let s = i === z.BLACK ? u.length : Go.length - u.length - 1, c = o, l = this.config.pieceImages[i][o], p = nc.squareHeight * s * this.ratio;
			if (u.push({
				id: c,
				imagePath: l,
				style: {
					left: nc.leftPiecePadding * this.ratio + "px",
					top: p + nc.topPiecePadding * this.ratio + "px",
					width: ec.piece.width * this.ratio + "px",
					height: ec.piece.height * this.ratio + "px",
					opacity: o === r ? "0.3" : "1"
				}
			}), e.count(o) > 1) {
				let t = 2 * this.ratio, n = 2 * this.ratio, r = e.count(o) < 10 ? .6 : .3;
				d.push({
					id: o,
					character: e.count(o).toString(),
					style: {
						left: nc.squareWidth * r * this.ratio + "px",
						top: p + nc.squareHeight * .5 * this.ratio + "px",
						"font-size": 40 * this.ratio + "px",
						"font-weight": "900",
						color: "#fff",
						"text-shadow": `${t}px ${t}px ${n}px #000, ${-t}px ${t}px ${n}px #000, ${t}px ${-t}px ${n}px #000, ${-t}px ${-t}px ${n}px #000`
					}
				});
			}
			let m = {
				left: "0px",
				top: p + "px",
				width: nc.squareWidth * this.ratio + "px",
				height: nc.squareHeight * this.ratio + "px"
			}, h = m;
			n && n instanceof H && n.color === t && n.type === o && (h = {
				...h,
				...rc.highlight.selected
			}), f.push({
				id: c,
				type: o,
				style: m,
				backgroundStyle: h
			});
		}
		return {
			textureImagePath: this.config.pieceStandImage,
			touchAreaStyle: c,
			backgroundStyle: l,
			pieces: u,
			numbers: d,
			pointers: f
		};
	}
}, fc = class {
	config;
	ratio;
	constructor(e, t) {
		this.config = e, this.ratio = t;
	}
	centerOfPieceType(e, t, n) {
		let r = this.config.flip ? B(t) : t, i = 0;
		for (let t = 0; t < Go.length; t++) {
			if (Go[t] !== n) {
				e.count(Go[t]) > 0 && i++;
				continue;
			}
			let a = r === z.BLACK ? i : Go.length - i - 1;
			return new Ws(rc.squareWidth * (a + .5), rc.squareHeight * .5).multiply(this.ratio);
		}
		return new Ws(0, 0);
	}
	build(e, t, n, r) {
		let i = this.config.flip ? B(t) : t, a = lc[this.config.pieceStandImageType], o = rc.width * this.ratio, s = rc.height * this.ratio, c = {
			left: "0px",
			top: "0px",
			width: o + "px",
			height: s + "px"
		}, l = {
			left: "0px",
			top: "0px",
			width: o + "px",
			height: s + "px",
			"background-color": a,
			opacity: this.config.pieceStandImageOpacity.toString()
		}, u = [], d = [], f = [];
		return Go.forEach((a) => {
			if (!e.count(a)) return;
			let o = i === z.BLACK ? u.length : Go.length - u.length - 1, s = a, c = this.config.pieceImages[i][a], l = rc.squareWidth * o * this.ratio;
			if (u.push({
				id: s,
				imagePath: c,
				style: {
					left: l + rc.leftPiecePadding * this.ratio + "px",
					top: rc.topPiecePadding * this.ratio + "px",
					width: ec.piece.width * this.ratio + "px",
					height: ec.piece.height * this.ratio + "px",
					opacity: a === r ? "0.3" : "1"
				}
			}), e.count(a) > 1) {
				let t = 2 * this.ratio, n = 2 * this.ratio, r = e.count(a) < 10 ? .6 : .3;
				d.push({
					id: a,
					character: e.count(a).toString(),
					style: {
						left: l + rc.squareWidth * r * this.ratio + "px",
						top: rc.squareHeight * .5 * this.ratio + "px",
						"font-size": 40 * this.ratio + "px",
						"font-weight": "900",
						color: "#fff",
						"text-shadow": `${t}px ${t}px ${n}px #000, ${-t}px ${t}px ${n}px #000, ${t}px ${-t}px ${n}px #000, ${-t}px ${-t}px ${n}px #000`
					}
				});
			}
			let p = {
				left: l + "px",
				top: "0px",
				width: rc.squareWidth * this.ratio + "px",
				height: rc.squareHeight * this.ratio + "px"
			}, m = p;
			n && n instanceof H && n.color === t && n.type === a && (m = {
				...m,
				...rc.highlight.selected
			}), f.push({
				id: s,
				type: a,
				style: p,
				backgroundStyle: m
			});
		}), {
			textureImagePath: this.config.pieceStandImage,
			touchAreaStyle: c,
			backgroundStyle: l,
			pieces: u,
			numbers: d,
			pointers: f
		};
	}
}, pc = /* @__PURE__ */ function(e) {
	return e.STANDARD = "standard", e.COMPACT = "compact", e.PORTRAIT = "portrait", e;
}({}), mc = class {
	config;
	constructor(e) {
		this.config = e;
	}
	get ratio() {
		let e = this.config.upperSizeLimit.width / Q.frame.width;
		return Q.frame.height * e > this.config.upperSizeLimit.height && (e = this.config.upperSizeLimit.height / Q.frame.height), e;
	}
	get boardBasePoint() {
		return new Ws(Q.board.x, Q.board.y).multiply(this.ratio);
	}
	get blackHandBasePoint() {
		let e = this.config.flip ? Q.hand.white : Q.hand.black;
		return new Ws(e.x, e.y).multiply(this.ratio);
	}
	get whiteHandBasePoint() {
		let e = this.config.flip ? Q.hand.black : Q.hand.white;
		return new Ws(e.x, e.y).multiply(this.ratio);
	}
	build(e) {
		let t = this.ratio, n = () => {
			let e = Q.frame.height * t, n = Q.frame.width * t;
			return {
				style: {
					height: e + "px",
					width: n + "px"
				},
				size: new Us(n, e)
			};
		}, r = () => {
			let n = e.color, r = this.config.flip ? B(n) : n, i = Q.turn[r];
			return { style: {
				left: i.x * t - 2 + "px",
				top: i.y * t - 2 + "px",
				width: Q.turn.width * t - 2 + "px",
				height: Q.turn.height * t - 2 + "px",
				"font-size": Q.turn.fontSize * t + "px",
				"border-radius": Q.turn.height * t * .4 + "px",
				"border-width": "2px",
				"border-style": "solid"
			} };
		}, i = (e) => {
			let n = this.config.flip ? B(e) : e, r = Q.playerName[n];
			return { style: {
				left: r.x * t + "px",
				top: r.y * t + "px",
				width: Q.playerName.width * t + "px",
				height: Q.playerName.height * t + "px",
				"font-size": Q.playerName.fontSize * t + "px"
			} };
		}, a = (e) => {
			let n = this.config.flip ? B(e) : e, r = Q.clock[n];
			return { style: {
				left: r.x * t + "px",
				top: r.y * t + "px",
				width: Q.clock.width * t + "px",
				height: Q.clock.height * t + "px",
				"font-size": Q.clock.fontSize * t + "px"
			} };
		}, o = this.boardBasePoint, s = this.blackHandBasePoint, c = this.whiteHandBasePoint;
		return {
			ratio: t,
			frame: n(),
			boardStyle: {
				left: o.x + "px",
				top: o.y + "px"
			},
			blackHandStyle: {
				left: s.x + "px",
				top: s.y + "px"
			},
			whiteHandStyle: {
				left: c.x + "px",
				top: c.y + "px"
			},
			turn: this.config.hideClock ? r() : void 0,
			blackPlayerName: i(z.BLACK),
			whitePlayerName: i(z.WHITE),
			blackClock: this.config.hideClock ? void 0 : a(z.BLACK),
			whiteClock: this.config.hideClock ? void 0 : a(z.WHITE)
		};
	}
}, hc = {
	width: "439.21539mm",
	height: "479.79199mm",
	viewBox: "0 0 439.21539 479.79199"
}, gc = { transform: "translate(-225.09593,-247.17041)" }, _c = { transform: "matrix(0.49900175,0,0,0.49800041,222.93016,244.53834)" }, vc = /* @__PURE__ */ rr({
	__name: "BoardGrid",
	props: { color: {
		type: String,
		default: "black"
	} },
	setup(e) {
		return (t, n) => (F(), I("svg", hc, [L("g", gc, [L("g", _c, [L("g", { style: k(`stroke: ${e.color}; stroke-width: 2`) }, [...n[0] ||= [la("<rect x=\"17.170895\" y=\"17.594574\" width=\"855.602118\" height=\"939.067966\" fill=\"none\"></rect><line x1=\"112.23779\" y1=\"17.594574\" x2=\"112.23779\" y2=\"956.66254\"></line><line x1=\"207.30469\" y1=\"17.594574\" x2=\"207.30469\" y2=\"956.66254\"></line><line x1=\"302.37158\" y1=\"17.594574\" x2=\"302.37158\" y2=\"956.66254\"></line><line x1=\"397.43848\" y1=\"17.594574\" x2=\"397.43848\" y2=\"956.66254\"></line><line x1=\"492.50537\" y1=\"17.594574\" x2=\"492.50537\" y2=\"956.66254\"></line><line x1=\"587.57227\" y1=\"17.594574\" x2=\"587.57227\" y2=\"956.66254\"></line><line x1=\"682.63916\" y1=\"17.594574\" x2=\"682.63916\" y2=\"956.66254\"></line><line x1=\"777.70605\" y1=\"17.594574\" x2=\"777.70605\" y2=\"956.66254\"></line><line x1=\"17.170895\" y1=\"121.93546\" x2=\"872.773013\" y2=\"121.93546\"></line><line x1=\"17.170895\" y1=\"226.27634\" x2=\"872.773013\" y2=\"226.27634\"></line><line x1=\"17.170895\" y1=\"330.61722\" x2=\"872.773013\" y2=\"330.61722\"></line><line x1=\"17.170895\" y1=\"434.9581\" x2=\"872.773013\" y2=\"434.9581\"></line><line x1=\"17.170895\" y1=\"539.29901\" x2=\"872.773013\" y2=\"539.29901\"></line><line x1=\"17.170895\" y1=\"643.63989\" x2=\"872.773013\" y2=\"643.63989\"></line><line x1=\"17.170895\" y1=\"747.98077\" x2=\"872.773013\" y2=\"747.98077\"></line><line x1=\"17.170895\" y1=\"852.32166\" x2=\"872.773013\" y2=\"852.32166\"></line>", 17)]], 4), L("g", { style: k(`fill: ${e.color}; stroke: none`) }, [...n[1] ||= [
			L("circle", {
				cx: "587.60284",
				cy: "330.60928",
				r: "6.1868367"
			}, null, -1),
			L("circle", {
				cx: "302.2171",
				cy: "330.72778",
				r: "6.1868367"
			}, null, -1),
			L("circle", {
				cx: "587.80469",
				cy: "643.56665",
				r: "6.1868367"
			}, null, -1),
			L("circle", {
				cx: "302.41901",
				cy: "643.68518",
				r: "6.1868367"
			}, null, -1)
		]], 4)])])]));
	}
}), yc = { nextTurn: "次の手番" }, bc = ["src"], xc = ["src"], Sc = ["src"], Cc = ["src"], wc = ["src"], Tc = ["src"], Ec = ["src"], Dc = [
	"onClick",
	"onDblclick",
	"onContextmenu",
	"onPointerdown"
], Oc = ["src"], kc = ["src"], Ac = ["onClick", "onPointerdown"], jc = ["onClick", "onPointerdown"], Mc = { class: "player-name-text" }, Nc = { class: "clock-text" }, Pc = { class: "player-name-text" }, Fc = { class: "clock-text" }, Ic = ["src"], Lc = 25, Rc = /*#__PURE__*/ ((e, t) => {
	let n = e.__vccOpts || e;
	for (let [e, r] of t) n[e] = r;
	return n;
})(/* @__PURE__ */ rr({
	__name: "BoardView",
	props: {
		layoutType: {
			type: String,
			required: !1,
			default: pc.STANDARD
		},
		boardImageType: {
			type: String,
			required: !0
		},
		customBoardImageUrl: {
			type: String,
			required: !1,
			default: void 0
		},
		boardImageOpacity: {
			type: Number,
			required: !1,
			default: 1
		},
		boardGridColor: {
			type: String,
			required: !1,
			default: void 0
		},
		pieceImageUrlTemplate: {
			type: String,
			required: !0
		},
		kingPieceType: {
			type: String,
			required: !0
		},
		pieceStandImageType: {
			type: String,
			required: !0
		},
		customPieceStandImageUrl: {
			type: String,
			required: !1,
			default: void 0
		},
		pieceStandImageOpacity: {
			type: Number,
			required: !1,
			default: 1
		},
		handPieceOrder: {
			type: String,
			required: !1,
			default: Bs.STRONGER_TO_LEFT
		},
		promotionSelectorStyle: {
			type: String,
			required: !1,
			default: Vs.HORIZONTAL
		},
		boardLabelType: {
			type: String,
			required: !0
		},
		maxSize: {
			type: Us,
			required: !0
		},
		position: {
			type: Object,
			required: !0
		},
		lastMove: {
			type: Object,
			required: !1,
			default: null
		},
		candidates: {
			type: Array,
			required: !1,
			default: () => []
		},
		flip: {
			type: Boolean,
			required: !1
		},
		hideClock: {
			type: Boolean,
			required: !1,
			default: !1
		},
		mobile: {
			type: Boolean,
			required: !1,
			default: !1
		},
		allowEdit: {
			type: Boolean,
			required: !1
		},
		allowMove: {
			type: Boolean,
			required: !1
		},
		enableDragAndDrop: {
			type: Boolean,
			required: !1,
			default: !0
		},
		blackPlayerName: {
			type: String,
			required: !1,
			default: "先手"
		},
		whitePlayerName: {
			type: String,
			required: !1,
			default: "後手"
		},
		blackPlayerTime: {
			type: Number,
			required: !1,
			default: void 0
		},
		blackPlayerByoyomi: {
			type: Number,
			required: !1,
			default: void 0
		},
		whitePlayerTime: {
			type: Number,
			required: !1,
			default: void 0
		},
		whitePlayerByoyomi: {
			type: Number,
			required: !1,
			default: void 0
		},
		dropShadows: {
			type: Boolean,
			required: !1,
			default: !0
		},
		ghostTeleportTarget: {
			type: [String, Object],
			required: !1,
			default: "body"
		},
		arrowImageUrl: {
			type: String,
			required: !1,
			default: "/arrow/arrow.svg"
		}
	},
	emits: [
		"resize",
		"move",
		"edit"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ Pt({
			pointer: null,
			reservedMove: null
		}), a = () => {
			i.pointer = null, i.reservedMove = null;
		};
		Ln([
			() => n.position,
			() => n.position.sfen,
			() => n.allowEdit,
			() => n.allowMove
		], () => {
			a(), s();
		});
		let o = /* @__PURE__ */ Pt({
			pending: !1,
			active: !1,
			pointerId: null,
			source: null,
			pieceImagePath: null,
			ghostX: 0,
			ghostY: 0,
			startX: 0,
			startY: 0
		}), s = () => {
			o.pending = !1, o.active = !1, o.pointerId = null, o.source = null, o.pieceImagePath = null, document.body.style.cursor = "";
		}, c = !1, l = /* @__PURE__ */ Kt(null), u = /* @__PURE__ */ Kt(null), d = /* @__PURE__ */ Kt(null), f = R(() => ({
			width: ec.piece.width * D.value.ratio,
			height: ec.piece.height * D.value.ratio
		})), p = (e) => {
			let t = T.value.flip ? B(e.color) : e.color, n = e.type === V.KING && e.color === z.BLACK ? "king2" : e.type;
			return T.value.pieceImages[t][n];
		}, m = (e, t, r, a, s) => {
			if (!n.enableDragAndDrop || !n.allowMove && !n.allowEdit || i.reservedMove) return;
			let c = new G(r, a), l = n.position.board.at(c);
			l && (!n.allowEdit && l.color !== n.position.color || (o.pending = !0, o.pointerId = s, o.source = c, o.pieceImagePath = p(l), o.startX = e, o.startY = t, o.ghostX = e, o.ghostY = t));
		}, h = (e, t, r, a, s) => {
			n.enableDragAndDrop && (!n.allowMove && !n.allowEdit || i.reservedMove || n.position.hand(r).count(a) !== 0 && (!n.allowEdit && r !== n.position.color || (o.pending = !0, o.pointerId = s, o.source = new H(r, a), o.pieceImagePath = p(new H(r, a)), o.startX = e, o.startY = t, o.ghostX = e, o.ghostY = t)));
		}, g = () => {
			o.active = !0, document.body.style.cursor = "grabbing", o.source && (i.pointer = o.source);
		}, _ = (e, t) => {
			if (!l.value) return null;
			let n = l.value.getBoundingClientRect(), r = D.value.ratio, i = e - n.left, a = t - n.top;
			if (i < 0 || i > X.width * r || a < 0 || a > X.height * r) return null;
			let o = X.squareWidth * r, s = X.squareHeight * r, c = X.leftSquarePadding * r, u = X.topSquarePadding * r, d = Math.floor((i - c) / o), f = Math.floor((a - u) / s);
			return d < 0 || d > 8 || f < 0 || f > 8 ? null : new G(T.value.flip ? d + 1 : 9 - d, T.value.flip ? 9 - f : f + 1);
		}, v = (e, t) => {
			let r = D.value.ratio, i, a;
			switch (n.layoutType) {
				case pc.COMPACT:
					i = nc.width * r, a = nc.height * r;
					break;
				case pc.PORTRAIT:
					i = rc.width * r, a = rc.height * r;
					break;
				default: i = tc.width * r, a = tc.height * r;
			}
			let o = (n) => {
				if (!n) return !1;
				let r = n.getBoundingClientRect(), o = e - r.left, s = t - r.top;
				return o >= 0 && o <= i && s >= 0 && s <= a;
			};
			return o(u.value) ? z.BLACK : o(d.value) ? z.WHITE : null;
		}, y = (e, t) => {
			if (!o.active) return;
			let r = o.source, i = _(e, t);
			if (i && r) {
				let e = r instanceof G ? r : r.type, t = n.allowMove ? n.position.createMove(e, i) : null, o = t !== null && (n.position.isValidMove(t) || n.position.isValidMove(t.withPromote())), s = n.allowEdit && n.position.isValidEditing(r, i);
				o || s ? ie(i.file, i.rank) : a();
			} else {
				let n = v(e, t);
				n === null ? a() : C(n);
			}
			c = !0;
		}, b = (e) => {
			if (e.pointerId === o.pointerId && !(!o.pending && !o.active) && (o.ghostX = e.clientX, o.ghostY = e.clientY, !o.active)) {
				let t = e.clientX - o.startX, n = e.clientY - o.startY;
				t * t + n * n > Lc && g();
			}
		}, x = (e) => {
			e.pointerId === o.pointerId && (o.active && y(e.clientX, e.clientY), s());
		}, ee = (e) => {
			e.pointerId === o.pointerId && (o.active && a(), s());
		}, S = (e, t, n) => {
			e.button === 0 && (o.pending || o.active || (c = !1, m(e.clientX, e.clientY, t, n, e.pointerId)));
		}, te = (e, t, n) => {
			e.button === 0 && (o.pending || o.active || (c = !1, h(e.clientX, e.clientY, t, n, e.pointerId)));
		};
		vr(() => {
			document.addEventListener("pointermove", b), document.addEventListener("pointerup", x), document.addEventListener("pointercancel", ee);
		}), Sr(() => {
			document.removeEventListener("pointermove", b), document.removeEventListener("pointerup", x), document.removeEventListener("pointercancel", ee), document.body.style.cursor = "";
		});
		let ne = () => {
			if (c) {
				c = !1;
				return;
			}
			a();
		}, re = (e, t, o) => {
			let s = i.pointer;
			if (a(), !(e instanceof G && s instanceof G && e.equals(s)) && !(e instanceof H && s instanceof H && e.equals(s))) {
				if (s) {
					let t = s, a = e instanceof G ? e : e.color;
					if (n.allowEdit && n.position.isValidEditing(t, a)) {
						r("edit", { move: {
							from: s,
							to: a
						} });
						return;
					}
					if (n.allowMove && e instanceof G) {
						let t = s instanceof G ? s : s.type, a = e, o = n.position.createMove(t, a);
						if (!o) return;
						let c = n.position.isValidMove(o), l = n.position.isValidMove(o.withPromote());
						if (c && l) {
							i.reservedMove = o;
							return;
						}
						if (c) {
							r("move", o);
							return;
						}
						if (l) {
							r("move", o.withPromote());
							return;
						}
					}
				}
				!n.allowMove && !n.allowEdit || t || !n.allowEdit && o !== n.position.color || (i.pointer = e);
			}
		}, ie = (e, t) => {
			if (c) {
				c = !1;
				return;
			}
			let r = new G(e, t), i = n.position.board.at(r);
			re(r, !i, i?.color);
		}, C = (e) => {
			if (c) {
				c = !1;
				return;
			}
			re(new H(e, V.PAWN), !0, e);
		}, ae = (e, t) => {
			if (c) {
				c = !1;
				return;
			}
			let r = n.position.hand(e).count(t) === 0;
			re(new H(e, t), r, e);
		}, w = (e, t) => {
			if (n.mobile && !n.allowEdit) return;
			a();
			let i = new G(e, t);
			n.allowEdit && n.position.board.at(i) && r("edit", { rotate: i });
		}, oe = () => {
			let e = i.reservedMove;
			a(), e && n.position.isValidMove(e.withPromote()) && r("move", e.withPromote());
		}, se = () => {
			let e = i.reservedMove;
			a(), e && n.position.isValidMove(e) && r("move", e);
		}, T = R(() => Ys({
			boardImageType: n.boardImageType,
			customBoardImageURL: n.customBoardImageUrl,
			pieceStandImageType: n.pieceStandImageType,
			customPieceStandImageURL: n.customPieceStandImageUrl,
			pieceImageURLTemplate: n.pieceImageUrlTemplate,
			kingPieceType: n.kingPieceType,
			boardImageOpacity: n.boardImageOpacity,
			pieceStandImageOpacity: n.pieceStandImageOpacity,
			handPieceOrder: n.handPieceOrder,
			promotionSelectorStyle: n.promotionSelectorStyle,
			boardLabelType: n.boardLabelType,
			upperSizeLimit: n.maxSize,
			flip: n.flip,
			hideClock: n.hideClock
		})), ce = R(() => {
			switch (n.layoutType) {
				default: return new ic(T.value);
				case pc.COMPACT: return new mc(T.value);
				case pc.PORTRAIT: return new ac(T.value);
			}
		}), E = null, D = R(() => {
			let e = ce.value.build(n.position);
			return (!E || !E.equals(e.frame.size)) && (r("resize", e.frame.size), E = e.frame.size), e;
		}), le = R(() => new cc(T.value, D.value.ratio)), O = R(() => {
			let e = o.active && o.source instanceof G ? o.source : void 0;
			return le.value.build(n.position.board, n.lastMove, i.pointer, i.reservedMove, e);
		}), ue = R(() => {
			switch (n.layoutType) {
				default: return new uc(T.value, D.value.ratio);
				case pc.COMPACT: return new dc(T.value, D.value.ratio);
				case pc.PORTRAIT: return new fc(T.value, D.value.ratio);
			}
		}), de = R(() => {
			let e = o.active && o.source instanceof H && o.source.color === z.BLACK ? o.source.type : void 0;
			return ue.value.build(n.position.hand(z.BLACK), z.BLACK, i.pointer, e);
		}), fe = R(() => {
			let e = o.active && o.source instanceof H && o.source.color === z.WHITE ? o.source.type : void 0;
			return ue.value.build(n.position.hand(z.WHITE), z.WHITE, i.pointer, e);
		}), pe = R(() => {
			let e = 30 * D.value.ratio, t = n.candidates.length, r = n.candidates.reduce((e, t) => t.score !== void 0 && (e === void 0 || t.score > e) ? t.score : e, void 0);
			return n.candidates.map((i, a) => {
				let o = i.move, s = ce.value.boardBasePoint, c = ce.value.blackHandBasePoint, l = ce.value.whiteHandBasePoint, u = o.from instanceof G ? s.add(le.value.centerOfSquare(o.from)) : o.color === z.BLACK ? c.add(ue.value.centerOfPieceType(n.position.hand(z.BLACK), z.BLACK, o.from)) : l.add(ue.value.centerOfPieceType(n.position.hand(z.WHITE), z.WHITE, o.from)), d = s.add(le.value.centerOfSquare(o.to)), f = u.add(d).multiply(.5), p = u.distanceTo(d), m = u.angleTo(d) - Math.PI, h, g;
				if (i.score !== void 0 && r !== void 0) {
					let e = i.score - r;
					g = 1 + n.candidates.filter((e) => e.score !== void 0 && e.score > i.score).length, h = e === 0 ? "Best" : `${e}`;
				} else g = a + 1, h = "";
				let _ = f.x - p / 2, v = f.y - e / 2, y = d.x - u.x, b = d.y - u.y, x = p > 0 ? Math.abs(y) / p : 0, ee = b > 0 ? -x * 12 : x * 12;
				return {
					id: o.usi,
					labelText: h,
					style: {
						left: _ + "px",
						top: v + "px",
						width: p + "px",
						height: e + "px",
						transform: `rotate(${m}rad)`,
						zIndex: 100 + t - g
					},
					labelStyle: {
						left: f.x + "px",
						top: f.y + ee + "px",
						zIndex: 100 + 2 * t - g
					}
				};
			});
		}), me = (e, t) => e ? Bo(e) : t === void 0 ? "0:00:00" : "" + t, ge = (e, t) => {
			if (!e && !t) return "normal";
			let n = (e || 0) + (t || 0);
			return n <= 5 ? "danger" : n <= 10 ? "warning" : "normal";
		}, _e = R(() => me(n.blackPlayerTime, n.blackPlayerByoyomi)), ve = R(() => ge(n.blackPlayerTime, n.blackPlayerByoyomi)), ye = R(() => me(n.whitePlayerTime, n.whitePlayerByoyomi)), be = R(() => ge(n.whitePlayerTime, n.whitePlayerByoyomi));
		return (t, n) => (F(), I(P, null, [L("div", null, [L("div", {
			class: "frame",
			style: k(D.value.frame.style),
			onClick: n[4] ||= (e) => ne()
		}, [
			L("div", {
				class: he(["hand", e.flip ? "front" : "back"]),
				style: k(D.value.whiteHandStyle)
			}, [
				L("div", {
					class: he(["hand-background", { "drop-shadows": e.dropShadows }]),
					style: k(fe.value.backgroundStyle)
				}, [fe.value.textureImagePath ? (F(), I("img", {
					key: 0,
					class: "full",
					src: fe.value.textureImagePath
				}, null, 8, bc)) : ua("", !0)], 6),
				(F(!0), I(P, null, Or(fe.value.pointers, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.backgroundStyle)
				}, null, 4))), 128)),
				(F(!0), I(P, null, Or(fe.value.pieces, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.style)
				}, [L("img", {
					class: "piece-image",
					src: e.imagePath
				}, null, 8, xc)], 4))), 128)),
				(F(!0), I(P, null, Or(fe.value.numbers, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.style)
				}, Se(e.character), 5))), 128))
			], 6),
			L("div", {
				class: "board",
				style: k(D.value.boardStyle)
			}, [
				O.value.background.textureImagePath ? (F(), I("div", {
					key: 0,
					style: k(O.value.background.style)
				}, [L("img", {
					class: "full",
					src: O.value.background.textureImagePath
				}, null, 8, Sc)], 4)) : ua("", !0),
				L("div", {
					class: he(["board-background", { "drop-shadows": e.dropShadows }]),
					style: k(O.value.background.style)
				}, [ia(vc, {
					class: "full",
					color: e.boardGridColor || O.value.background.gridColor
				}, null, 8, ["color"])], 6),
				(F(!0), I(P, null, Or(O.value.squares, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.backgroundStyle)
				}, null, 4))), 128)),
				(F(!0), I(P, null, Or(O.value.pieces, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.style)
				}, [L("img", {
					class: "piece-image",
					src: e.imagePath
				}, null, 8, Cc)], 4))), 128)),
				(F(!0), I(P, null, Or(O.value.labels, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.style)
				}, Se(e.character), 5))), 128))
			], 4),
			L("div", {
				class: he(["hand", e.flip ? "back" : "front"]),
				style: k(D.value.blackHandStyle)
			}, [
				L("div", {
					class: he(["hand-background", { "drop-shadows": e.dropShadows }]),
					style: k(de.value.backgroundStyle)
				}, [de.value.textureImagePath ? (F(), I("img", {
					key: 0,
					class: "full",
					src: de.value.textureImagePath
				}, null, 8, wc)) : ua("", !0)], 6),
				(F(!0), I(P, null, Or(de.value.pointers, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.backgroundStyle)
				}, null, 4))), 128)),
				(F(!0), I(P, null, Or(de.value.pieces, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.style)
				}, [L("img", {
					class: "piece-image",
					src: e.imagePath
				}, null, 8, Tc)], 4))), 128)),
				(F(!0), I(P, null, Or(de.value.numbers, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.style)
				}, Se(e.character), 5))), 128))
			], 6),
			(F(!0), I(P, null, Or(pe.value, (t) => (F(), I("img", {
				key: t.id,
				class: "arrows",
				src: e.arrowImageUrl,
				style: k([t.style, {
					"object-fit": "cover",
					"object-position": "left top"
				}])
			}, null, 12, Ec))), 128)),
			(F(!0), I(P, null, Or(pe.value, (e) => jn((F(), I("div", {
				key: "label-" + e.id,
				class: "arrow-label",
				style: k(e.labelStyle)
			}, Se(e.labelText), 5)), [[Xa, e.labelText]])), 128)),
			L("div", {
				ref_key: "boardOpEl",
				ref: l,
				class: "board operation",
				style: k(D.value.boardStyle)
			}, [
				(F(!0), I(P, null, Or(O.value.squares, (e) => (F(), I("div", {
					key: e.id,
					style: k(e.style),
					onClick: Mo((t) => ie(e.file, e.rank), ["stop", "prevent"]),
					onDblclick: Mo((t) => w(e.file, e.rank), ["stop", "prevent"]),
					onContextmenu: Mo((t) => w(e.file, e.rank), ["stop", "prevent"]),
					onPointerdown: (t) => S(t, e.file, e.rank)
				}, null, 44, Dc))), 128)),
				O.value.promote ? (F(), I("div", {
					key: 0,
					class: "promote",
					style: k(O.value.promote.style),
					onClick: n[0] ||= Mo((e) => oe(), ["stop", "prevent"])
				}, [L("img", {
					class: "piece-image",
					src: O.value.promote.imagePath,
					draggable: "false"
				}, null, 8, Oc)], 4)) : ua("", !0),
				O.value.doNotPromote ? (F(), I("div", {
					key: 1,
					class: "not-promote",
					style: k(O.value.doNotPromote.style),
					onClick: n[1] ||= Mo((e) => se(), ["stop", "prevent"])
				}, [L("img", {
					class: "piece-image",
					src: O.value.doNotPromote.imagePath,
					draggable: "false"
				}, null, 8, kc)], 4)) : ua("", !0)
			], 4),
			L("div", {
				ref_key: "blackHandOpEl",
				ref: u,
				class: "hand operation",
				style: k(D.value.blackHandStyle)
			}, [L("div", {
				style: k(de.value.touchAreaStyle),
				onClick: n[2] ||= Mo((e) => C(Yt(z).BLACK), ["stop", "prevent"])
			}, null, 4), (F(!0), I(P, null, Or(de.value.pointers, (e) => (F(), I("div", {
				key: e.id,
				style: k(e.style),
				onClick: Mo((t) => ae(Yt(z).BLACK, e.type), ["stop", "prevent"]),
				onPointerdown: Mo((t) => te(t, Yt(z).BLACK, e.type), ["stop"])
			}, null, 44, Ac))), 128))], 4),
			L("div", {
				ref_key: "whiteHandOpEl",
				ref: d,
				class: "hand operation",
				style: k(D.value.whiteHandStyle)
			}, [L("div", {
				style: k(fe.value.touchAreaStyle),
				onClick: n[3] ||= Mo((e) => C(Yt(z).WHITE), ["stop", "prevent"])
			}, null, 4), (F(!0), I(P, null, Or(fe.value.pointers, (e) => (F(), I("div", {
				key: e.id,
				style: k(e.style),
				onClick: Mo((t) => ae(Yt(z).WHITE, e.type), ["stop", "prevent"]),
				onPointerdown: Mo((t) => te(t, Yt(z).WHITE, e.type), ["stop"])
			}, null, 44, jc))), 128))], 4),
			L("div", {
				class: he(["player-name", { active: e.position.color == "black" }]),
				style: k(D.value.blackPlayerName.style)
			}, [L("span", Mc, "☗" + Se(e.blackPlayerName), 1)], 6),
			D.value.blackClock ? (F(), I("div", {
				key: 0,
				class: he(["clock", ve.value]),
				style: k(D.value.blackClock.style)
			}, [L("span", Nc, Se(_e.value), 1)], 6)) : ua("", !0),
			L("div", {
				class: he(["player-name", { active: e.position.color == "white" }]),
				style: k(D.value.whitePlayerName.style)
			}, [L("span", Pc, "☖" + Se(e.whitePlayerName), 1)], 6),
			D.value.whiteClock ? (F(), I("div", {
				key: 1,
				class: he(["clock", be.value]),
				style: k(D.value.whiteClock.style)
			}, [L("span", Fc, Se(ye.value), 1)], 6)) : ua("", !0),
			D.value.turn ? (F(), I("div", {
				key: 2,
				class: "turn",
				style: k(D.value.turn.style)
			}, Se(Yt(yc).nextTurn), 5)) : ua("", !0),
			D.value.control ? (F(), I("div", {
				key: 3,
				class: "control",
				style: k(D.value.control.left.style)
			}, [kr(t.$slots, "left-control", {}, void 0, !0)], 4)) : ua("", !0),
			D.value.control ? (F(), I("div", {
				key: 4,
				class: "control",
				style: k(D.value.control.right.style)
			}, [kr(t.$slots, "right-control", {}, void 0, !0)], 4)) : ua("", !0)
		], 4)]), (F(), $i(Qn, { to: e.ghostTeleportTarget }, [o.active && o.pieceImagePath ? (F(), I("div", {
			key: 0,
			style: k({
				position: "fixed",
				left: o.ghostX + "px",
				top: o.ghostY + "px",
				width: f.value.width + "px",
				height: f.value.height + "px",
				transform: "translate(-50%, -50%)",
				"pointer-events": "none",
				"z-index": "1000000"
			})
		}, [L("img", {
			src: o.pieceImagePath,
			style: {
				width: "100%",
				height: "100%"
			},
			draggable: "false"
		}, null, 8, Ic)], 4)) : ua("", !0)], 8, ["to"]))], 64));
	}
}), [["__scopeId", "data-v-e6496cb5"]]);
//#endregion
//#region src/position.ts
function zc(e) {
	return Ds.newBySFEN(e);
}
function Bc(e, t) {
	return t.flatMap((t) => {
		let n = e.createMoveByUSI(t.usi);
		return n ? [{
			move: n,
			score: t.score
		}] : [];
	});
}
//#endregion
//#region src/ShogiMatchBoard.vue?vue&type=script&setup=true&lang.ts
var Vc = {
	key: 1,
	class: "error",
	role: "alert"
}, Hc = /* @__PURE__ */ rr({
	__name: "ShogiMatchBoard",
	props: {
		sfen: {
			type: String,
			required: !0
		},
		candidates: {
			type: Array,
			default: () => []
		},
		lastMove: {
			type: String,
			default: ""
		},
		allowMove: {
			type: Boolean,
			default: !0
		},
		enableDragAndDrop: {
			type: Boolean,
			default: !0
		},
		flip: {
			type: Boolean,
			default: !1
		},
		mobile: {
			type: Boolean,
			default: !1
		},
		layout: {
			type: String,
			default: pc.STANDARD
		},
		assetBaseUrl: {
			type: String,
			default: "."
		},
		blackPlayerName: {
			type: String,
			default: "先手"
		},
		whitePlayerName: {
			type: String,
			default: "後手"
		}
	},
	emits: [
		"usi-move",
		"invalid-sfen",
		"resize"
	],
	setup(e, { emit: t }) {
		let n = e, r = t, i = /* @__PURE__ */ Kt(null), a = /* @__PURE__ */ Kt(new Us(720, 520)), o, s = R(() => n.assetBaseUrl.replace(/\/$/, "")), c = R(() => `${s.value}/piece/hitomoji_wood/\${piece}.png`), l = R(() => Object.values(pc).includes(n.layout) ? n.layout : pc.STANDARD), u = R(() => {
			try {
				return zc(n.sfen);
			} catch (e) {
				return r("invalid-sfen", e), null;
			}
		}), d = (e) => u.value?.createMoveByUSI(e) || null, f = R(() => n.lastMove ? d(n.lastMove) : null), p = R(() => u.value ? Bc(u.value, n.candidates) : []);
		function m(e) {
			r("usi-move", e.usi);
		}
		function h(e) {
			r("resize", {
				width: e.width,
				height: e.height
			});
		}
		function g() {
			if (!i.value) return;
			let e = Math.max(280, i.value.clientWidth || 720);
			a.value = new Us(e, Math.min(620, Math.max(360, e * .72)));
		}
		return vr(() => {
			g(), o = new ResizeObserver(g), i.value && o.observe(i.value);
		}), xr(() => o?.disconnect()), Ln(() => n.sfen, () => g()), (t, n) => (F(), I("div", {
			ref_key: "root",
			ref: i,
			class: "shogi-match-root"
		}, [u.value ? (F(), $i(Rc, {
			key: 0,
			"layout-type": l.value,
			"board-image-type": Yt(Y).CUSTOM_IMAGE,
			"custom-board-image-url": `${s.value}/board/wood_light2.png`,
			"piece-image-url-template": c.value,
			"king-piece-type": Yt(Rs).GYOKU_AND_OSHO,
			"piece-stand-image-type": Yt(zs).CUSTOM_IMAGE,
			"custom-piece-stand-image-url": `${s.value}/stand/wood_dark.png`,
			"hand-piece-order": Yt(Bs).STRONGER_TO_LEFT,
			"promotion-selector-style": Yt(Vs).HORIZONTAL,
			"board-label-type": Yt(Hs).STANDARD,
			"max-size": a.value,
			position: u.value,
			"last-move": f.value,
			candidates: p.value,
			flip: e.flip,
			mobile: e.mobile,
			"allow-move": e.allowMove,
			"enable-drag-and-drop": e.enableDragAndDrop,
			"black-player-name": e.blackPlayerName,
			"white-player-name": e.whitePlayerName,
			"arrow-image-url": `${s.value}/arrow/arrow.svg`,
			onMove: m,
			onResize: h
		}, null, 8, [
			"layout-type",
			"board-image-type",
			"custom-board-image-url",
			"piece-image-url-template",
			"king-piece-type",
			"piece-stand-image-type",
			"custom-piece-stand-image-url",
			"hand-piece-order",
			"promotion-selector-style",
			"board-label-type",
			"max-size",
			"position",
			"last-move",
			"candidates",
			"flip",
			"mobile",
			"allow-move",
			"enable-drag-and-drop",
			"black-player-name",
			"white-player-name",
			"arrow-image-url"
		])) : (F(), I("p", Vc, "局面を表示できません。"))], 512));
	}
}), Uc = /* @__PURE__ */ Do(Hc, { shadowRoot: !1 });
customElements.get("shogi-match-board") || customElements.define("shogi-match-board", Uc);
//#endregion
export { Hc as ShogiMatchBoard, Uc as ShogiMatchBoardElement };
