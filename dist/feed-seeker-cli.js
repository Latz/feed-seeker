#!/usr/bin/env node
import ee from "node:events";
import te from "node:child_process";
import ie from "node:path";
import ne from "node:fs";
import se from "node:process";
import { parseHTML as re } from "linkedom";
import { E as oe, f as ae, m as le, c as ue, b as he, d as ce } from "./deepSearch-CRIKRlVD.js";
import { styleText as k } from "node:util";
function de(p) {
  return p && p.__esModule && Object.prototype.hasOwnProperty.call(p, "default") ? p.default : p;
}
var S = {}, F = {}, P = {}, R;
function I() {
  if (R) return P;
  R = 1;
  class p extends Error {
    /**
     * Constructs the CommanderError class
     * @param {number} exitCode suggested exit code which could be used with process.exit
     * @param {string} code an id string representing the error
     * @param {string} message human-readable description of the error
     */
    constructor(m, t, n) {
      super(n), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name, this.code = t, this.exitCode = m, this.nestedError = void 0;
    }
  }
  class u extends p {
    /**
     * Constructs the InvalidArgumentError class
     * @param {string} [message] explanation of why argument is invalid
     */
    constructor(m) {
      super(1, "commander.invalidArgument", m), Error.captureStackTrace(this, this.constructor), this.name = this.constructor.name;
    }
  }
  return P.CommanderError = p, P.InvalidArgumentError = u, P;
}
var U;
function M() {
  if (U) return F;
  U = 1;
  const { InvalidArgumentError: p } = I();
  class u {
    /**
     * Initialize a new command argument with the given name and description.
     * The default is that the argument is required, and you can explicitly
     * indicate this with <> around the name. Put [] around the name for an optional argument.
     *
     * @param {string} name
     * @param {string} [description]
     */
    constructor(t, n) {
      switch (this.description = n || "", this.variadic = !1, this.parseArg = void 0, this.defaultValue = void 0, this.defaultValueDescription = void 0, this.argChoices = void 0, t[0]) {
        case "<":
          this.required = !0, this._name = t.slice(1, -1);
          break;
        case "[":
          this.required = !1, this._name = t.slice(1, -1);
          break;
        default:
          this.required = !0, this._name = t;
          break;
      }
      this._name.endsWith("...") && (this.variadic = !0, this._name = this._name.slice(0, -3));
    }
    /**
     * Return argument name.
     *
     * @return {string}
     */
    name() {
      return this._name;
    }
    /**
     * @package
     */
    _collectValue(t, n) {
      return n === this.defaultValue || !Array.isArray(n) ? [t] : (n.push(t), n);
    }
    /**
     * Set the default value, and optionally supply the description to be displayed in the help.
     *
     * @param {*} value
     * @param {string} [description]
     * @return {Argument}
     */
    default(t, n) {
      return this.defaultValue = t, this.defaultValueDescription = n, this;
    }
    /**
     * Set the custom handler for processing CLI command arguments into argument values.
     *
     * @param {Function} [fn]
     * @return {Argument}
     */
    argParser(t) {
      return this.parseArg = t, this;
    }
    /**
     * Only allow argument value to be one of choices.
     *
     * @param {string[]} values
     * @return {Argument}
     */
    choices(t) {
      return this.argChoices = t.slice(), this.parseArg = (n, s) => {
        if (!this.argChoices.includes(n))
          throw new p(
            `Allowed choices are ${this.argChoices.join(", ")}.`
          );
        return this.variadic ? this._collectValue(n, s) : n;
      }, this;
    }
    /**
     * Make argument required.
     *
     * @returns {Argument}
     */
    argRequired() {
      return this.required = !0, this;
    }
    /**
     * Make argument optional.
     *
     * @returns {Argument}
     */
    argOptional() {
      return this.required = !1, this;
    }
  }
  function h(m) {
    const t = m.name() + (m.variadic === !0 ? "..." : "");
    return m.required ? "<" + t + ">" : "[" + t + "]";
  }
  return F.Argument = u, F.humanReadableArgName = h, F;
}
var N = {}, D = {}, B;
function Q() {
  if (B) return D;
  B = 1;
  const { humanReadableArgName: p } = M();
  class u {
    constructor() {
      this.helpWidth = void 0, this.minWidthToWrap = 40, this.sortSubcommands = !1, this.sortOptions = !1, this.showGlobalOptions = !1;
    }
    /**
     * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
     * and just before calling `formatHelp()`.
     *
     * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
     *
     * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
     */
    prepareContext(t) {
      this.helpWidth = this.helpWidth ?? t.helpWidth ?? 80;
    }
    /**
     * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
     *
     * @param {Command} cmd
     * @returns {Command[]}
     */
    visibleCommands(t) {
      const n = t.commands.filter((l) => !l._hidden), s = t._getHelpCommand();
      return s && !s._hidden && n.push(s), this.sortSubcommands && n.sort((l, d) => l.name().localeCompare(d.name())), n;
    }
    /**
     * Compare options for sort.
     *
     * @param {Option} a
     * @param {Option} b
     * @returns {number}
     */
    compareOptions(t, n) {
      const s = (l) => l.short ? l.short.replace(/^-/, "") : l.long.replace(/^--/, "");
      return s(t).localeCompare(s(n));
    }
    /**
     * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
     *
     * @param {Command} cmd
     * @returns {Option[]}
     */
    visibleOptions(t) {
      const n = t.options.filter((l) => !l.hidden), s = t._getHelpOption();
      if (s && !s.hidden) {
        const l = s.short && t._findOption(s.short), d = s.long && t._findOption(s.long);
        !l && !d ? n.push(s) : s.long && !d ? n.push(
          t.createOption(s.long, s.description)
        ) : s.short && !l && n.push(
          t.createOption(s.short, s.description)
        );
      }
      return this.sortOptions && n.sort(this.compareOptions), n;
    }
    /**
     * Get an array of the visible global options. (Not including help.)
     *
     * @param {Command} cmd
     * @returns {Option[]}
     */
    visibleGlobalOptions(t) {
      if (!this.showGlobalOptions) return [];
      const n = [];
      for (let s = t.parent; s; s = s.parent) {
        const l = s.options.filter(
          (d) => !d.hidden
        );
        n.push(...l);
      }
      return this.sortOptions && n.sort(this.compareOptions), n;
    }
    /**
     * Get an array of the arguments if any have a description.
     *
     * @param {Command} cmd
     * @returns {Argument[]}
     */
    visibleArguments(t) {
      return t._argsDescription && t.registeredArguments.forEach((n) => {
        n.description = n.description || t._argsDescription[n.name()] || "";
      }), t.registeredArguments.find((n) => n.description) ? t.registeredArguments : [];
    }
    /**
     * Get the command term to show in the list of subcommands.
     *
     * @param {Command} cmd
     * @returns {string}
     */
    subcommandTerm(t) {
      const n = t.registeredArguments.map((s) => p(s)).join(" ");
      return t._name + (t._aliases[0] ? "|" + t._aliases[0] : "") + (t.options.length ? " [options]" : "") + // simplistic check for non-help option
      (n ? " " + n : "");
    }
    /**
     * Get the option term to show in the list of options.
     *
     * @param {Option} option
     * @returns {string}
     */
    optionTerm(t) {
      return t.flags;
    }
    /**
     * Get the argument term to show in the list of arguments.
     *
     * @param {Argument} argument
     * @returns {string}
     */
    argumentTerm(t) {
      return t.name();
    }
    /**
     * Get the longest command term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestSubcommandTermLength(t, n) {
      return n.visibleCommands(t).reduce((s, l) => Math.max(
        s,
        this.displayWidth(
          n.styleSubcommandTerm(n.subcommandTerm(l))
        )
      ), 0);
    }
    /**
     * Get the longest option term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestOptionTermLength(t, n) {
      return n.visibleOptions(t).reduce((s, l) => Math.max(
        s,
        this.displayWidth(n.styleOptionTerm(n.optionTerm(l)))
      ), 0);
    }
    /**
     * Get the longest global option term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestGlobalOptionTermLength(t, n) {
      return n.visibleGlobalOptions(t).reduce((s, l) => Math.max(
        s,
        this.displayWidth(n.styleOptionTerm(n.optionTerm(l)))
      ), 0);
    }
    /**
     * Get the longest argument term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    longestArgumentTermLength(t, n) {
      return n.visibleArguments(t).reduce((s, l) => Math.max(
        s,
        this.displayWidth(
          n.styleArgumentTerm(n.argumentTerm(l))
        )
      ), 0);
    }
    /**
     * Get the command usage to be displayed at the top of the built-in help.
     *
     * @param {Command} cmd
     * @returns {string}
     */
    commandUsage(t) {
      let n = t._name;
      t._aliases[0] && (n = n + "|" + t._aliases[0]);
      let s = "";
      for (let l = t.parent; l; l = l.parent)
        s = l.name() + " " + s;
      return s + n + " " + t.usage();
    }
    /**
     * Get the description for the command.
     *
     * @param {Command} cmd
     * @returns {string}
     */
    commandDescription(t) {
      return t.description();
    }
    /**
     * Get the subcommand summary to show in the list of subcommands.
     * (Fallback to description for backwards compatibility.)
     *
     * @param {Command} cmd
     * @returns {string}
     */
    subcommandDescription(t) {
      return t.summary() || t.description();
    }
    /**
     * Get the option description to show in the list of options.
     *
     * @param {Option} option
     * @return {string}
     */
    optionDescription(t) {
      const n = [];
      if (t.argChoices && n.push(
        // use stringify to match the display of the default value
        `choices: ${t.argChoices.map((s) => JSON.stringify(s)).join(", ")}`
      ), t.defaultValue !== void 0 && (t.required || t.optional || t.isBoolean() && typeof t.defaultValue == "boolean") && n.push(
        `default: ${t.defaultValueDescription || JSON.stringify(t.defaultValue)}`
      ), t.presetArg !== void 0 && t.optional && n.push(`preset: ${JSON.stringify(t.presetArg)}`), t.envVar !== void 0 && n.push(`env: ${t.envVar}`), n.length > 0) {
        const s = `(${n.join(", ")})`;
        return t.description ? `${t.description} ${s}` : s;
      }
      return t.description;
    }
    /**
     * Get the argument description to show in the list of arguments.
     *
     * @param {Argument} argument
     * @return {string}
     */
    argumentDescription(t) {
      const n = [];
      if (t.argChoices && n.push(
        // use stringify to match the display of the default value
        `choices: ${t.argChoices.map((s) => JSON.stringify(s)).join(", ")}`
      ), t.defaultValue !== void 0 && n.push(
        `default: ${t.defaultValueDescription || JSON.stringify(t.defaultValue)}`
      ), n.length > 0) {
        const s = `(${n.join(", ")})`;
        return t.description ? `${t.description} ${s}` : s;
      }
      return t.description;
    }
    /**
     * Format a list of items, given a heading and an array of formatted items.
     *
     * @param {string} heading
     * @param {string[]} items
     * @param {Help} helper
     * @returns string[]
     */
    formatItemList(t, n, s) {
      return n.length === 0 ? [] : [s.styleTitle(t), ...n, ""];
    }
    /**
     * Group items by their help group heading.
     *
     * @param {Command[] | Option[]} unsortedItems
     * @param {Command[] | Option[]} visibleItems
     * @param {Function} getGroup
     * @returns {Map<string, Command[] | Option[]>}
     */
    groupItems(t, n, s) {
      const l = /* @__PURE__ */ new Map();
      return t.forEach((d) => {
        const g = s(d);
        l.has(g) || l.set(g, []);
      }), n.forEach((d) => {
        const g = s(d);
        l.has(g) || l.set(g, []), l.get(g).push(d);
      }), l;
    }
    /**
     * Generate the built-in help text.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {string}
     */
    formatHelp(t, n) {
      const s = n.padWidth(t, n), l = n.helpWidth ?? 80;
      function d(w, $) {
        return n.formatItem(w, s, $, n);
      }
      let g = [
        `${n.styleTitle("Usage:")} ${n.styleUsage(n.commandUsage(t))}`,
        ""
      ];
      const C = n.commandDescription(t);
      C.length > 0 && (g = g.concat([
        n.boxWrap(
          n.styleCommandDescription(C),
          l
        ),
        ""
      ]));
      const y = n.visibleArguments(t).map((w) => d(
        n.styleArgumentTerm(n.argumentTerm(w)),
        n.styleArgumentDescription(n.argumentDescription(w))
      ));
      if (g = g.concat(
        this.formatItemList("Arguments:", y, n)
      ), this.groupItems(
        t.options,
        n.visibleOptions(t),
        (w) => w.helpGroupHeading ?? "Options:"
      ).forEach((w, $) => {
        const T = w.map((e) => d(
          n.styleOptionTerm(n.optionTerm(e)),
          n.styleOptionDescription(n.optionDescription(e))
        ));
        g = g.concat(this.formatItemList($, T, n));
      }), n.showGlobalOptions) {
        const w = n.visibleGlobalOptions(t).map(($) => d(
          n.styleOptionTerm(n.optionTerm($)),
          n.styleOptionDescription(n.optionDescription($))
        ));
        g = g.concat(
          this.formatItemList("Global Options:", w, n)
        );
      }
      return this.groupItems(
        t.commands,
        n.visibleCommands(t),
        (w) => w.helpGroup() || "Commands:"
      ).forEach((w, $) => {
        const T = w.map((e) => d(
          n.styleSubcommandTerm(n.subcommandTerm(e)),
          n.styleSubcommandDescription(n.subcommandDescription(e))
        ));
        g = g.concat(this.formatItemList($, T, n));
      }), g.join(`
`);
    }
    /**
     * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
     *
     * @param {string} str
     * @returns {number}
     */
    displayWidth(t) {
      return h(t).length;
    }
    /**
     * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
     *
     * @param {string} str
     * @returns {string}
     */
    styleTitle(t) {
      return t;
    }
    styleUsage(t) {
      return t.split(" ").map((n) => n === "[options]" ? this.styleOptionText(n) : n === "[command]" ? this.styleSubcommandText(n) : n[0] === "[" || n[0] === "<" ? this.styleArgumentText(n) : this.styleCommandText(n)).join(" ");
    }
    styleCommandDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleOptionDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleSubcommandDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleArgumentDescription(t) {
      return this.styleDescriptionText(t);
    }
    styleDescriptionText(t) {
      return t;
    }
    styleOptionTerm(t) {
      return this.styleOptionText(t);
    }
    styleSubcommandTerm(t) {
      return t.split(" ").map((n) => n === "[options]" ? this.styleOptionText(n) : n[0] === "[" || n[0] === "<" ? this.styleArgumentText(n) : this.styleSubcommandText(n)).join(" ");
    }
    styleArgumentTerm(t) {
      return this.styleArgumentText(t);
    }
    styleOptionText(t) {
      return t;
    }
    styleArgumentText(t) {
      return t;
    }
    styleSubcommandText(t) {
      return t;
    }
    styleCommandText(t) {
      return t;
    }
    /**
     * Calculate the pad width from the maximum term length.
     *
     * @param {Command} cmd
     * @param {Help} helper
     * @returns {number}
     */
    padWidth(t, n) {
      return Math.max(
        n.longestOptionTermLength(t, n),
        n.longestGlobalOptionTermLength(t, n),
        n.longestSubcommandTermLength(t, n),
        n.longestArgumentTermLength(t, n)
      );
    }
    /**
     * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
     *
     * @param {string} str
     * @returns {boolean}
     */
    preformatted(t) {
      return /\n[^\S\r\n]/.test(t);
    }
    /**
     * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
     *
     * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
     *   TTT  DDD DDDD
     *        DD DDD
     *
     * @param {string} term
     * @param {number} termWidth
     * @param {string} description
     * @param {Help} helper
     * @returns {string}
     */
    formatItem(t, n, s, l) {
      const g = " ".repeat(2);
      if (!s) return g + t;
      const C = t.padEnd(
        n + t.length - l.displayWidth(t)
      ), y = 2, v = (this.helpWidth ?? 80) - n - y - 2;
      let w;
      return v < this.minWidthToWrap || l.preformatted(s) ? w = s : w = l.boxWrap(s, v).replace(
        /\n/g,
        `
` + " ".repeat(n + y)
      ), g + C + " ".repeat(y) + w.replace(/\n/g, `
${g}`);
    }
    /**
     * Wrap a string at whitespace, preserving existing line breaks.
     * Wrapping is skipped if the width is less than `minWidthToWrap`.
     *
     * @param {string} str
     * @param {number} width
     * @returns {string}
     */
    boxWrap(t, n) {
      if (n < this.minWidthToWrap) return t;
      const s = t.split(/\r\n|\n/), l = /[\s]*[^\s]+/g, d = [];
      return s.forEach((g) => {
        const C = g.match(l);
        if (C === null) {
          d.push("");
          return;
        }
        let y = [C.shift()], x = this.displayWidth(y[0]);
        C.forEach((v) => {
          const w = this.displayWidth(v);
          if (x + w <= n) {
            y.push(v), x += w;
            return;
          }
          d.push(y.join(""));
          const $ = v.trimStart();
          y = [$], x = this.displayWidth($);
        }), d.push(y.join(""));
      }), d.join(`
`);
    }
  }
  function h(m) {
    const t = /\x1b\[\d*(;\d*)*m/g;
    return m.replace(t, "");
  }
  return D.Help = u, D.stripColor = h, D;
}
var W = {}, z;
function X() {
  if (z) return W;
  z = 1;
  const { InvalidArgumentError: p } = I();
  class u {
    /**
     * Initialize a new `Option` with the given `flags` and `description`.
     *
     * @param {string} flags
     * @param {string} [description]
     */
    constructor(s, l) {
      this.flags = s, this.description = l || "", this.required = s.includes("<"), this.optional = s.includes("["), this.variadic = /\w\.\.\.[>\]]$/.test(s), this.mandatory = !1;
      const d = t(s);
      this.short = d.shortFlag, this.long = d.longFlag, this.negate = !1, this.long && (this.negate = this.long.startsWith("--no-")), this.defaultValue = void 0, this.defaultValueDescription = void 0, this.presetArg = void 0, this.envVar = void 0, this.parseArg = void 0, this.hidden = !1, this.argChoices = void 0, this.conflictsWith = [], this.implied = void 0, this.helpGroupHeading = void 0;
    }
    /**
     * Set the default value, and optionally supply the description to be displayed in the help.
     *
     * @param {*} value
     * @param {string} [description]
     * @return {Option}
     */
    default(s, l) {
      return this.defaultValue = s, this.defaultValueDescription = l, this;
    }
    /**
     * Preset to use when option used without option-argument, especially optional but also boolean and negated.
     * The custom processing (parseArg) is called.
     *
     * @example
     * new Option('--color').default('GREYSCALE').preset('RGB');
     * new Option('--donate [amount]').preset('20').argParser(parseFloat);
     *
     * @param {*} arg
     * @return {Option}
     */
    preset(s) {
      return this.presetArg = s, this;
    }
    /**
     * Add option name(s) that conflict with this option.
     * An error will be displayed if conflicting options are found during parsing.
     *
     * @example
     * new Option('--rgb').conflicts('cmyk');
     * new Option('--js').conflicts(['ts', 'jsx']);
     *
     * @param {(string | string[])} names
     * @return {Option}
     */
    conflicts(s) {
      return this.conflictsWith = this.conflictsWith.concat(s), this;
    }
    /**
     * Specify implied option values for when this option is set and the implied options are not.
     *
     * The custom processing (parseArg) is not called on the implied values.
     *
     * @example
     * program
     *   .addOption(new Option('--log', 'write logging information to file'))
     *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
     *
     * @param {object} impliedOptionValues
     * @return {Option}
     */
    implies(s) {
      let l = s;
      return typeof s == "string" && (l = { [s]: !0 }), this.implied = Object.assign(this.implied || {}, l), this;
    }
    /**
     * Set environment variable to check for option value.
     *
     * An environment variable is only used if when processed the current option value is
     * undefined, or the source of the current value is 'default' or 'config' or 'env'.
     *
     * @param {string} name
     * @return {Option}
     */
    env(s) {
      return this.envVar = s, this;
    }
    /**
     * Set the custom handler for processing CLI option arguments into option values.
     *
     * @param {Function} [fn]
     * @return {Option}
     */
    argParser(s) {
      return this.parseArg = s, this;
    }
    /**
     * Whether the option is mandatory and must have a value after parsing.
     *
     * @param {boolean} [mandatory=true]
     * @return {Option}
     */
    makeOptionMandatory(s = !0) {
      return this.mandatory = !!s, this;
    }
    /**
     * Hide option in help.
     *
     * @param {boolean} [hide=true]
     * @return {Option}
     */
    hideHelp(s = !0) {
      return this.hidden = !!s, this;
    }
    /**
     * @package
     */
    _collectValue(s, l) {
      return l === this.defaultValue || !Array.isArray(l) ? [s] : (l.push(s), l);
    }
    /**
     * Only allow option value to be one of choices.
     *
     * @param {string[]} values
     * @return {Option}
     */
    choices(s) {
      return this.argChoices = s.slice(), this.parseArg = (l, d) => {
        if (!this.argChoices.includes(l))
          throw new p(
            `Allowed choices are ${this.argChoices.join(", ")}.`
          );
        return this.variadic ? this._collectValue(l, d) : l;
      }, this;
    }
    /**
     * Return option name.
     *
     * @return {string}
     */
    name() {
      return this.long ? this.long.replace(/^--/, "") : this.short.replace(/^-/, "");
    }
    /**
     * Return option name, in a camelcase format that can be used
     * as an object attribute key.
     *
     * @return {string}
     */
    attributeName() {
      return this.negate ? m(this.name().replace(/^no-/, "")) : m(this.name());
    }
    /**
     * Set the help group heading.
     *
     * @param {string} heading
     * @return {Option}
     */
    helpGroup(s) {
      return this.helpGroupHeading = s, this;
    }
    /**
     * Check if `arg` matches the short or long flag.
     *
     * @param {string} arg
     * @return {boolean}
     * @package
     */
    is(s) {
      return this.short === s || this.long === s;
    }
    /**
     * Return whether a boolean option.
     *
     * Options are one of boolean, negated, required argument, or optional argument.
     *
     * @return {boolean}
     * @package
     */
    isBoolean() {
      return !this.required && !this.optional && !this.negate;
    }
  }
  class h {
    /**
     * @param {Option[]} options
     */
    constructor(s) {
      this.positiveOptions = /* @__PURE__ */ new Map(), this.negativeOptions = /* @__PURE__ */ new Map(), this.dualOptions = /* @__PURE__ */ new Set(), s.forEach((l) => {
        l.negate ? this.negativeOptions.set(l.attributeName(), l) : this.positiveOptions.set(l.attributeName(), l);
      }), this.negativeOptions.forEach((l, d) => {
        this.positiveOptions.has(d) && this.dualOptions.add(d);
      });
    }
    /**
     * Did the value come from the option, and not from possible matching dual option?
     *
     * @param {*} value
     * @param {Option} option
     * @returns {boolean}
     */
    valueFromOption(s, l) {
      const d = l.attributeName();
      if (!this.dualOptions.has(d)) return !0;
      const g = this.negativeOptions.get(d).presetArg, C = g !== void 0 ? g : !1;
      return l.negate === (C === s);
    }
  }
  function m(n) {
    return n.split("-").reduce((s, l) => s + l[0].toUpperCase() + l.slice(1));
  }
  function t(n) {
    let s, l;
    const d = /^-[^-]$/, g = /^--[^-]/, C = n.split(/[ |,]+/).concat("guard");
    if (d.test(C[0]) && (s = C.shift()), g.test(C[0]) && (l = C.shift()), !s && d.test(C[0]) && (s = C.shift()), !s && g.test(C[0]) && (s = l, l = C.shift()), C[0].startsWith("-")) {
      const y = C[0], x = `option creation failed due to '${y}' in option flags '${n}'`;
      throw /^-[^-][^-]/.test(y) ? new Error(
        `${x}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`
      ) : d.test(y) ? new Error(`${x}
- too many short flags`) : g.test(y) ? new Error(`${x}
- too many long flags`) : new Error(`${x}
- unrecognised flag format`);
    }
    if (s === void 0 && l === void 0)
      throw new Error(
        `option creation failed due to no flags found in '${n}'.`
      );
    return { shortFlag: s, longFlag: l };
  }
  return W.Option = u, W.DualOptions = h, W;
}
var q = {}, J;
function me() {
  if (J) return q;
  J = 1;
  const p = 3;
  function u(m, t) {
    if (Math.abs(m.length - t.length) > p)
      return Math.max(m.length, t.length);
    const n = [];
    for (let s = 0; s <= m.length; s++)
      n[s] = [s];
    for (let s = 0; s <= t.length; s++)
      n[0][s] = s;
    for (let s = 1; s <= t.length; s++)
      for (let l = 1; l <= m.length; l++) {
        let d = 1;
        m[l - 1] === t[s - 1] ? d = 0 : d = 1, n[l][s] = Math.min(
          n[l - 1][s] + 1,
          // deletion
          n[l][s - 1] + 1,
          // insertion
          n[l - 1][s - 1] + d
          // substitution
        ), l > 1 && s > 1 && m[l - 1] === t[s - 2] && m[l - 2] === t[s - 1] && (n[l][s] = Math.min(n[l][s], n[l - 2][s - 2] + 1));
      }
    return n[m.length][t.length];
  }
  function h(m, t) {
    if (!t || t.length === 0) return "";
    t = Array.from(new Set(t));
    const n = m.startsWith("--");
    n && (m = m.slice(2), t = t.map((g) => g.slice(2)));
    let s = [], l = p;
    const d = 0.4;
    return t.forEach((g) => {
      if (g.length <= 1) return;
      const C = u(m, g), y = Math.max(m.length, g.length);
      (y - C) / y > d && (C < l ? (l = C, s = [g]) : C === l && s.push(g));
    }), s.sort((g, C) => g.localeCompare(C)), n && (s = s.map((g) => `--${g}`)), s.length > 1 ? `
(Did you mean one of ${s.join(", ")}?)` : s.length === 1 ? `
(Did you mean ${s[0]}?)` : "";
  }
  return q.suggestSimilar = h, q;
}
var K;
function pe() {
  if (K) return N;
  K = 1;
  const p = ee.EventEmitter, u = te, h = ie, m = ne, t = se, { Argument: n, humanReadableArgName: s } = M(), { CommanderError: l } = I(), { Help: d, stripColor: g } = Q(), { Option: C, DualOptions: y } = X(), { suggestSimilar: x } = me();
  class v extends p {
    /**
     * Initialize a new `Command`.
     *
     * @param {string} [name]
     */
    constructor(e) {
      super(), this.commands = [], this.options = [], this.parent = null, this._allowUnknownOption = !1, this._allowExcessArguments = !1, this.registeredArguments = [], this._args = this.registeredArguments, this.args = [], this.rawArgs = [], this.processedArgs = [], this._scriptPath = null, this._name = e || "", this._optionValues = {}, this._optionValueSources = {}, this._storeOptionsAsProperties = !1, this._actionHandler = null, this._executableHandler = !1, this._executableFile = null, this._executableDir = null, this._defaultCommandName = null, this._exitCallback = null, this._aliases = [], this._combineFlagAndOptionalValue = !0, this._description = "", this._summary = "", this._argsDescription = void 0, this._enablePositionalOptions = !1, this._passThroughOptions = !1, this._lifeCycleHooks = {}, this._showHelpAfterError = !1, this._showSuggestionAfterError = !0, this._savedState = null, this._outputConfiguration = {
        writeOut: (i) => t.stdout.write(i),
        writeErr: (i) => t.stderr.write(i),
        outputError: (i, r) => r(i),
        getOutHelpWidth: () => t.stdout.isTTY ? t.stdout.columns : void 0,
        getErrHelpWidth: () => t.stderr.isTTY ? t.stderr.columns : void 0,
        getOutHasColors: () => $() ?? (t.stdout.isTTY && t.stdout.hasColors?.()),
        getErrHasColors: () => $() ?? (t.stderr.isTTY && t.stderr.hasColors?.()),
        stripColor: (i) => g(i)
      }, this._hidden = !1, this._helpOption = void 0, this._addImplicitHelpCommand = void 0, this._helpCommand = void 0, this._helpConfiguration = {}, this._helpGroupHeading = void 0, this._defaultCommandGroup = void 0, this._defaultOptionGroup = void 0;
    }
    /**
     * Copy settings that are useful to have in common across root command and subcommands.
     *
     * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
     *
     * @param {Command} sourceCommand
     * @return {Command} `this` command for chaining
     */
    copyInheritedSettings(e) {
      return this._outputConfiguration = e._outputConfiguration, this._helpOption = e._helpOption, this._helpCommand = e._helpCommand, this._helpConfiguration = e._helpConfiguration, this._exitCallback = e._exitCallback, this._storeOptionsAsProperties = e._storeOptionsAsProperties, this._combineFlagAndOptionalValue = e._combineFlagAndOptionalValue, this._allowExcessArguments = e._allowExcessArguments, this._enablePositionalOptions = e._enablePositionalOptions, this._showHelpAfterError = e._showHelpAfterError, this._showSuggestionAfterError = e._showSuggestionAfterError, this;
    }
    /**
     * @returns {Command[]}
     * @private
     */
    _getCommandAndAncestors() {
      const e = [];
      for (let i = this; i; i = i.parent)
        e.push(i);
      return e;
    }
    /**
     * Define a command.
     *
     * There are two styles of command: pay attention to where to put the description.
     *
     * @example
     * // Command implemented using action handler (description is supplied separately to `.command`)
     * program
     *   .command('clone <source> [destination]')
     *   .description('clone a repository into a newly created directory')
     *   .action((source, destination) => {
     *     console.log('clone command called');
     *   });
     *
     * // Command implemented using separate executable file (description is second parameter to `.command`)
     * program
     *   .command('start <service>', 'start named service')
     *   .command('stop [service]', 'stop named service, or all if no name supplied');
     *
     * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
     * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
     * @param {object} [execOpts] - configuration options (for executable)
     * @return {Command} returns new command for action handler, or `this` for executable command
     */
    command(e, i, r) {
      let o = i, a = r;
      typeof o == "object" && o !== null && (a = o, o = null), a = a || {};
      const [, c, _] = e.match(/([^ ]+) *(.*)/), b = this.createCommand(c);
      return o && (b.description(o), b._executableHandler = !0), a.isDefault && (this._defaultCommandName = b._name), b._hidden = !!(a.noHelp || a.hidden), b._executableFile = a.executableFile || null, _ && b.arguments(_), this._registerCommand(b), b.parent = this, b.copyInheritedSettings(this), o ? this : b;
    }
    /**
     * Factory routine to create a new unattached command.
     *
     * See .command() for creating an attached subcommand, which uses this routine to
     * create the command. You can override createCommand to customise subcommands.
     *
     * @param {string} [name]
     * @return {Command} new command
     */
    createCommand(e) {
      return new v(e);
    }
    /**
     * You can customise the help with a subclass of Help by overriding createHelp,
     * or by overriding Help properties using configureHelp().
     *
     * @return {Help}
     */
    createHelp() {
      return Object.assign(new d(), this.configureHelp());
    }
    /**
     * You can customise the help by overriding Help properties using configureHelp(),
     * or with a subclass of Help by overriding createHelp().
     *
     * @param {object} [configuration] - configuration options
     * @return {(Command | object)} `this` command for chaining, or stored configuration
     */
    configureHelp(e) {
      return e === void 0 ? this._helpConfiguration : (this._helpConfiguration = e, this);
    }
    /**
     * The default output goes to stdout and stderr. You can customise this for special
     * applications. You can also customise the display of errors by overriding outputError.
     *
     * The configuration properties are all functions:
     *
     *     // change how output being written, defaults to stdout and stderr
     *     writeOut(str)
     *     writeErr(str)
     *     // change how output being written for errors, defaults to writeErr
     *     outputError(str, write) // used for displaying errors and not used for displaying help
     *     // specify width for wrapping help
     *     getOutHelpWidth()
     *     getErrHelpWidth()
     *     // color support, currently only used with Help
     *     getOutHasColors()
     *     getErrHasColors()
     *     stripColor() // used to remove ANSI escape codes if output does not have colors
     *
     * @param {object} [configuration] - configuration options
     * @return {(Command | object)} `this` command for chaining, or stored configuration
     */
    configureOutput(e) {
      return e === void 0 ? this._outputConfiguration : (this._outputConfiguration = {
        ...this._outputConfiguration,
        ...e
      }, this);
    }
    /**
     * Display the help or a custom message after an error occurs.
     *
     * @param {(boolean|string)} [displayHelp]
     * @return {Command} `this` command for chaining
     */
    showHelpAfterError(e = !0) {
      return typeof e != "string" && (e = !!e), this._showHelpAfterError = e, this;
    }
    /**
     * Display suggestion of similar commands for unknown commands, or options for unknown options.
     *
     * @param {boolean} [displaySuggestion]
     * @return {Command} `this` command for chaining
     */
    showSuggestionAfterError(e = !0) {
      return this._showSuggestionAfterError = !!e, this;
    }
    /**
     * Add a prepared subcommand.
     *
     * See .command() for creating an attached subcommand which inherits settings from its parent.
     *
     * @param {Command} cmd - new subcommand
     * @param {object} [opts] - configuration options
     * @return {Command} `this` command for chaining
     */
    addCommand(e, i) {
      if (!e._name)
        throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
      return i = i || {}, i.isDefault && (this._defaultCommandName = e._name), (i.noHelp || i.hidden) && (e._hidden = !0), this._registerCommand(e), e.parent = this, e._checkForBrokenPassThrough(), this;
    }
    /**
     * Factory routine to create a new unattached argument.
     *
     * See .argument() for creating an attached argument, which uses this routine to
     * create the argument. You can override createArgument to return a custom argument.
     *
     * @param {string} name
     * @param {string} [description]
     * @return {Argument} new argument
     */
    createArgument(e, i) {
      return new n(e, i);
    }
    /**
     * Define argument syntax for command.
     *
     * The default is that the argument is required, and you can explicitly
     * indicate this with <> around the name. Put [] around the name for an optional argument.
     *
     * @example
     * program.argument('<input-file>');
     * program.argument('[output-file]');
     *
     * @param {string} name
     * @param {string} [description]
     * @param {(Function|*)} [parseArg] - custom argument processing function or default value
     * @param {*} [defaultValue]
     * @return {Command} `this` command for chaining
     */
    argument(e, i, r, o) {
      const a = this.createArgument(e, i);
      return typeof r == "function" ? a.default(o).argParser(r) : a.default(r), this.addArgument(a), this;
    }
    /**
     * Define argument syntax for command, adding multiple at once (without descriptions).
     *
     * See also .argument().
     *
     * @example
     * program.arguments('<cmd> [env]');
     *
     * @param {string} names
     * @return {Command} `this` command for chaining
     */
    arguments(e) {
      return e.trim().split(/ +/).forEach((i) => {
        this.argument(i);
      }), this;
    }
    /**
     * Define argument syntax for command, adding a prepared argument.
     *
     * @param {Argument} argument
     * @return {Command} `this` command for chaining
     */
    addArgument(e) {
      const i = this.registeredArguments.slice(-1)[0];
      if (i?.variadic)
        throw new Error(
          `only the last argument can be variadic '${i.name()}'`
        );
      if (e.required && e.defaultValue !== void 0 && e.parseArg === void 0)
        throw new Error(
          `a default value for a required argument is never used: '${e.name()}'`
        );
      return this.registeredArguments.push(e), this;
    }
    /**
     * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
     *
     * @example
     *    program.helpCommand('help [cmd]');
     *    program.helpCommand('help [cmd]', 'show help');
     *    program.helpCommand(false); // suppress default help command
     *    program.helpCommand(true); // add help command even if no subcommands
     *
     * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
     * @param {string} [description] - custom description
     * @return {Command} `this` command for chaining
     */
    helpCommand(e, i) {
      if (typeof e == "boolean")
        return this._addImplicitHelpCommand = e, e && this._defaultCommandGroup && this._initCommandGroup(this._getHelpCommand()), this;
      const r = e ?? "help [command]", [, o, a] = r.match(/([^ ]+) *(.*)/), c = i ?? "display help for command", _ = this.createCommand(o);
      return _.helpOption(!1), a && _.arguments(a), c && _.description(c), this._addImplicitHelpCommand = !0, this._helpCommand = _, (e || i) && this._initCommandGroup(_), this;
    }
    /**
     * Add prepared custom help command.
     *
     * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
     * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
     * @return {Command} `this` command for chaining
     */
    addHelpCommand(e, i) {
      return typeof e != "object" ? (this.helpCommand(e, i), this) : (this._addImplicitHelpCommand = !0, this._helpCommand = e, this._initCommandGroup(e), this);
    }
    /**
     * Lazy create help command.
     *
     * @return {(Command|null)}
     * @package
     */
    _getHelpCommand() {
      return this._addImplicitHelpCommand ?? (this.commands.length && !this._actionHandler && !this._findCommand("help")) ? (this._helpCommand === void 0 && this.helpCommand(void 0, void 0), this._helpCommand) : null;
    }
    /**
     * Add hook for life cycle event.
     *
     * @param {string} event
     * @param {Function} listener
     * @return {Command} `this` command for chaining
     */
    hook(e, i) {
      const r = ["preSubcommand", "preAction", "postAction"];
      if (!r.includes(e))
        throw new Error(`Unexpected value for event passed to hook : '${e}'.
Expecting one of '${r.join("', '")}'`);
      return this._lifeCycleHooks[e] ? this._lifeCycleHooks[e].push(i) : this._lifeCycleHooks[e] = [i], this;
    }
    /**
     * Register callback to use as replacement for calling process.exit.
     *
     * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
     * @return {Command} `this` command for chaining
     */
    exitOverride(e) {
      return e ? this._exitCallback = e : this._exitCallback = (i) => {
        if (i.code !== "commander.executeSubCommandAsync")
          throw i;
      }, this;
    }
    /**
     * Call process.exit, and _exitCallback if defined.
     *
     * @param {number} exitCode exit code for using with process.exit
     * @param {string} code an id string representing the error
     * @param {string} message human-readable description of the error
     * @return never
     * @private
     */
    _exit(e, i, r) {
      this._exitCallback && this._exitCallback(new l(e, i, r)), t.exit(e);
    }
    /**
     * Register callback `fn` for the command.
     *
     * @example
     * program
     *   .command('serve')
     *   .description('start service')
     *   .action(function() {
     *      // do work here
     *   });
     *
     * @param {Function} fn
     * @return {Command} `this` command for chaining
     */
    action(e) {
      const i = (r) => {
        const o = this.registeredArguments.length, a = r.slice(0, o);
        return this._storeOptionsAsProperties ? a[o] = this : a[o] = this.opts(), a.push(this), e.apply(this, a);
      };
      return this._actionHandler = i, this;
    }
    /**
     * Factory routine to create a new unattached option.
     *
     * See .option() for creating an attached option, which uses this routine to
     * create the option. You can override createOption to return a custom option.
     *
     * @param {string} flags
     * @param {string} [description]
     * @return {Option} new option
     */
    createOption(e, i) {
      return new C(e, i);
    }
    /**
     * Wrap parseArgs to catch 'commander.invalidArgument'.
     *
     * @param {(Option | Argument)} target
     * @param {string} value
     * @param {*} previous
     * @param {string} invalidArgumentMessage
     * @private
     */
    _callParseArg(e, i, r, o) {
      try {
        return e.parseArg(i, r);
      } catch (a) {
        if (a.code === "commander.invalidArgument") {
          const c = `${o} ${a.message}`;
          this.error(c, { exitCode: a.exitCode, code: a.code });
        }
        throw a;
      }
    }
    /**
     * Check for option flag conflicts.
     * Register option if no conflicts found, or throw on conflict.
     *
     * @param {Option} option
     * @private
     */
    _registerOption(e) {
      const i = e.short && this._findOption(e.short) || e.long && this._findOption(e.long);
      if (i) {
        const r = e.long && this._findOption(e.long) ? e.long : e.short;
        throw new Error(`Cannot add option '${e.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${r}'
-  already used by option '${i.flags}'`);
      }
      this._initOptionGroup(e), this.options.push(e);
    }
    /**
     * Check for command name and alias conflicts with existing commands.
     * Register command if no conflicts found, or throw on conflict.
     *
     * @param {Command} command
     * @private
     */
    _registerCommand(e) {
      const i = (o) => [o.name()].concat(o.aliases()), r = i(e).find(
        (o) => this._findCommand(o)
      );
      if (r) {
        const o = i(this._findCommand(r)).join("|"), a = i(e).join("|");
        throw new Error(
          `cannot add command '${a}' as already have command '${o}'`
        );
      }
      this._initCommandGroup(e), this.commands.push(e);
    }
    /**
     * Add an option.
     *
     * @param {Option} option
     * @return {Command} `this` command for chaining
     */
    addOption(e) {
      this._registerOption(e);
      const i = e.name(), r = e.attributeName();
      if (e.negate) {
        const a = e.long.replace(/^--no-/, "--");
        this._findOption(a) || this.setOptionValueWithSource(
          r,
          e.defaultValue === void 0 ? !0 : e.defaultValue,
          "default"
        );
      } else e.defaultValue !== void 0 && this.setOptionValueWithSource(r, e.defaultValue, "default");
      const o = (a, c, _) => {
        a == null && e.presetArg !== void 0 && (a = e.presetArg);
        const b = this.getOptionValue(r);
        a !== null && e.parseArg ? a = this._callParseArg(e, a, b, c) : a !== null && e.variadic && (a = e._collectValue(a, b)), a == null && (e.negate ? a = !1 : e.isBoolean() || e.optional ? a = !0 : a = ""), this.setOptionValueWithSource(r, a, _);
      };
      return this.on("option:" + i, (a) => {
        const c = `error: option '${e.flags}' argument '${a}' is invalid.`;
        o(a, c, "cli");
      }), e.envVar && this.on("optionEnv:" + i, (a) => {
        const c = `error: option '${e.flags}' value '${a}' from env '${e.envVar}' is invalid.`;
        o(a, c, "env");
      }), this;
    }
    /**
     * Internal implementation shared by .option() and .requiredOption()
     *
     * @return {Command} `this` command for chaining
     * @private
     */
    _optionEx(e, i, r, o, a) {
      if (typeof i == "object" && i instanceof C)
        throw new Error(
          "To add an Option object use addOption() instead of option() or requiredOption()"
        );
      const c = this.createOption(i, r);
      if (c.makeOptionMandatory(!!e.mandatory), typeof o == "function")
        c.default(a).argParser(o);
      else if (o instanceof RegExp) {
        const _ = o;
        o = (b, A) => {
          const f = _.exec(b);
          return f ? f[0] : A;
        }, c.default(a).argParser(o);
      } else
        c.default(o);
      return this.addOption(c);
    }
    /**
     * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
     *
     * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
     * option-argument is indicated by `<>` and an optional option-argument by `[]`.
     *
     * See the README for more details, and see also addOption() and requiredOption().
     *
     * @example
     * program
     *     .option('-p, --pepper', 'add pepper')
     *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
     *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
     *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
     *
     * @param {string} flags
     * @param {string} [description]
     * @param {(Function|*)} [parseArg] - custom option processing function or default value
     * @param {*} [defaultValue]
     * @return {Command} `this` command for chaining
     */
    option(e, i, r, o) {
      return this._optionEx({}, e, i, r, o);
    }
    /**
     * Add a required option which must have a value after parsing. This usually means
     * the option must be specified on the command line. (Otherwise the same as .option().)
     *
     * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
     *
     * @param {string} flags
     * @param {string} [description]
     * @param {(Function|*)} [parseArg] - custom option processing function or default value
     * @param {*} [defaultValue]
     * @return {Command} `this` command for chaining
     */
    requiredOption(e, i, r, o) {
      return this._optionEx(
        { mandatory: !0 },
        e,
        i,
        r,
        o
      );
    }
    /**
     * Alter parsing of short flags with optional values.
     *
     * @example
     * // for `.option('-f,--flag [value]'):
     * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
     * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
     *
     * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
     * @return {Command} `this` command for chaining
     */
    combineFlagAndOptionalValue(e = !0) {
      return this._combineFlagAndOptionalValue = !!e, this;
    }
    /**
     * Allow unknown options on the command line.
     *
     * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
     * @return {Command} `this` command for chaining
     */
    allowUnknownOption(e = !0) {
      return this._allowUnknownOption = !!e, this;
    }
    /**
     * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
     *
     * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
     * @return {Command} `this` command for chaining
     */
    allowExcessArguments(e = !0) {
      return this._allowExcessArguments = !!e, this;
    }
    /**
     * Enable positional options. Positional means global options are specified before subcommands which lets
     * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
     * The default behaviour is non-positional and global options may appear anywhere on the command line.
     *
     * @param {boolean} [positional]
     * @return {Command} `this` command for chaining
     */
    enablePositionalOptions(e = !0) {
      return this._enablePositionalOptions = !!e, this;
    }
    /**
     * Pass through options that come after command-arguments rather than treat them as command-options,
     * so actual command-options come before command-arguments. Turning this on for a subcommand requires
     * positional options to have been enabled on the program (parent commands).
     * The default behaviour is non-positional and options may appear before or after command-arguments.
     *
     * @param {boolean} [passThrough] for unknown options.
     * @return {Command} `this` command for chaining
     */
    passThroughOptions(e = !0) {
      return this._passThroughOptions = !!e, this._checkForBrokenPassThrough(), this;
    }
    /**
     * @private
     */
    _checkForBrokenPassThrough() {
      if (this.parent && this._passThroughOptions && !this.parent._enablePositionalOptions)
        throw new Error(
          `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`
        );
    }
    /**
     * Whether to store option values as properties on command object,
     * or store separately (specify false). In both cases the option values can be accessed using .opts().
     *
     * @param {boolean} [storeAsProperties=true]
     * @return {Command} `this` command for chaining
     */
    storeOptionsAsProperties(e = !0) {
      if (this.options.length)
        throw new Error("call .storeOptionsAsProperties() before adding options");
      if (Object.keys(this._optionValues).length)
        throw new Error(
          "call .storeOptionsAsProperties() before setting option values"
        );
      return this._storeOptionsAsProperties = !!e, this;
    }
    /**
     * Retrieve option value.
     *
     * @param {string} key
     * @return {object} value
     */
    getOptionValue(e) {
      return this._storeOptionsAsProperties ? this[e] : this._optionValues[e];
    }
    /**
     * Store option value.
     *
     * @param {string} key
     * @param {object} value
     * @return {Command} `this` command for chaining
     */
    setOptionValue(e, i) {
      return this.setOptionValueWithSource(e, i, void 0);
    }
    /**
     * Store option value and where the value came from.
     *
     * @param {string} key
     * @param {object} value
     * @param {string} source - expected values are default/config/env/cli/implied
     * @return {Command} `this` command for chaining
     */
    setOptionValueWithSource(e, i, r) {
      return this._storeOptionsAsProperties ? this[e] = i : this._optionValues[e] = i, this._optionValueSources[e] = r, this;
    }
    /**
     * Get source of option value.
     * Expected values are default | config | env | cli | implied
     *
     * @param {string} key
     * @return {string}
     */
    getOptionValueSource(e) {
      return this._optionValueSources[e];
    }
    /**
     * Get source of option value. See also .optsWithGlobals().
     * Expected values are default | config | env | cli | implied
     *
     * @param {string} key
     * @return {string}
     */
    getOptionValueSourceWithGlobals(e) {
      let i;
      return this._getCommandAndAncestors().forEach((r) => {
        r.getOptionValueSource(e) !== void 0 && (i = r.getOptionValueSource(e));
      }), i;
    }
    /**
     * Get user arguments from implied or explicit arguments.
     * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
     *
     * @private
     */
    _prepareUserArgs(e, i) {
      if (e !== void 0 && !Array.isArray(e))
        throw new Error("first parameter to parse must be array or undefined");
      if (i = i || {}, e === void 0 && i.from === void 0) {
        t.versions?.electron && (i.from = "electron");
        const o = t.execArgv ?? [];
        (o.includes("-e") || o.includes("--eval") || o.includes("-p") || o.includes("--print")) && (i.from = "eval");
      }
      e === void 0 && (e = t.argv), this.rawArgs = e.slice();
      let r;
      switch (i.from) {
        case void 0:
        case "node":
          this._scriptPath = e[1], r = e.slice(2);
          break;
        case "electron":
          t.defaultApp ? (this._scriptPath = e[1], r = e.slice(2)) : r = e.slice(1);
          break;
        case "user":
          r = e.slice(0);
          break;
        case "eval":
          r = e.slice(1);
          break;
        default:
          throw new Error(
            `unexpected parse option { from: '${i.from}' }`
          );
      }
      return !this._name && this._scriptPath && this.nameFromFilename(this._scriptPath), this._name = this._name || "program", r;
    }
    /**
     * Parse `argv`, setting options and invoking commands when defined.
     *
     * Use parseAsync instead of parse if any of your action handlers are async.
     *
     * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
     *
     * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
     * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
     * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
     * - `'user'`: just user arguments
     *
     * @example
     * program.parse(); // parse process.argv and auto-detect electron and special node flags
     * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
     * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
     *
     * @param {string[]} [argv] - optional, defaults to process.argv
     * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
     * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
     * @return {Command} `this` command for chaining
     */
    parse(e, i) {
      this._prepareForParse();
      const r = this._prepareUserArgs(e, i);
      return this._parseCommand([], r), this;
    }
    /**
     * Parse `argv`, setting options and invoking commands when defined.
     *
     * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
     *
     * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
     * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
     * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
     * - `'user'`: just user arguments
     *
     * @example
     * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
     * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
     * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
     *
     * @param {string[]} [argv]
     * @param {object} [parseOptions]
     * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
     * @return {Promise}
     */
    async parseAsync(e, i) {
      this._prepareForParse();
      const r = this._prepareUserArgs(e, i);
      return await this._parseCommand([], r), this;
    }
    _prepareForParse() {
      this._savedState === null ? this.saveStateBeforeParse() : this.restoreStateBeforeParse();
    }
    /**
     * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
     * Not usually called directly, but available for subclasses to save their custom state.
     *
     * This is called in a lazy way. Only commands used in parsing chain will have state saved.
     */
    saveStateBeforeParse() {
      this._savedState = {
        // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
        _name: this._name,
        // option values before parse have default values (including false for negated options)
        // shallow clones
        _optionValues: { ...this._optionValues },
        _optionValueSources: { ...this._optionValueSources }
      };
    }
    /**
     * Restore state before parse for calls after the first.
     * Not usually called directly, but available for subclasses to save their custom state.
     *
     * This is called in a lazy way. Only commands used in parsing chain will have state restored.
     */
    restoreStateBeforeParse() {
      if (this._storeOptionsAsProperties)
        throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);
      this._name = this._savedState._name, this._scriptPath = null, this.rawArgs = [], this._optionValues = { ...this._savedState._optionValues }, this._optionValueSources = { ...this._savedState._optionValueSources }, this.args = [], this.processedArgs = [];
    }
    /**
     * Throw if expected executable is missing. Add lots of help for author.
     *
     * @param {string} executableFile
     * @param {string} executableDir
     * @param {string} subcommandName
     */
    _checkForMissingExecutable(e, i, r) {
      if (m.existsSync(e)) return;
      const o = i ? `searched for local subcommand relative to directory '${i}'` : "no directory for search for local subcommand, use .executableDir() to supply a custom directory", a = `'${e}' does not exist
 - if '${r}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${o}`;
      throw new Error(a);
    }
    /**
     * Execute a sub-command executable.
     *
     * @private
     */
    _executeSubCommand(e, i) {
      i = i.slice();
      let r = !1;
      const o = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
      function a(f, O) {
        const E = h.resolve(f, O);
        if (m.existsSync(E)) return E;
        if (o.includes(h.extname(O))) return;
        const L = o.find(
          (Z) => m.existsSync(`${E}${Z}`)
        );
        if (L) return `${E}${L}`;
      }
      this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
      let c = e._executableFile || `${this._name}-${e._name}`, _ = this._executableDir || "";
      if (this._scriptPath) {
        let f;
        try {
          f = m.realpathSync(this._scriptPath);
        } catch {
          f = this._scriptPath;
        }
        _ = h.resolve(
          h.dirname(f),
          _
        );
      }
      if (_) {
        let f = a(_, c);
        if (!f && !e._executableFile && this._scriptPath) {
          const O = h.basename(
            this._scriptPath,
            h.extname(this._scriptPath)
          );
          O !== this._name && (f = a(
            _,
            `${O}-${e._name}`
          ));
        }
        c = f || c;
      }
      r = o.includes(h.extname(c));
      let b;
      t.platform !== "win32" ? r ? (i.unshift(c), i = w(t.execArgv).concat(i), b = u.spawn(t.argv[0], i, { stdio: "inherit" })) : b = u.spawn(c, i, { stdio: "inherit" }) : (this._checkForMissingExecutable(
        c,
        _,
        e._name
      ), i.unshift(c), i = w(t.execArgv).concat(i), b = u.spawn(t.execPath, i, { stdio: "inherit" })), b.killed || ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"].forEach((O) => {
        t.on(O, () => {
          b.killed === !1 && b.exitCode === null && b.kill(O);
        });
      });
      const A = this._exitCallback;
      b.on("close", (f) => {
        f = f ?? 1, A ? A(
          new l(
            f,
            "commander.executeSubCommandAsync",
            "(close)"
          )
        ) : t.exit(f);
      }), b.on("error", (f) => {
        if (f.code === "ENOENT")
          this._checkForMissingExecutable(
            c,
            _,
            e._name
          );
        else if (f.code === "EACCES")
          throw new Error(`'${c}' not executable`);
        if (!A)
          t.exit(1);
        else {
          const O = new l(
            1,
            "commander.executeSubCommandAsync",
            "(error)"
          );
          O.nestedError = f, A(O);
        }
      }), this.runningCommand = b;
    }
    /**
     * @private
     */
    _dispatchSubcommand(e, i, r) {
      const o = this._findCommand(e);
      o || this.help({ error: !0 }), o._prepareForParse();
      let a;
      return a = this._chainOrCallSubCommandHook(
        a,
        o,
        "preSubcommand"
      ), a = this._chainOrCall(a, () => {
        if (o._executableHandler)
          this._executeSubCommand(o, i.concat(r));
        else
          return o._parseCommand(i, r);
      }), a;
    }
    /**
     * Invoke help directly if possible, or dispatch if necessary.
     * e.g. help foo
     *
     * @private
     */
    _dispatchHelpCommand(e) {
      e || this.help();
      const i = this._findCommand(e);
      return i && !i._executableHandler && i.help(), this._dispatchSubcommand(
        e,
        [],
        [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? "--help"]
      );
    }
    /**
     * Check this.args against expected this.registeredArguments.
     *
     * @private
     */
    _checkNumberOfArguments() {
      this.registeredArguments.forEach((e, i) => {
        e.required && this.args[i] == null && this.missingArgument(e.name());
      }), !(this.registeredArguments.length > 0 && this.registeredArguments[this.registeredArguments.length - 1].variadic) && this.args.length > this.registeredArguments.length && this._excessArguments(this.args);
    }
    /**
     * Process this.args using this.registeredArguments and save as this.processedArgs!
     *
     * @private
     */
    _processArguments() {
      const e = (r, o, a) => {
        let c = o;
        if (o !== null && r.parseArg) {
          const _ = `error: command-argument value '${o}' is invalid for argument '${r.name()}'.`;
          c = this._callParseArg(
            r,
            o,
            a,
            _
          );
        }
        return c;
      };
      this._checkNumberOfArguments();
      const i = [];
      this.registeredArguments.forEach((r, o) => {
        let a = r.defaultValue;
        r.variadic ? o < this.args.length ? (a = this.args.slice(o), r.parseArg && (a = a.reduce((c, _) => e(r, _, c), r.defaultValue))) : a === void 0 && (a = []) : o < this.args.length && (a = this.args[o], r.parseArg && (a = e(r, a, r.defaultValue))), i[o] = a;
      }), this.processedArgs = i;
    }
    /**
     * Once we have a promise we chain, but call synchronously until then.
     *
     * @param {(Promise|undefined)} promise
     * @param {Function} fn
     * @return {(Promise|undefined)}
     * @private
     */
    _chainOrCall(e, i) {
      return e?.then && typeof e.then == "function" ? e.then(() => i()) : i();
    }
    /**
     *
     * @param {(Promise|undefined)} promise
     * @param {string} event
     * @return {(Promise|undefined)}
     * @private
     */
    _chainOrCallHooks(e, i) {
      let r = e;
      const o = [];
      return this._getCommandAndAncestors().reverse().filter((a) => a._lifeCycleHooks[i] !== void 0).forEach((a) => {
        a._lifeCycleHooks[i].forEach((c) => {
          o.push({ hookedCommand: a, callback: c });
        });
      }), i === "postAction" && o.reverse(), o.forEach((a) => {
        r = this._chainOrCall(r, () => a.callback(a.hookedCommand, this));
      }), r;
    }
    /**
     *
     * @param {(Promise|undefined)} promise
     * @param {Command} subCommand
     * @param {string} event
     * @return {(Promise|undefined)}
     * @private
     */
    _chainOrCallSubCommandHook(e, i, r) {
      let o = e;
      return this._lifeCycleHooks[r] !== void 0 && this._lifeCycleHooks[r].forEach((a) => {
        o = this._chainOrCall(o, () => a(this, i));
      }), o;
    }
    /**
     * Process arguments in context of this command.
     * Returns action result, in case it is a promise.
     *
     * @private
     */
    _parseCommand(e, i) {
      const r = this.parseOptions(i);
      if (this._parseOptionsEnv(), this._parseOptionsImplied(), e = e.concat(r.operands), i = r.unknown, this.args = e.concat(i), e && this._findCommand(e[0]))
        return this._dispatchSubcommand(e[0], e.slice(1), i);
      if (this._getHelpCommand() && e[0] === this._getHelpCommand().name())
        return this._dispatchHelpCommand(e[1]);
      if (this._defaultCommandName)
        return this._outputHelpIfRequested(i), this._dispatchSubcommand(
          this._defaultCommandName,
          e,
          i
        );
      this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName && this.help({ error: !0 }), this._outputHelpIfRequested(r.unknown), this._checkForMissingMandatoryOptions(), this._checkForConflictingOptions();
      const o = () => {
        r.unknown.length > 0 && this.unknownOption(r.unknown[0]);
      }, a = `command:${this.name()}`;
      if (this._actionHandler) {
        o(), this._processArguments();
        let c;
        return c = this._chainOrCallHooks(c, "preAction"), c = this._chainOrCall(
          c,
          () => this._actionHandler(this.processedArgs)
        ), this.parent && (c = this._chainOrCall(c, () => {
          this.parent.emit(a, e, i);
        })), c = this._chainOrCallHooks(c, "postAction"), c;
      }
      if (this.parent?.listenerCount(a))
        o(), this._processArguments(), this.parent.emit(a, e, i);
      else if (e.length) {
        if (this._findCommand("*"))
          return this._dispatchSubcommand("*", e, i);
        this.listenerCount("command:*") ? this.emit("command:*", e, i) : this.commands.length ? this.unknownCommand() : (o(), this._processArguments());
      } else this.commands.length ? (o(), this.help({ error: !0 })) : (o(), this._processArguments());
    }
    /**
     * Find matching command.
     *
     * @private
     * @return {Command | undefined}
     */
    _findCommand(e) {
      if (e)
        return this.commands.find(
          (i) => i._name === e || i._aliases.includes(e)
        );
    }
    /**
     * Return an option matching `arg` if any.
     *
     * @param {string} arg
     * @return {Option}
     * @package
     */
    _findOption(e) {
      return this.options.find((i) => i.is(e));
    }
    /**
     * Display an error message if a mandatory option does not have a value.
     * Called after checking for help flags in leaf subcommand.
     *
     * @private
     */
    _checkForMissingMandatoryOptions() {
      this._getCommandAndAncestors().forEach((e) => {
        e.options.forEach((i) => {
          i.mandatory && e.getOptionValue(i.attributeName()) === void 0 && e.missingMandatoryOptionValue(i);
        });
      });
    }
    /**
     * Display an error message if conflicting options are used together in this.
     *
     * @private
     */
    _checkForConflictingLocalOptions() {
      const e = this.options.filter((r) => {
        const o = r.attributeName();
        return this.getOptionValue(o) === void 0 ? !1 : this.getOptionValueSource(o) !== "default";
      });
      e.filter(
        (r) => r.conflictsWith.length > 0
      ).forEach((r) => {
        const o = e.find(
          (a) => r.conflictsWith.includes(a.attributeName())
        );
        o && this._conflictingOption(r, o);
      });
    }
    /**
     * Display an error message if conflicting options are used together.
     * Called after checking for help flags in leaf subcommand.
     *
     * @private
     */
    _checkForConflictingOptions() {
      this._getCommandAndAncestors().forEach((e) => {
        e._checkForConflictingLocalOptions();
      });
    }
    /**
     * Parse options from `argv` removing known options,
     * and return argv split into operands and unknown arguments.
     *
     * Side effects: modifies command by storing options. Does not reset state if called again.
     *
     * Examples:
     *
     *     argv => operands, unknown
     *     --known kkk op => [op], []
     *     op --known kkk => [op], []
     *     sub --unknown uuu op => [sub], [--unknown uuu op]
     *     sub -- --unknown uuu op => [sub --unknown uuu op], []
     *
     * @param {string[]} args
     * @return {{operands: string[], unknown: string[]}}
     */
    parseOptions(e) {
      const i = [], r = [];
      let o = i;
      function a(f) {
        return f.length > 1 && f[0] === "-";
      }
      const c = (f) => /^-\d*\.?\d+(e[+-]?\d+)?$/.test(f) ? !this._getCommandAndAncestors().some(
        (O) => O.options.map((E) => E.short).some((E) => /^-\d$/.test(E))
      ) : !1;
      let _ = null, b = null, A = 0;
      for (; A < e.length || b; ) {
        const f = b ?? e[A++];
        if (b = null, f === "--") {
          o === r && o.push(f), o.push(...e.slice(A));
          break;
        }
        if (_ && (!a(f) || c(f))) {
          this.emit(`option:${_.name()}`, f);
          continue;
        }
        if (_ = null, a(f)) {
          const O = this._findOption(f);
          if (O) {
            if (O.required) {
              const E = e[A++];
              E === void 0 && this.optionMissingArgument(O), this.emit(`option:${O.name()}`, E);
            } else if (O.optional) {
              let E = null;
              A < e.length && (!a(e[A]) || c(e[A])) && (E = e[A++]), this.emit(`option:${O.name()}`, E);
            } else
              this.emit(`option:${O.name()}`);
            _ = O.variadic ? O : null;
            continue;
          }
        }
        if (f.length > 2 && f[0] === "-" && f[1] !== "-") {
          const O = this._findOption(`-${f[1]}`);
          if (O) {
            O.required || O.optional && this._combineFlagAndOptionalValue ? this.emit(`option:${O.name()}`, f.slice(2)) : (this.emit(`option:${O.name()}`), b = `-${f.slice(2)}`);
            continue;
          }
        }
        if (/^--[^=]+=/.test(f)) {
          const O = f.indexOf("="), E = this._findOption(f.slice(0, O));
          if (E && (E.required || E.optional)) {
            this.emit(`option:${E.name()}`, f.slice(O + 1));
            continue;
          }
        }
        if (o === i && a(f) && !(this.commands.length === 0 && c(f)) && (o = r), (this._enablePositionalOptions || this._passThroughOptions) && i.length === 0 && r.length === 0) {
          if (this._findCommand(f)) {
            i.push(f), r.push(...e.slice(A));
            break;
          } else if (this._getHelpCommand() && f === this._getHelpCommand().name()) {
            i.push(f, ...e.slice(A));
            break;
          } else if (this._defaultCommandName) {
            r.push(f, ...e.slice(A));
            break;
          }
        }
        if (this._passThroughOptions) {
          o.push(f, ...e.slice(A));
          break;
        }
        o.push(f);
      }
      return { operands: i, unknown: r };
    }
    /**
     * Return an object containing local option values as key-value pairs.
     *
     * @return {object}
     */
    opts() {
      if (this._storeOptionsAsProperties) {
        const e = {}, i = this.options.length;
        for (let r = 0; r < i; r++) {
          const o = this.options[r].attributeName();
          e[o] = o === this._versionOptionName ? this._version : this[o];
        }
        return e;
      }
      return this._optionValues;
    }
    /**
     * Return an object containing merged local and global option values as key-value pairs.
     *
     * @return {object}
     */
    optsWithGlobals() {
      return this._getCommandAndAncestors().reduce(
        (e, i) => Object.assign(e, i.opts()),
        {}
      );
    }
    /**
     * Display error message and exit (or call exitOverride).
     *
     * @param {string} message
     * @param {object} [errorOptions]
     * @param {string} [errorOptions.code] - an id string representing the error
     * @param {number} [errorOptions.exitCode] - used with process.exit
     */
    error(e, i) {
      this._outputConfiguration.outputError(
        `${e}
`,
        this._outputConfiguration.writeErr
      ), typeof this._showHelpAfterError == "string" ? this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`) : this._showHelpAfterError && (this._outputConfiguration.writeErr(`
`), this.outputHelp({ error: !0 }));
      const r = i || {}, o = r.exitCode || 1, a = r.code || "commander.error";
      this._exit(o, a, e);
    }
    /**
     * Apply any option related environment variables, if option does
     * not have a value from cli or client code.
     *
     * @private
     */
    _parseOptionsEnv() {
      this.options.forEach((e) => {
        if (e.envVar && e.envVar in t.env) {
          const i = e.attributeName();
          (this.getOptionValue(i) === void 0 || ["default", "config", "env"].includes(
            this.getOptionValueSource(i)
          )) && (e.required || e.optional ? this.emit(`optionEnv:${e.name()}`, t.env[e.envVar]) : this.emit(`optionEnv:${e.name()}`));
        }
      });
    }
    /**
     * Apply any implied option values, if option is undefined or default value.
     *
     * @private
     */
    _parseOptionsImplied() {
      const e = new y(this.options), i = (r) => this.getOptionValue(r) !== void 0 && !["default", "implied"].includes(this.getOptionValueSource(r));
      this.options.filter(
        (r) => r.implied !== void 0 && i(r.attributeName()) && e.valueFromOption(
          this.getOptionValue(r.attributeName()),
          r
        )
      ).forEach((r) => {
        Object.keys(r.implied).filter((o) => !i(o)).forEach((o) => {
          this.setOptionValueWithSource(
            o,
            r.implied[o],
            "implied"
          );
        });
      });
    }
    /**
     * Argument `name` is missing.
     *
     * @param {string} name
     * @private
     */
    missingArgument(e) {
      const i = `error: missing required argument '${e}'`;
      this.error(i, { code: "commander.missingArgument" });
    }
    /**
     * `Option` is missing an argument.
     *
     * @param {Option} option
     * @private
     */
    optionMissingArgument(e) {
      const i = `error: option '${e.flags}' argument missing`;
      this.error(i, { code: "commander.optionMissingArgument" });
    }
    /**
     * `Option` does not have a value, and is a mandatory option.
     *
     * @param {Option} option
     * @private
     */
    missingMandatoryOptionValue(e) {
      const i = `error: required option '${e.flags}' not specified`;
      this.error(i, { code: "commander.missingMandatoryOptionValue" });
    }
    /**
     * `Option` conflicts with another option.
     *
     * @param {Option} option
     * @param {Option} conflictingOption
     * @private
     */
    _conflictingOption(e, i) {
      const r = (c) => {
        const _ = c.attributeName(), b = this.getOptionValue(_), A = this.options.find(
          (O) => O.negate && _ === O.attributeName()
        ), f = this.options.find(
          (O) => !O.negate && _ === O.attributeName()
        );
        return A && (A.presetArg === void 0 && b === !1 || A.presetArg !== void 0 && b === A.presetArg) ? A : f || c;
      }, o = (c) => {
        const _ = r(c), b = _.attributeName();
        return this.getOptionValueSource(b) === "env" ? `environment variable '${_.envVar}'` : `option '${_.flags}'`;
      }, a = `error: ${o(e)} cannot be used with ${o(i)}`;
      this.error(a, { code: "commander.conflictingOption" });
    }
    /**
     * Unknown option `flag`.
     *
     * @param {string} flag
     * @private
     */
    unknownOption(e) {
      if (this._allowUnknownOption) return;
      let i = "";
      if (e.startsWith("--") && this._showSuggestionAfterError) {
        let o = [], a = this;
        do {
          const c = a.createHelp().visibleOptions(a).filter((_) => _.long).map((_) => _.long);
          o = o.concat(c), a = a.parent;
        } while (a && !a._enablePositionalOptions);
        i = x(e, o);
      }
      const r = `error: unknown option '${e}'${i}`;
      this.error(r, { code: "commander.unknownOption" });
    }
    /**
     * Excess arguments, more than expected.
     *
     * @param {string[]} receivedArgs
     * @private
     */
    _excessArguments(e) {
      if (this._allowExcessArguments) return;
      const i = this.registeredArguments.length, r = i === 1 ? "" : "s", a = `error: too many arguments${this.parent ? ` for '${this.name()}'` : ""}. Expected ${i} argument${r} but got ${e.length}.`;
      this.error(a, { code: "commander.excessArguments" });
    }
    /**
     * Unknown command.
     *
     * @private
     */
    unknownCommand() {
      const e = this.args[0];
      let i = "";
      if (this._showSuggestionAfterError) {
        const o = [];
        this.createHelp().visibleCommands(this).forEach((a) => {
          o.push(a.name()), a.alias() && o.push(a.alias());
        }), i = x(e, o);
      }
      const r = `error: unknown command '${e}'${i}`;
      this.error(r, { code: "commander.unknownCommand" });
    }
    /**
     * Get or set the program version.
     *
     * This method auto-registers the "-V, --version" option which will print the version number.
     *
     * You can optionally supply the flags and description to override the defaults.
     *
     * @param {string} [str]
     * @param {string} [flags]
     * @param {string} [description]
     * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
     */
    version(e, i, r) {
      if (e === void 0) return this._version;
      this._version = e, i = i || "-V, --version", r = r || "output the version number";
      const o = this.createOption(i, r);
      return this._versionOptionName = o.attributeName(), this._registerOption(o), this.on("option:" + o.name(), () => {
        this._outputConfiguration.writeOut(`${e}
`), this._exit(0, "commander.version", e);
      }), this;
    }
    /**
     * Set the description.
     *
     * @param {string} [str]
     * @param {object} [argsDescription]
     * @return {(string|Command)}
     */
    description(e, i) {
      return e === void 0 && i === void 0 ? this._description : (this._description = e, i && (this._argsDescription = i), this);
    }
    /**
     * Set the summary. Used when listed as subcommand of parent.
     *
     * @param {string} [str]
     * @return {(string|Command)}
     */
    summary(e) {
      return e === void 0 ? this._summary : (this._summary = e, this);
    }
    /**
     * Set an alias for the command.
     *
     * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
     *
     * @param {string} [alias]
     * @return {(string|Command)}
     */
    alias(e) {
      if (e === void 0) return this._aliases[0];
      let i = this;
      if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler && (i = this.commands[this.commands.length - 1]), e === i._name)
        throw new Error("Command alias can't be the same as its name");
      const r = this.parent?._findCommand(e);
      if (r) {
        const o = [r.name()].concat(r.aliases()).join("|");
        throw new Error(
          `cannot add alias '${e}' to command '${this.name()}' as already have command '${o}'`
        );
      }
      return i._aliases.push(e), this;
    }
    /**
     * Set aliases for the command.
     *
     * Only the first alias is shown in the auto-generated help.
     *
     * @param {string[]} [aliases]
     * @return {(string[]|Command)}
     */
    aliases(e) {
      return e === void 0 ? this._aliases : (e.forEach((i) => this.alias(i)), this);
    }
    /**
     * Set / get the command usage `str`.
     *
     * @param {string} [str]
     * @return {(string|Command)}
     */
    usage(e) {
      if (e === void 0) {
        if (this._usage) return this._usage;
        const i = this.registeredArguments.map((r) => s(r));
        return [].concat(
          this.options.length || this._helpOption !== null ? "[options]" : [],
          this.commands.length ? "[command]" : [],
          this.registeredArguments.length ? i : []
        ).join(" ");
      }
      return this._usage = e, this;
    }
    /**
     * Get or set the name of the command.
     *
     * @param {string} [str]
     * @return {(string|Command)}
     */
    name(e) {
      return e === void 0 ? this._name : (this._name = e, this);
    }
    /**
     * Set/get the help group heading for this subcommand in parent command's help.
     *
     * @param {string} [heading]
     * @return {Command | string}
     */
    helpGroup(e) {
      return e === void 0 ? this._helpGroupHeading ?? "" : (this._helpGroupHeading = e, this);
    }
    /**
     * Set/get the default help group heading for subcommands added to this command.
     * (This does not override a group set directly on the subcommand using .helpGroup().)
     *
     * @example
     * program.commandsGroup('Development Commands:);
     * program.command('watch')...
     * program.command('lint')...
     * ...
     *
     * @param {string} [heading]
     * @returns {Command | string}
     */
    commandsGroup(e) {
      return e === void 0 ? this._defaultCommandGroup ?? "" : (this._defaultCommandGroup = e, this);
    }
    /**
     * Set/get the default help group heading for options added to this command.
     * (This does not override a group set directly on the option using .helpGroup().)
     *
     * @example
     * program
     *   .optionsGroup('Development Options:')
     *   .option('-d, --debug', 'output extra debugging')
     *   .option('-p, --profile', 'output profiling information')
     *
     * @param {string} [heading]
     * @returns {Command | string}
     */
    optionsGroup(e) {
      return e === void 0 ? this._defaultOptionGroup ?? "" : (this._defaultOptionGroup = e, this);
    }
    /**
     * @param {Option} option
     * @private
     */
    _initOptionGroup(e) {
      this._defaultOptionGroup && !e.helpGroupHeading && e.helpGroup(this._defaultOptionGroup);
    }
    /**
     * @param {Command} cmd
     * @private
     */
    _initCommandGroup(e) {
      this._defaultCommandGroup && !e.helpGroup() && e.helpGroup(this._defaultCommandGroup);
    }
    /**
     * Set the name of the command from script filename, such as process.argv[1],
     * or require.main.filename, or __filename.
     *
     * (Used internally and public although not documented in README.)
     *
     * @example
     * program.nameFromFilename(require.main.filename);
     *
     * @param {string} filename
     * @return {Command}
     */
    nameFromFilename(e) {
      return this._name = h.basename(e, h.extname(e)), this;
    }
    /**
     * Get or set the directory for searching for executable subcommands of this command.
     *
     * @example
     * program.executableDir(__dirname);
     * // or
     * program.executableDir('subcommands');
     *
     * @param {string} [path]
     * @return {(string|null|Command)}
     */
    executableDir(e) {
      return e === void 0 ? this._executableDir : (this._executableDir = e, this);
    }
    /**
     * Return program help documentation.
     *
     * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
     * @return {string}
     */
    helpInformation(e) {
      const i = this.createHelp(), r = this._getOutputContext(e);
      i.prepareContext({
        error: r.error,
        helpWidth: r.helpWidth,
        outputHasColors: r.hasColors
      });
      const o = i.formatHelp(this, i);
      return r.hasColors ? o : this._outputConfiguration.stripColor(o);
    }
    /**
     * @typedef HelpContext
     * @type {object}
     * @property {boolean} error
     * @property {number} helpWidth
     * @property {boolean} hasColors
     * @property {function} write - includes stripColor if needed
     *
     * @returns {HelpContext}
     * @private
     */
    _getOutputContext(e) {
      e = e || {};
      const i = !!e.error;
      let r, o, a;
      return i ? (r = (_) => this._outputConfiguration.writeErr(_), o = this._outputConfiguration.getErrHasColors(), a = this._outputConfiguration.getErrHelpWidth()) : (r = (_) => this._outputConfiguration.writeOut(_), o = this._outputConfiguration.getOutHasColors(), a = this._outputConfiguration.getOutHelpWidth()), { error: i, write: (_) => (o || (_ = this._outputConfiguration.stripColor(_)), r(_)), hasColors: o, helpWidth: a };
    }
    /**
     * Output help information for this command.
     *
     * Outputs built-in help, and custom text added using `.addHelpText()`.
     *
     * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
     */
    outputHelp(e) {
      let i;
      typeof e == "function" && (i = e, e = void 0);
      const r = this._getOutputContext(e), o = {
        error: r.error,
        write: r.write,
        command: this
      };
      this._getCommandAndAncestors().reverse().forEach((c) => c.emit("beforeAllHelp", o)), this.emit("beforeHelp", o);
      let a = this.helpInformation({ error: r.error });
      if (i && (a = i(a), typeof a != "string" && !Buffer.isBuffer(a)))
        throw new Error("outputHelp callback must return a string or a Buffer");
      r.write(a), this._getHelpOption()?.long && this.emit(this._getHelpOption().long), this.emit("afterHelp", o), this._getCommandAndAncestors().forEach(
        (c) => c.emit("afterAllHelp", o)
      );
    }
    /**
     * You can pass in flags and a description to customise the built-in help option.
     * Pass in false to disable the built-in help option.
     *
     * @example
     * program.helpOption('-?, --help' 'show help'); // customise
     * program.helpOption(false); // disable
     *
     * @param {(string | boolean)} flags
     * @param {string} [description]
     * @return {Command} `this` command for chaining
     */
    helpOption(e, i) {
      return typeof e == "boolean" ? (e ? (this._helpOption === null && (this._helpOption = void 0), this._defaultOptionGroup && this._initOptionGroup(this._getHelpOption())) : this._helpOption = null, this) : (this._helpOption = this.createOption(
        e ?? "-h, --help",
        i ?? "display help for command"
      ), (e || i) && this._initOptionGroup(this._helpOption), this);
    }
    /**
     * Lazy create help option.
     * Returns null if has been disabled with .helpOption(false).
     *
     * @returns {(Option | null)} the help option
     * @package
     */
    _getHelpOption() {
      return this._helpOption === void 0 && this.helpOption(void 0, void 0), this._helpOption;
    }
    /**
     * Supply your own option to use for the built-in help option.
     * This is an alternative to using helpOption() to customise the flags and description etc.
     *
     * @param {Option} option
     * @return {Command} `this` command for chaining
     */
    addHelpOption(e) {
      return this._helpOption = e, this._initOptionGroup(e), this;
    }
    /**
     * Output help information and exit.
     *
     * Outputs built-in help, and custom text added using `.addHelpText()`.
     *
     * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
     */
    help(e) {
      this.outputHelp(e);
      let i = Number(t.exitCode ?? 0);
      i === 0 && e && typeof e != "function" && e.error && (i = 1), this._exit(i, "commander.help", "(outputHelp)");
    }
    /**
     * // Do a little typing to coordinate emit and listener for the help text events.
     * @typedef HelpTextEventContext
     * @type {object}
     * @property {boolean} error
     * @property {Command} command
     * @property {function} write
     */
    /**
     * Add additional text to be displayed with the built-in help.
     *
     * Position is 'before' or 'after' to affect just this command,
     * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
     *
     * @param {string} position - before or after built-in help
     * @param {(string | Function)} text - string to add, or a function returning a string
     * @return {Command} `this` command for chaining
     */
    addHelpText(e, i) {
      const r = ["beforeAll", "before", "after", "afterAll"];
      if (!r.includes(e))
        throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${r.join("', '")}'`);
      const o = `${e}Help`;
      return this.on(o, (a) => {
        let c;
        typeof i == "function" ? c = i({ error: a.error, command: a.command }) : c = i, c && a.write(`${c}
`);
      }), this;
    }
    /**
     * Output help information if help flags specified
     *
     * @param {Array} args - array of options to search for help flags
     * @private
     */
    _outputHelpIfRequested(e) {
      const i = this._getHelpOption();
      i && e.find((o) => i.is(o)) && (this.outputHelp(), this._exit(0, "commander.helpDisplayed", "(outputHelp)"));
    }
  }
  function w(T) {
    return T.map((e) => {
      if (!e.startsWith("--inspect"))
        return e;
      let i, r = "127.0.0.1", o = "9229", a;
      return (a = e.match(/^(--inspect(-brk)?)$/)) !== null ? i = a[1] : (a = e.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null ? (i = a[1], /^\d+$/.test(a[3]) ? o = a[3] : r = a[3]) : (a = e.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null && (i = a[1], r = a[3], o = a[4]), i && o !== "0" ? `${i}=${r}:${parseInt(o) + 1}` : e;
    });
  }
  function $() {
    if (t.env.NO_COLOR || t.env.FORCE_COLOR === "0" || t.env.FORCE_COLOR === "false")
      return !1;
    if (t.env.FORCE_COLOR || t.env.CLICOLOR_FORCE !== void 0)
      return !0;
  }
  return N.Command = v, N.useColor = $, N;
}
var Y;
function fe() {
  if (Y) return S;
  Y = 1;
  const { Argument: p } = M(), { Command: u } = pe(), { CommanderError: h, InvalidArgumentError: m } = I(), { Help: t } = Q(), { Option: n } = X();
  return S.program = new u(), S.createCommand = (s) => new u(s), S.createOption = (s, l) => new n(s, l), S.createArgument = (s, l) => new p(s, l), S.Command = u, S.Option = n, S.Argument = p, S.Help = t, S.CommanderError = h, S.InvalidArgumentError = m, S.InvalidOptionArgumentError = m, S;
}
var ge = fe();
const _e = /* @__PURE__ */ de(ge), {
  program: Ne,
  createCommand: De,
  createArgument: We,
  createOption: Ge,
  CommanderError: Ie,
  InvalidArgumentError: qe,
  InvalidOptionArgumentError: Me,
  // deprecated old name
  Command: Oe,
  Argument: je,
  Option: Ce,
  Help: Le
} = _e;
class be extends oe {
  /**
   * Creates a new FeedSeeker instance
   * @param {string} site - The website URL to search for feeds (protocol optional, defaults to https://)
   * @param {object} [options={}] - Configuration options for the search
   * @param {number} [options.maxFeeds=0] - Maximum number of feeds to find (0 = no limit)
   * @param {number} [options.timeout=5] - Request timeout in seconds
   * @param {number} [options.depth=3] - Maximum crawling depth for deep search
   * @param {number} [options.maxLinks=1000] - Maximum links to process in deep search
   * @param {boolean} [options.all=false] - Whether to find all feeds or stop after finding one of each type
   * @param {boolean} [options.keepQueryParams=false] - Whether to preserve query parameters in URLs
   * @param {boolean} [options.checkForeignFeeds=false] - Whether to check feeds on foreign domains
   * @param {boolean} [options.showErrors=false] - Whether to emit error events
   * @throws {TypeError} When site parameter is not provided or invalid
   * @example
   * // Basic usage
   * const scout = new FeedSeeker('example.com');
   *
   * // With options
   * const scout = new FeedSeeker('https://blog.example.com', {
   *   maxFeeds: 5,
   *   timeout: 10,
   *   all: true
   * });
   */
  constructor(u, h = {}) {
    super(), u.includes("://") || (u = `https://${u}`);
    const m = new URL(u);
    this.site = m.pathname === "/" ? m.origin : m.href, this.options = h, this.initPromise = null;
  }
  /**
   * Initializes the FeedSeeker instance by fetching the site content and parsing the HTML
   * This method is called automatically by other methods and caches the result
   * @returns {Promise<void>} A promise that resolves when the initialization is complete
   * @throws {Error} When the site cannot be fetched or parsed
   * @private
   * @example
   * await scout.initialize(); // Usually called automatically
   */
  async initialize() {
    return this.initPromise === null && (this.initPromise = (async () => {
      try {
        const u = await ae(this.site, this.options.timeout * 1e3);
        if (!u.ok) {
          this.emit("error", {
            module: "FeedSeeker",
            error: `HTTP error while fetching ${this.site}: ${u.status} ${u.statusText}`
          }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
          return;
        }
        this.content = await u.text();
        const { document: h } = re(this.content);
        this.document = h, this.emit("initialized");
      } catch (u) {
        let h = `Failed to fetch ${this.site}`;
        u.name === "AbortError" ? h += ": Request timed out" : (h += `: ${u.message}`, u.cause && (h += ` (cause: ${u.cause.code || u.cause.message})`)), this.emit("error", {
          module: "FeedSeeker",
          error: h,
          cause: u.cause
        }), this.content = "", this.document = { querySelectorAll: () => [] }, this.emit("initialized");
      }
    })()), this.initPromise;
  }
  // initialize
  /**
   * Searches for feeds using meta links in the page (link tags in head)
   * This method looks for <link> elements with feed-related type attributes
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When initialization fails or network errors occur
   * @example
   * const feeds = await scout.metaLinks();
   * console.log(feeds); // [{ url: '...', title: '...', type: 'rss' }]
   */
  async metaLinks() {
    return await this.initialize(), le(this);
  }
  /**
   * Searches for feeds by checking all anchor links on the page
   * This method analyzes all <a> elements for potential feed URLs
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When initialization fails or network errors occur
   * @example
   * const feeds = await scout.checkAllAnchors();
   * console.log(feeds); // [{ url: '...', title: '...', type: 'atom' }]
   */
  async checkAllAnchors() {
    return await this.initialize(), ue(this);
  }
  /**
   * Performs a blind search for common feed endpoints
   * This method tries common feed paths like /feed, /rss, /atom.xml, etc.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When network errors occur during endpoint testing
   * @example
   * const feeds = await scout.blindSearch();
   * console.log(feeds); // [{ url: '...', feedType: 'rss', title: '...' }]
   */
  async blindSearch() {
    return await this.initialize(), he(this);
  }
  /**
   * Performs a deep search by crawling the website
   * This method recursively crawls pages to find feeds, respecting depth and link limits
   * @returns {Promise<Array<object>>} A promise that resolves to an array of found feed objects
   * @throws {Error} When network errors occur during crawling
   * @example
   * const feeds = await scout.deepSearch();
   * console.log(feeds); // [{ url: '...', type: 'json', title: '...' }]
   */
  async deepSearch() {
    return await this.initialize(), ce(this.site, this.options, this);
  }
  async startSearch() {
    const { deepsearchOnly: u, metasearch: h, blindsearch: m, anchorsonly: t, deepsearch: n, all: s, maxFeeds: l } = this.options;
    if (u)
      return this.deepSearch();
    if (h)
      return this.metaLinks();
    if (m)
      return this.blindSearch();
    if (t)
      return this.checkAllAnchors();
    let d = [];
    const g = [this.metaLinks, this.checkAllAnchors, this.blindSearch];
    for (const C of g) {
      const y = await C.call(this);
      if (y && y.length > 0 && (d = d.concat(y), !s && l > 0 && d.length >= l)) {
        d = d.slice(0, l);
        break;
      }
    }
    if (n && (!l || d.length < l)) {
      const C = await this.deepSearch();
      C && C.length > 0 && (d = d.concat(C), l > 0 && d.length > l && (d = d.slice(0, l)));
    }
    return this.emit("end", { module: "all", feeds: d }), d;
  }
}
const Ae = `___________               .____________              __                 
_   _____/___   ____   __| _/   _____/ ____   ____ |  | __ ___________ 
 |    __)/ __ _/ __  / __ |_____  _/ __ _/ __ |  |/ // __ _  __  |     \\  ___/  ___// /_/ |/          ___/  ___/|    <  ___/|  | /
 ___  / ___  >___  >____ /_______  /___  >___  >__|_ \\___  >__|   
     /      /     /     /       /     /     /     /    /       `;
let G = 0, V = [], j = !1;
function ye(...p) {
  const u = p[0];
  G = 0, process.stdout.write(`Starting ${u.niceName} `);
}
function we(...p) {
  const u = p[0];
  j ? u.feeds.length === 0 ? process.stdout.write(k("yellow", ` No feeds found.
`)) : (process.stdout.write(k("green", ` Found ${u.feeds.length} feeds.
`)), console.log(JSON.stringify(u.feeds, null, 2)), V = V.concat(u.feeds)) : u.feeds.length === 0 ? process.stdout.write(k("yellow", ` No feeds found.
`)) : process.stdout.write(k("green", ` Found ${u.feeds.length} feeds.
`));
}
async function Ee(...p) {
  const u = p[0];
  if (u.module === "metalinks" && process.stdout.write("."), (u.module === "blindsearch" || u.module === "anchors") && "totalCount" in u && "totalEndpoints" in u) {
    G > 0 && process.stdout.write(`\x1B[${G}D`);
    const h = ` (${u.totalCount}/${u.totalEndpoints})`;
    process.stdout.write(h), G = h.length;
  }
  if (u.module === "deepSearch" && "url" in u && "depth" in u && "progress" in u) {
    const h = u.progress, m = h.processed || 0, t = h.remaining || 0, n = m + t;
    try {
      const s = new URL(u.url), l = s.hostname, d = s.pathname.length > 30 ? s.pathname.substring(0, 27) + "..." : s.pathname, g = `${l}${d}`;
      process.stdout.write(`  [depth:${u.depth} ${m}/${n}] ${g}
`);
    } catch {
      process.stdout.write(`  [depth:${u.depth} ${m}/${n}]
`);
    }
  }
}
function $e(p, u) {
  const h = new be(p, u);
  return h.site = p, h.options = u, h.initializationError = !1, h.on("start", ye), h.on("log", Ee), h.on("end", we), h.on("error", (...m) => {
    const t = m[0];
    if (typeof t == "object" && t !== null && t.module === "FeedSeeker" && (h.initializationError = !0), t instanceof Error)
      console.error(k("red", `
Error for ${p}: ${t.message}`));
    else if (typeof t == "object" && t !== null) {
      const n = t, s = typeof n.error == "string" ? n.error : String(t);
      console.error(k("red", `
Error for ${p}: ${s}`));
    } else
      console.error(k("red", `
Error for ${p}: ${String(t)}`));
  }), h;
}
async function xe(p, u) {
  p.includes("://") || (p = `https://${p}`);
  const h = $e(p, u);
  if (await h.initialize(), h.initializationError)
    return [];
  const m = [];
  return u.metasearch ? m.push(() => h.metaLinks()) : u.anchorsonly ? m.push(() => h.checkAllAnchors()) : u.blindsearch ? m.push(() => h.blindSearch()) : u.deepsearchOnly ? m.push(() => h.deepSearch()) : u.all ? m.push(
    () => h.metaLinks(),
    () => h.checkAllAnchors(),
    () => h.blindSearch(),
    () => h.deepSearch()
  ) : m.push(
    () => h.metaLinks(),
    () => h.checkAllAnchors(),
    () => h.blindSearch(),
    ...u.deepsearch ? [() => h.deepSearch()] : []
  ), await (async () => {
    if (u.all) {
      const s = [];
      for (const l of m) {
        const d = await l();
        d.length > 0 && s.push(...d);
      }
      return s;
    } else {
      for (const s of m) {
        const l = await s();
        if (l.length > 0) return l;
      }
      return [];
    }
  })();
}
console.log(`${Ae}
`);
const H = new Oe();
H.name("feed-seeker").description("Find RSS, Atom, and JSON feeds on any website with FeedSeeker.");
H.command("version").description("Get version").action(async () => {
  const u = (await import("./package-D10V07Q-.js")).default;
  process.stdout.write(`${u.version}
`);
});
H.argument("[site]", "The website URL to search for feeds").option("-m, --metasearch", "Meta search only").option("-b, --blindsearch", "Blind search only").option("-a, --anchorsonly", "Anchors search only").option("-d, --deepsearch", "Enable deep search").option("--all", "Execute all strategies and combine results").option("--deepsearch-only", "Deep search only").option(
  "--depth <number>",
  "Depth of deep search",
  (p) => {
    const u = parseInt(p, 10);
    if (Number.isNaN(u) || u < 1)
      throw new Error("Depth must be a positive number (minimum 1)");
    return u;
  },
  3
).option(
  "--max-links <number>",
  "Maximum number of links to process during deep search",
  (p) => {
    const u = parseInt(p, 10);
    if (Number.isNaN(u) || u < 1)
      throw new Error("Max links must be a positive number (minimum 1)");
    return u;
  },
  1e3
).option(
  "--timeout <seconds>",
  "Timeout for fetch requests in seconds",
  (p) => {
    const u = parseInt(p, 10);
    if (Number.isNaN(u) || u < 1)
      throw new Error("Timeout must be a positive number (minimum 1 second)");
    return u;
  },
  5
).option("--keep-query-params", "Keep query parameters from the original URL when searching").option("--check-foreign-feeds", "Check if foreign domain URLs are feeds (but don't crawl them)").option(
  "--max-errors <number>",
  "Stop after a certain number of errors",
  (p) => {
    const u = parseInt(p, 10);
    if (Number.isNaN(u) || u < 0)
      throw new Error("Max errors must be a non-negative number");
    return u;
  },
  5
).option(
  "--max-feeds <number>",
  "Stop search after finding a certain number of feeds",
  (p) => {
    const u = parseInt(p, 10);
    if (Number.isNaN(u) || u < 0)
      throw new Error("Max feeds must be a non-negative number");
    return u;
  },
  0
).option(
  "--search-mode <mode>",
  "Search mode for blind search: fast (~25), standard (~100), or full (~350+)",
  "standard"
).description(`Find feeds for site
`).action(async (p, u) => {
  p || (H.help(), process.exit(0));
  try {
    u.all && (j = !0, V = []), H.feeds = await xe(p, u);
  } catch (h) {
    u.displayErrors ? console.error(`
Error details:`, h) : console.error(k("red", `
Error: ${h.message}`)), process.exit(1);
  }
});
H.addOption(new Ce("--display-errors", "Display errors").hideHelp());
H.parseAsync(process.argv).then(() => {
  H.feeds !== void 0 && (j && V.length > 0 ? (console.log(k("yellow", `
=== All Strategies Complete ===`)), console.log(
    k("green", `Total: ${V.length} ${V.length === 1 ? "feed" : "feeds"} found from all strategies
`)
  ), console.log(JSON.stringify(V, null, 2))) : H.feeds.length > 0 && console.log(JSON.stringify(H.feeds, null, 2)));
}).catch((p) => {
  console.error(k("red", `
Error: ${p.message}`)), process.exit(1);
});
