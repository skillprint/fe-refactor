var Telegram = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to2, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to2, key) && key !== except)
          __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to2;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/telegram.ts
  var telegram_exports = {};
  __export(telegram_exports, {
    Telegram: () => Telegram
  });

  // node_modules/@tma.js/signals/dist/index.js
  var r;
  function y(e, c3) {
    r ? r.set(e, c3) : c3();
  }
  function m(e) {
    if (r)
      return e();
    r = /* @__PURE__ */ new Map();
    try {
      e();
    } finally {
      r.forEach((c3) => c3()), r = void 0;
    }
  }
  // @__NO_SIDE_EFFECTS__
  function S(e, c3) {
    c3 || (c3 = {});
    const g3 = c3.equals || Object.is;
    let u2 = [], s = e;
    const i = (t2) => {
      if (!g3(s, t2)) {
        const l3 = s;
        s = t2, y(o2, () => {
          [...u2].forEach(([f3, d4]) => {
            f3(t2, l3), d4 && n(f3, true);
          });
        });
      }
    };
    function a(t2) {
      const l3 = typeof t2 != "object" ? { once: t2 } : t2;
      return {
        once: l3.once || false,
        signal: l3.signal || false
      };
    }
    const n = (t2, l3) => {
      const f3 = a(l3), d4 = u2.findIndex(([h5, p2]) => h5 === t2 && p2.once === f3.once && p2.signal === f3.signal);
      d4 >= 0 && u2.splice(d4, 1);
    }, o2 = Object.assign(
      function() {
        return j(o2), s;
      },
      {
        destroy() {
          u2 = [];
        },
        set: i,
        reset() {
          i(e);
        },
        sub(t2, l3) {
          return u2.push([t2, a(l3)]), () => n(t2, l3);
        },
        unsub: n,
        unsubAll() {
          u2 = u2.filter((t2) => t2[1].signal);
        }
      }
    );
    return o2;
  }
  var b = [];
  function j(e) {
    b.length && b[b.length - 1].add(e);
  }
  // @__NO_SIDE_EFFECTS__
  function x(e, c3) {
    let g3 = /* @__PURE__ */ new Set(), u2;
    function s() {
      return u2 || (u2 = /* @__PURE__ */ S(a(), c3));
    }
    function i() {
      s().set(a());
    }
    function a() {
      g3.forEach((t2) => {
        t2.unsub(i, { signal: true });
      });
      const n = /* @__PURE__ */ new Set();
      let o2;
      b.push(n);
      try {
        o2 = e();
      } finally {
        b.pop();
      }
      return n.forEach((t2) => {
        t2.sub(i, { signal: true });
      }), g3 = n, o2;
    }
    return Object.assign(function() {
      return s()();
    }, {
      destroy() {
        s().destroy();
      },
      sub(...n) {
        return s().sub(...n);
      },
      unsub(...n) {
        s().unsub(...n);
      },
      unsubAll(...n) {
        s().unsubAll(...n);
      }
    });
  }

  // node_modules/valibot/dist/index.js
  var store;
  // @__NO_SIDE_EFFECTS__
  function getGlobalConfig(config2) {
    return {
      lang: config2?.lang ?? store?.lang,
      message: config2?.message,
      abortEarly: config2?.abortEarly ?? store?.abortEarly,
      abortPipeEarly: config2?.abortPipeEarly ?? store?.abortPipeEarly
    };
  }
  var store2;
  // @__NO_SIDE_EFFECTS__
  function getGlobalMessage(lang) {
    return store2?.get(lang);
  }
  var store3;
  // @__NO_SIDE_EFFECTS__
  function getSchemaMessage(lang) {
    return store3?.get(lang);
  }
  var store4;
  // @__NO_SIDE_EFFECTS__
  function getSpecificMessage(reference, lang) {
    return store4?.get(reference)?.get(lang);
  }
  // @__NO_SIDE_EFFECTS__
  function _stringify(input) {
    const type = typeof input;
    if (type === "string") {
      return `"${input}"`;
    }
    if (type === "number" || type === "bigint" || type === "boolean") {
      return `${input}`;
    }
    if (type === "object" || type === "function") {
      return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
    }
    return type;
  }
  function _addIssue(context, label, dataset, config2, other) {
    const input = other && "input" in other ? other.input : dataset.value;
    const expected = other?.expected ?? context.expects ?? null;
    const received = other?.received ?? /* @__PURE__ */ _stringify(input);
    const issue = {
      kind: context.kind,
      type: context.type,
      input,
      expected,
      received,
      message: `Invalid ${label}: ${expected ? `Expected ${expected} but r` : "R"}eceived ${received}`,
      requirement: context.requirement,
      path: other?.path,
      issues: other?.issues,
      lang: config2.lang,
      abortEarly: config2.abortEarly,
      abortPipeEarly: config2.abortPipeEarly
    };
    const isSchema = context.kind === "schema";
    const message2 = other?.message ?? context.message ?? /* @__PURE__ */ getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? /* @__PURE__ */ getSchemaMessage(issue.lang) : null) ?? config2.message ?? /* @__PURE__ */ getGlobalMessage(issue.lang);
    if (message2 !== void 0) {
      issue.message = typeof message2 === "function" ? (
        // @ts-expect-error
        message2(issue)
      ) : message2;
    }
    if (isSchema) {
      dataset.typed = false;
    }
    if (dataset.issues) {
      dataset.issues.push(issue);
    } else {
      dataset.issues = [issue];
    }
  }
  // @__NO_SIDE_EFFECTS__
  function _getStandardProps(context) {
    return {
      version: 1,
      vendor: "valibot",
      validate(value2) {
        return context["~run"]({ value: value2 }, /* @__PURE__ */ getGlobalConfig());
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function _isValidObjectKey(object2, key) {
    return Object.hasOwn(object2, key) && key !== "__proto__" && key !== "prototype" && key !== "constructor";
  }
  // @__NO_SIDE_EFFECTS__
  function _joinExpects(values2, separator) {
    const list = [...new Set(values2)];
    if (list.length > 1) {
      return `(${list.join(` ${separator} `)})`;
    }
    return list[0] ?? "never";
  }
  var ValiError = class extends Error {
    /**
     * Creates a Valibot error with useful information.
     *
     * @param issues The error issues.
     */
    constructor(issues) {
      super(issues[0].message);
      this.name = "ValiError";
      this.issues = issues;
    }
  };
  // @__NO_SIDE_EFFECTS__
  function check(requirement, message2) {
    return {
      kind: "validation",
      type: "check",
      reference: check,
      async: false,
      expects: null,
      requirement,
      message: message2,
      "~run"(dataset, config2) {
        if (dataset.typed && !this.requirement(dataset.value)) {
          _addIssue(this, "input", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function integer(message2) {
    return {
      kind: "validation",
      type: "integer",
      reference: integer,
      async: false,
      expects: null,
      requirement: Number.isInteger,
      message: message2,
      "~run"(dataset, config2) {
        if (dataset.typed && !this.requirement(dataset.value)) {
          _addIssue(this, "integer", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function transform(operation) {
    return {
      kind: "transformation",
      type: "transform",
      reference: transform,
      async: false,
      operation,
      "~run"(dataset) {
        dataset.value = this.operation(dataset.value);
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function getFallback(schema, dataset, config2) {
    return typeof schema.fallback === "function" ? (
      // @ts-expect-error
      schema.fallback(dataset, config2)
    ) : (
      // @ts-expect-error
      schema.fallback
    );
  }
  // @__NO_SIDE_EFFECTS__
  function getDefault(schema, dataset, config2) {
    return typeof schema.default === "function" ? (
      // @ts-expect-error
      schema.default(dataset, config2)
    ) : (
      // @ts-expect-error
      schema.default
    );
  }
  // @__NO_SIDE_EFFECTS__
  function is(schema, input) {
    return !schema["~run"]({ value: input }, { abortEarly: true }).issues;
  }
  // @__NO_SIDE_EFFECTS__
  function array(item, message2) {
    return {
      kind: "schema",
      type: "array",
      reference: array,
      expects: "Array",
      async: false,
      item,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        const input = dataset.value;
        if (Array.isArray(input)) {
          dataset.typed = true;
          dataset.value = [];
          for (let key = 0; key < input.length; key++) {
            const value2 = input[key];
            const itemDataset = this.item["~run"]({ value: value2 }, config2);
            if (itemDataset.issues) {
              const pathItem = {
                type: "array",
                origin: "value",
                input,
                key,
                value: value2
              };
              for (const issue of itemDataset.issues) {
                if (issue.path) {
                  issue.path.unshift(pathItem);
                } else {
                  issue.path = [pathItem];
                }
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) {
                dataset.issues = itemDataset.issues;
              }
              if (config2.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!itemDataset.typed) {
              dataset.typed = false;
            }
            dataset.value.push(itemDataset.value);
          }
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function boolean(message2) {
    return {
      kind: "schema",
      type: "boolean",
      reference: boolean,
      expects: "boolean",
      async: false,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (typeof dataset.value === "boolean") {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function date(message2) {
    return {
      kind: "schema",
      type: "date",
      reference: date,
      expects: "Date",
      async: false,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (dataset.value instanceof Date) {
          if (!isNaN(dataset.value)) {
            dataset.typed = true;
          } else {
            _addIssue(this, "type", dataset, config2, {
              received: '"Invalid Date"'
            });
          }
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function function_(message2) {
    return {
      kind: "schema",
      type: "function",
      reference: function_,
      expects: "Function",
      async: false,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (typeof dataset.value === "function") {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function instance(class_, message2) {
    return {
      kind: "schema",
      type: "instance",
      reference: instance,
      expects: class_.name,
      async: false,
      class: class_,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (dataset.value instanceof this.class) {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function looseObject(entries2, message2) {
    return {
      kind: "schema",
      type: "loose_object",
      reference: looseObject,
      expects: "Object",
      async: false,
      entries: entries2,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        const input = dataset.value;
        if (input && typeof input === "object") {
          dataset.typed = true;
          dataset.value = {};
          for (const key in this.entries) {
            const valueSchema = this.entries[key];
            if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && // @ts-expect-error
            valueSchema.default !== void 0) {
              const value2 = key in input ? (
                // @ts-expect-error
                input[key]
              ) : /* @__PURE__ */ getDefault(valueSchema);
              const valueDataset = valueSchema["~run"]({ value: value2 }, config2);
              if (valueDataset.issues) {
                const pathItem = {
                  type: "object",
                  origin: "value",
                  input,
                  key,
                  value: value2
                };
                for (const issue of valueDataset.issues) {
                  if (issue.path) {
                    issue.path.unshift(pathItem);
                  } else {
                    issue.path = [pathItem];
                  }
                  dataset.issues?.push(issue);
                }
                if (!dataset.issues) {
                  dataset.issues = valueDataset.issues;
                }
                if (config2.abortEarly) {
                  dataset.typed = false;
                  break;
                }
              }
              if (!valueDataset.typed) {
                dataset.typed = false;
              }
              dataset.value[key] = valueDataset.value;
            } else if (valueSchema.fallback !== void 0) {
              dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
            } else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
              _addIssue(this, "key", dataset, config2, {
                input: void 0,
                expected: `"${key}"`,
                path: [
                  {
                    type: "object",
                    origin: "key",
                    input,
                    key,
                    // @ts-expect-error
                    value: input[key]
                  }
                ]
              });
              if (config2.abortEarly) {
                break;
              }
            }
          }
          if (!dataset.issues || !config2.abortEarly) {
            for (const key in input) {
              if (/* @__PURE__ */ _isValidObjectKey(input, key) && !(key in this.entries)) {
                dataset.value[key] = input[key];
              }
            }
          }
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function nullish(wrapped, default_) {
    return {
      kind: "schema",
      type: "nullish",
      reference: nullish,
      expects: `(${wrapped.expects} | null | undefined)`,
      async: false,
      wrapped,
      default: default_,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (dataset.value === null || dataset.value === void 0) {
          if (this.default !== void 0) {
            dataset.value = /* @__PURE__ */ getDefault(this, dataset, config2);
          }
          if (dataset.value === null || dataset.value === void 0) {
            dataset.typed = true;
            return dataset;
          }
        }
        return this.wrapped["~run"](dataset, config2);
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function number(message2) {
    return {
      kind: "schema",
      type: "number",
      reference: number,
      expects: "number",
      async: false,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (typeof dataset.value === "number" && !isNaN(dataset.value)) {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function optional(wrapped, default_) {
    return {
      kind: "schema",
      type: "optional",
      reference: optional,
      expects: `(${wrapped.expects} | undefined)`,
      async: false,
      wrapped,
      default: default_,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (dataset.value === void 0) {
          if (this.default !== void 0) {
            dataset.value = /* @__PURE__ */ getDefault(this, dataset, config2);
          }
          if (dataset.value === void 0) {
            dataset.typed = true;
            return dataset;
          }
        }
        return this.wrapped["~run"](dataset, config2);
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function record(key, value2, message2) {
    return {
      kind: "schema",
      type: "record",
      reference: record,
      expects: "Object",
      async: false,
      key,
      value: value2,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        const input = dataset.value;
        if (input && typeof input === "object") {
          dataset.typed = true;
          dataset.value = {};
          for (const entryKey in input) {
            if (/* @__PURE__ */ _isValidObjectKey(input, entryKey)) {
              const entryValue = input[entryKey];
              const keyDataset = this.key["~run"]({ value: entryKey }, config2);
              if (keyDataset.issues) {
                const pathItem = {
                  type: "object",
                  origin: "key",
                  input,
                  key: entryKey,
                  value: entryValue
                };
                for (const issue of keyDataset.issues) {
                  issue.path = [pathItem];
                  dataset.issues?.push(issue);
                }
                if (!dataset.issues) {
                  dataset.issues = keyDataset.issues;
                }
                if (config2.abortEarly) {
                  dataset.typed = false;
                  break;
                }
              }
              const valueDataset = this.value["~run"](
                { value: entryValue },
                config2
              );
              if (valueDataset.issues) {
                const pathItem = {
                  type: "object",
                  origin: "value",
                  input,
                  key: entryKey,
                  value: entryValue
                };
                for (const issue of valueDataset.issues) {
                  if (issue.path) {
                    issue.path.unshift(pathItem);
                  } else {
                    issue.path = [pathItem];
                  }
                  dataset.issues?.push(issue);
                }
                if (!dataset.issues) {
                  dataset.issues = valueDataset.issues;
                }
                if (config2.abortEarly) {
                  dataset.typed = false;
                  break;
                }
              }
              if (!keyDataset.typed || !valueDataset.typed) {
                dataset.typed = false;
              }
              if (keyDataset.typed) {
                dataset.value[keyDataset.value] = valueDataset.value;
              }
            }
          }
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function string(message2) {
    return {
      kind: "schema",
      type: "string",
      reference: string,
      expects: "string",
      async: false,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        if (typeof dataset.value === "string") {
          dataset.typed = true;
        } else {
          _addIssue(this, "type", dataset, config2);
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function _subIssues(datasets) {
    let issues;
    if (datasets) {
      for (const dataset of datasets) {
        if (issues) {
          issues.push(...dataset.issues);
        } else {
          issues = dataset.issues;
        }
      }
    }
    return issues;
  }
  // @__NO_SIDE_EFFECTS__
  function union(options, message2) {
    return {
      kind: "schema",
      type: "union",
      reference: union,
      expects: /* @__PURE__ */ _joinExpects(
        options.map((option) => option.expects),
        "|"
      ),
      async: false,
      options,
      message: message2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        let validDataset;
        let typedDatasets;
        let untypedDatasets;
        for (const schema of this.options) {
          const optionDataset = schema["~run"]({ value: dataset.value }, config2);
          if (optionDataset.typed) {
            if (optionDataset.issues) {
              if (typedDatasets) {
                typedDatasets.push(optionDataset);
              } else {
                typedDatasets = [optionDataset];
              }
            } else {
              validDataset = optionDataset;
              break;
            }
          } else {
            if (untypedDatasets) {
              untypedDatasets.push(optionDataset);
            } else {
              untypedDatasets = [optionDataset];
            }
          }
        }
        if (validDataset) {
          return validDataset;
        }
        if (typedDatasets) {
          if (typedDatasets.length === 1) {
            return typedDatasets[0];
          }
          _addIssue(this, "type", dataset, config2, {
            issues: /* @__PURE__ */ _subIssues(typedDatasets)
          });
          dataset.typed = true;
        } else if (untypedDatasets?.length === 1) {
          return untypedDatasets[0];
        } else {
          _addIssue(this, "type", dataset, config2, {
            issues: /* @__PURE__ */ _subIssues(untypedDatasets)
          });
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function unknown() {
    return {
      kind: "schema",
      type: "unknown",
      reference: unknown,
      expects: "unknown",
      async: false,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset) {
        dataset.typed = true;
        return dataset;
      }
    };
  }
  function parse(schema, input, config2) {
    const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config2));
    if (dataset.issues) {
      throw new ValiError(dataset.issues);
    }
    return dataset.value;
  }
  // @__NO_SIDE_EFFECTS__
  function pipe(...pipe2) {
    return {
      ...pipe2[0],
      pipe: pipe2,
      get "~standard"() {
        return /* @__PURE__ */ _getStandardProps(this);
      },
      "~run"(dataset, config2) {
        for (const item of pipe2) {
          if (item.kind !== "metadata") {
            if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
              dataset.typed = false;
              break;
            }
            if (!dataset.issues || !config2.abortEarly && !config2.abortPipeEarly) {
              dataset = item["~run"](dataset, config2);
            }
          }
        }
        return dataset;
      }
    };
  }
  // @__NO_SIDE_EFFECTS__
  function safeParse(schema, input, config2) {
    const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config2));
    return {
      typed: dataset.typed,
      success: !dataset.issues,
      output: dataset.value,
      issues: dataset.issues
    };
  }

  // node_modules/better-promises/dist/index.js
  var $ = Object.defineProperty;
  var q = (r2, e, t2) => e in r2 ? $(r2, e, { enumerable: true, configurable: true, writable: true, value: t2 }) : r2[e] = t2;
  var w = (r2, e, t2) => q(r2, typeof e != "symbol" ? e + "" : e, t2);
  var D = Object.defineProperty;
  var G = (r2, e, t2) => e in r2 ? D(r2, e, { enumerable: true, configurable: true, writable: true, value: t2 }) : r2[e] = t2;
  var E = (r2, e, t2) => G(r2, typeof e != "symbol" ? e + "" : e, t2);
  function I(r2) {
    return (e) => e instanceof r2;
  }
  function L(r2, e) {
    const t2 = class extends Error {
      constructor(...d4) {
        const l3 = typeof e == "function" ? e(...d4) : typeof e == "string" ? [e] : e || [];
        super(...l3), this.name = r2;
      }
    };
    E(t2, "is", I(t2));
    let c3 = t2;
    return Object.defineProperty(c3, "name", { value: r2 }), c3;
  }
  function H(r2, e, t2) {
    const c3 = class extends L(r2, t2) {
      constructor(...l3) {
        super(...l3), E(this, "data"), this.data = e(...l3);
      }
    };
    E(c3, "is", I(c3));
    let o2 = c3;
    return Object.defineProperty(o2, "name", { value: r2 }), o2;
  }
  var J = class extends L("CancelledError", "Promise was canceled") {
  };
  var K = class extends H(
    "TimeoutError",
    (e) => ({ timeout: e }),
    (e, t2) => [`Timeout reached: ${e}ms`, { cause: t2 }]
  ) {
  };
  var S2 = /* @__PURE__ */ Symbol("resolved");
  function M(r2) {
    return { tag: S2, value: r2 };
  }
  function C(r2, e) {
    return r2.reject = e.reject, r2.resolve = e.resolve, r2;
  }
  var g = class _g extends Promise {
    constructor(t2, c3) {
      let o2, d4, l3, p2;
      typeof t2 == "function" ? (l3 = t2, p2 = c3 || {}) : p2 = t2 || {};
      let u2, a;
      const x4 = () => !!a, O3 = () => !!u2;
      let f3 = {};
      const b4 = [], T4 = () => {
        b4.forEach((m4) => m4()), b4.splice(0, b4.length), f3 = {};
      }, y5 = new AbortController(), k4 = () => O3() || x4();
      super((m4, F3) => {
        const { abortOnResolve: P4 = true, abortOnReject: A4 = true } = p2;
        d4 = (n) => {
          var h5, s;
          k4() || (m4(n), u2 = [n], (h5 = f3.resolved) == null || h5.forEach((i) => i(n)), (s = f3.finalized) == null || s.forEach((i) => i({ kind: "resolved", result: n })), T4(), P4 && y5.abort(M(n)));
        }, o2 = (n) => {
          var h5, s;
          k4() || (F3(n), a = [n], (h5 = f3.rejected) == null || h5.forEach((i) => i(n)), (s = f3.finalized) == null || s.forEach((i) => i({ kind: "rejected", reason: n })), T4(), A4 && y5.abort(n));
        };
        const { abortSignal: j3 } = p2;
        if (j3) {
          if (j3.aborted)
            return o2(j3.reason);
          const n = () => {
            o2(j3.reason);
          };
          j3.addEventListener("abort", n, true), b4.push(() => {
            j3.removeEventListener("abort", n, true);
          });
        }
        const { timeout: R3 } = p2;
        if (R3) {
          const n = setTimeout(() => {
            o2(new K(R3));
          }, R3);
          b4.push(() => {
            clearTimeout(n);
          });
        }
        try {
          const n = () => {
          }, h5 = l3 && l3(d4, o2, {
            abortSignal: y5.signal,
            get isRejected() {
              return x4();
            },
            get isResolved() {
              return O3();
            },
            on(s, i) {
              if (u2 || a) {
                if (s === "finalized") {
                  const v2 = u2 ? { kind: "resolved", result: u2[0] } : { kind: "rejected", reason: a[0] };
                  i(v2);
                } else s === "resolved" && u2 ? i(u2[0]) : s === "rejected" && a && i(a[0]);
                return n;
              }
              return f3[s] || (f3[s] = []), f3[s].push(i), () => {
                const v2 = f3[s] || [], z3 = v2.indexOf(i);
                z3 >= 0 && v2.splice(z3, 1);
              };
            },
            get result() {
              return u2 == null ? void 0 : u2[0];
            },
            get rejectReason() {
              return a == null ? void 0 : a[0];
            },
            throwIfRejected() {
              if (a)
                throw a[0];
            }
          });
          h5 instanceof Promise && h5.catch(o2);
        } catch (n) {
          o2(n);
        }
      });
      w(this, "reject");
      w(this, "resolve");
      this.reject = o2, this.resolve = d4;
    }
    static fn(t2, c3) {
      return new _g(async (o2, d4, l3) => {
        try {
          o2(await t2(l3));
        } catch (p2) {
          d4(p2);
        }
      }, c3);
    }
    static resolve(t2) {
      return this.fn(() => t2);
    }
    /**
     * @see Promise.reject
     */
    static reject(t2) {
      return new _g((c3, o2) => {
        o2(t2);
      });
    }
    /**
     * Rejects the promise with the `CancelledError` error.
     */
    cancel() {
      this.reject(new J());
    }
    /**
     * @see Promise.catch
     */
    catch(t2) {
      return this.then(void 0, t2);
    }
    /**
     * @see Promise.finally
     */
    finally(t2) {
      return C(super.finally(t2), this);
    }
    /**
     * @see Promise.then
     */
    then(t2, c3) {
      return C(
        super.then(t2, c3),
        this
      );
    }
  };

  // node_modules/@tma.js/toolkit/dist/index.js
  function ar(r2) {
    return r2.replace(/[A-Z]/g, (n) => `-${n.toLowerCase()}`);
  }
  function cr(r2) {
    return r2.replace(/_([a-z])/g, (n, t2) => `-${t2.toLowerCase()}`);
  }
  function m2(r2) {
    return `tapps/${r2}`;
  }
  function sr(r2, n) {
    sessionStorage.setItem(m2(r2), JSON.stringify(n));
  }
  function fr(r2) {
    const n = sessionStorage.getItem(m2(r2));
    try {
      return n ? JSON.parse(n) : void 0;
    } catch {
    }
  }
  function lr(...r2) {
    const n = r2.flat(1);
    return [
      n.push.bind(n),
      () => {
        n.forEach((t2) => {
          t2();
        });
      }
    ];
  }
  // @__NO_SIDE_EFFECTS__
  function hr(r2, n) {
    n || (n = {});
    const {
      textColor: t2,
      bgColor: e,
      shouldLog: a
    } = n, u2 = a === void 0 ? true : a, i = typeof u2 == "boolean" ? () => u2 : u2, s = (f3, o2, ...c3) => {
      if (o2 || i()) {
        const l3 = "font-weight:bold;padding:0 5px;border-radius:100px", [x4, O3, j3] = {
          log: ["#0089c3", "white", "INFO"],
          error: ["#ff0000F0", "white", "ERR"],
          warn: ["#D38E15", "white", "WARN"]
        }[f3];
        console[f3](
          `%c${j3} ${Intl.DateTimeFormat("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
            timeZone: "UTC"
          }).format(/* @__PURE__ */ new Date())}%c %c${r2}`,
          `${l3};background-color:${x4};color:${O3}`,
          "",
          `${l3};${t2 ? `color:${t2};` : ""}${e ? `background-color:${e}` : ""}`,
          ...c3
        );
      }
    };
    return [
      ["log", "forceLog"],
      ["warn", "forceWarn"],
      ["error", "forceError"]
    ].reduce((f3, [o2, c3]) => (f3[o2] = s.bind(void 0, o2, false), f3[c3] = s.bind(void 0, o2, true), f3), {});
  }
  var P = function(r2, n, t2) {
    if (t2 || arguments.length === 2) for (var e = 0, a = n.length, u2; e < a; e++)
      (u2 || !(e in n)) && (u2 || (u2 = Array.prototype.slice.call(n, 0, e)), u2[e] = n[e]);
    return r2.concat(u2 || Array.prototype.slice.call(n));
  };
  function d(r2, n, t2, e, a, u2, i, s, f3) {
    switch (arguments.length) {
      case 1:
        return r2;
      case 2:
        return function() {
          return n(r2.apply(this, arguments));
        };
      case 3:
        return function() {
          return t2(n(r2.apply(this, arguments)));
        };
      case 4:
        return function() {
          return e(t2(n(r2.apply(this, arguments))));
        };
      case 5:
        return function() {
          return a(e(t2(n(r2.apply(this, arguments)))));
        };
      case 6:
        return function() {
          return u2(a(e(t2(n(r2.apply(this, arguments))))));
        };
      case 7:
        return function() {
          return i(u2(a(e(t2(n(r2.apply(this, arguments)))))));
        };
      case 8:
        return function() {
          return s(i(u2(a(e(t2(n(r2.apply(this, arguments))))))));
        };
      case 9:
        return function() {
          return f3(s(i(u2(a(e(t2(n(r2.apply(this, arguments)))))))));
        };
    }
  }
  function h(r2, n, t2, e, a, u2, i, s, f3) {
    switch (arguments.length) {
      case 1:
        return r2;
      case 2:
        return n(r2);
      case 3:
        return t2(n(r2));
      case 4:
        return e(t2(n(r2)));
      case 5:
        return a(e(t2(n(r2))));
      case 6:
        return u2(a(e(t2(n(r2)))));
      case 7:
        return i(u2(a(e(t2(n(r2))))));
      case 8:
        return s(i(u2(a(e(t2(n(r2)))))));
      case 9:
        return f3(s(i(u2(a(e(t2(n(r2))))))));
      default: {
        for (var o2 = arguments[0], c3 = 1; c3 < arguments.length; c3++)
          o2 = arguments[c3](o2);
        return o2;
      }
    }
  }
  var w2 = function(r2, n) {
    var t2 = typeof r2 == "number" ? function(e) {
      return e.length >= r2;
    } : r2;
    return function() {
      var e = Array.from(arguments);
      return t2(arguments) ? n.apply(this, e) : function(a) {
        return n.apply(void 0, P([a], e, false));
      };
    };
  };
  var R = function(r2) {
    return r2._tag === "Left";
  };
  var $2 = function(r2) {
    return { _tag: "Left", left: r2 };
  };
  var _ = function(r2) {
    return { _tag: "Right", right: r2 };
  };
  var C2 = $2;
  var k = _;
  var A = R;
  var D2 = function(r2, n) {
    return function(t2) {
      return A(t2) ? r2(t2.left) : n(t2.right);
    };
  };
  var g2 = D2;
  function K2(r2) {
    return d(k, r2.of);
  }
  function U(r2) {
    return d(C2, r2.of);
  }
  function W(r2) {
    return function(n, t2) {
      return r2.chain(n, function(e) {
        return A(e) ? r2.of(e) : t2(e.right);
      });
    };
  }
  function B(r2) {
    return function(n, t2) {
      return function(e) {
        return r2.map(e, g2(n, t2));
      };
    };
  }
  var L2 = function(r2, n) {
    return h(r2, M2(n));
  };
  var N = function(r2, n) {
    return h(r2, V(n));
  };
  var M2 = function(r2) {
    return function(n) {
      return function() {
        return Promise.resolve().then(n).then(r2);
      };
    };
  };
  var V = function(r2) {
    return function(n) {
      return function() {
        return Promise.all([Promise.resolve().then(n), Promise.resolve().then(r2)]).then(function(t2) {
          var e = t2[0], a = t2[1];
          return e(a);
        });
      };
    };
  };
  var p = function(r2) {
    return function() {
      return Promise.resolve(r2);
    };
  };
  var Z = /* @__PURE__ */ w2(2, function(r2, n) {
    return function() {
      return Promise.resolve().then(r2).then(function(t2) {
        return n(t2)();
      });
    };
  });
  var S3 = "Task";
  var z = {
    URI: S3,
    map: L2
  };
  var T = {
    of: p
  };
  var G2 = {
    URI: S3,
    map: L2,
    of: p,
    ap: N,
    chain: Z
  };
  var J2 = function(r2, n, t2, e) {
    function a(u2) {
      return u2 instanceof t2 ? u2 : new t2(function(i) {
        i(u2);
      });
    }
    return new (t2 || (t2 = Promise))(function(u2, i) {
      function s(c3) {
        try {
          o2(e.next(c3));
        } catch (l3) {
          i(l3);
        }
      }
      function f3(c3) {
        try {
          o2(e.throw(c3));
        } catch (l3) {
          i(l3);
        }
      }
      function o2(c3) {
        c3.done ? u2(c3.value) : a(c3.value).then(s, f3);
      }
      o2((e = e.apply(r2, n || [])).next());
    });
  };
  var q2 = function(r2, n) {
    var t2 = { label: 0, sent: function() {
      if (u2[0] & 1) throw u2[1];
      return u2[1];
    }, trys: [], ops: [] }, e, a, u2, i;
    return i = { next: s(0), throw: s(1), return: s(2) }, typeof Symbol == "function" && (i[Symbol.iterator] = function() {
      return this;
    }), i;
    function s(o2) {
      return function(c3) {
        return f3([o2, c3]);
      };
    }
    function f3(o2) {
      if (e) throw new TypeError("Generator is already executing.");
      for (; i && (i = 0, o2[0] && (t2 = 0)), t2; ) try {
        if (e = 1, a && (u2 = o2[0] & 2 ? a.return : o2[0] ? a.throw || ((u2 = a.return) && u2.call(a), 0) : a.next) && !(u2 = u2.call(a, o2[1])).done) return u2;
        switch (a = 0, u2 && (o2 = [o2[0] & 2, u2.value]), o2[0]) {
          case 0:
          case 1:
            u2 = o2;
            break;
          case 4:
            return t2.label++, { value: o2[1], done: false };
          case 5:
            t2.label++, a = o2[1], o2 = [0];
            continue;
          case 7:
            o2 = t2.ops.pop(), t2.trys.pop();
            continue;
          default:
            if (u2 = t2.trys, !(u2 = u2.length > 0 && u2[u2.length - 1]) && (o2[0] === 6 || o2[0] === 2)) {
              t2 = 0;
              continue;
            }
            if (o2[0] === 3 && (!u2 || o2[1] > u2[0] && o2[1] < u2[3])) {
              t2.label = o2[1];
              break;
            }
            if (o2[0] === 6 && t2.label < u2[1]) {
              t2.label = u2[1], u2 = o2;
              break;
            }
            if (u2 && t2.label < u2[2]) {
              t2.label = u2[2], t2.ops.push(o2);
              break;
            }
            u2[2] && t2.ops.pop(), t2.trys.pop();
            continue;
        }
        o2 = n.call(r2, t2);
      } catch (c3) {
        o2 = [6, c3], a = 0;
      } finally {
        e = u2 = 0;
      }
      if (o2[0] & 5) throw o2[1];
      return { value: o2[0] ? o2[1] : void 0, done: true };
    }
  };
  var H2 = /* @__PURE__ */ U(T);
  var Q = /* @__PURE__ */ K2(T);
  var X = p;
  var b2 = /* @__PURE__ */ B(z);
  var Y = b2;
  var rr = function(r2, n) {
    return function() {
      return J2(void 0, void 0, void 0, function() {
        var t2;
        return q2(this, function(e) {
          switch (e.label) {
            case 0:
              return e.trys.push([0, 2, , 3]), [4, r2().then(_)];
            case 1:
              return [2, e.sent()];
            case 2:
              return t2 = e.sent(), [2, $2(n(t2))];
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
  };
  var nr = /* @__PURE__ */ w2(2, W(G2));
  var tr = nr;
  function er(r2) {
    const n = (t2) => {
      throw t2;
    };
    return typeof r2 == "function" ? g.resolve(h(r2, b2(n, (t2) => t2))()) : h(r2, g2(n, (t2) => t2));
  }
  function gr(r2) {
    return Object.assign(
      (...n) => er(r2(...n)),
      r2
    );
  }
  var ur = Object.assign(
    (r2, n) => h(
      rr(
        () => new g((t2, e, a) => r2(
          (u2) => t2(k(u2)),
          (u2) => t2(C2(u2)),
          a
        ), n),
        (t2) => t2
      ),
      tr(g2(H2, Q))
    ),
    {
      fn: (r2, n) => ur((t2, e, a) => {
        const u2 = r2(a);
        h(
          typeof u2 == "function" ? u2 : X(u2),
          Y(e, t2)
        )();
      }, n)
    }
  );

  // node_modules/@tma.js/transformers/dist/index.js
  function E2(t2, r2, e, u2, a, s, o2, R3, J4) {
    switch (arguments.length) {
      case 1:
        return t2;
      case 2:
        return r2(t2);
      case 3:
        return e(r2(t2));
      case 4:
        return u2(e(r2(t2)));
      case 5:
        return a(u2(e(r2(t2))));
      case 6:
        return s(a(u2(e(r2(t2)))));
      case 7:
        return o2(s(a(u2(e(r2(t2))))));
      case 8:
        return R3(o2(s(a(u2(e(r2(t2)))))));
      case 9:
        return J4(R3(o2(s(a(u2(e(r2(t2))))))));
      default: {
        for (var y5 = arguments[0], _3 = 1; _3 < arguments.length; _3++)
          y5 = arguments[_3](y5);
        return y5;
      }
    }
  }
  var V2 = function(t2) {
    return t2._tag === "Left";
  };
  var q3 = function(t2) {
    return { _tag: "Left", left: t2 };
  };
  var v = function(t2) {
    return { _tag: "Right", right: t2 };
  };
  var Q2 = q3;
  var f = v;
  var x2 = function(t2) {
    return function(r2) {
      return j2(r2) ? r2 : f(t2(r2.right));
    };
  };
  var j2 = V2;
  var G3 = function(t2, r2) {
    try {
      return f(t2());
    } catch (e) {
      return Q2(r2(e));
    }
  };
  function M3(t2) {
    const r2 = (e) => {
      const u2 = {};
      return new URLSearchParams(e).forEach((a, s) => {
        const o2 = u2[s];
        Array.isArray(o2) ? o2.push(a) : o2 === void 0 ? u2[s] = a : u2[s] = [o2, a];
      }), parse(t2, u2);
    };
    return pipe(
      union([string(), instance(URLSearchParams)]),
      check((e) => {
        try {
          return r2(e), true;
        } catch {
          return false;
        }
      }, "The value doesn't match required schema"),
      transform(r2)
    );
  }
  function H3(t2) {
    return pipe(
      string(),
      check((r2) => {
        try {
          return JSON.parse(r2), true;
        } catch {
          return false;
        }
      }, "Input is not a valid JSON value"),
      transform(JSON.parse),
      t2
    );
  }
  function h2(t2) {
    return pipe(string(), H3(t2));
  }
  function W2(t2) {
    return pipe(
      union([string(), instance(URLSearchParams)]),
      M3(t2)
    );
  }
  function d2(t2) {
    return (r2) => t2.test(r2);
  }
  var K3 = d2(/^#[\da-f]{3}$/i);
  var X2 = d2(/^#[\da-f]{4}$/i);
  var Y2 = d2(/^#[\da-f]{6}$/i);
  var Z2 = d2(/^#[\da-f]{8}$/i);
  function k2(t2) {
    return [Y2, Z2, K3, X2].some((r2) => r2(t2));
  }
  function $3(t2) {
    let r2 = "#";
    for (let e = 0; e < t2.length - 1; e += 1)
      r2 += t2[1 + e].repeat(2);
    return r2;
  }
  function b3(t2) {
    const r2 = t2.replace(/\s/g, "").toLowerCase();
    if (/^#[\da-f]{3}$/i.test(r2))
      return f($3(r2.toLowerCase() + "f"));
    if (/^#[\da-f]{4}$/i.test(r2))
      return f($3(r2.toLowerCase()));
    if (/^#[\da-f]{6}$/i.test(r2))
      return f(r2.toLowerCase() + "ff");
    if (/^#[\da-f]{8}$/i.test(r2))
      return f(r2.toLowerCase());
    const e = r2.match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/) || r2.match(/^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),(\d{1,3})\)$/);
    return e ? f(
      e.slice(1).reduce(
        (u2, a) => u2 + parseInt(a, 10).toString(16).padStart(2, "0"),
        "#"
      ).padEnd(9, "f")
    ) : Q2(new Error(`Value "${t2}" does not satisfy any of known RGB formats.`));
  }
  function tt(t2) {
    return E2(
      b3(t2),
      x2((r2) => r2.slice(0, 7))
    );
  }
  var ct = gr(tt);
  var ft = gr(b3);
  function rt() {
    return looseObject({
      id: number(),
      photo_url: optional(string()),
      type: string(),
      title: string(),
      username: optional(string())
    });
  }
  function P2() {
    return looseObject({
      added_to_attachment_menu: optional(boolean()),
      allows_write_to_pm: optional(boolean()),
      first_name: string(),
      id: number(),
      is_bot: optional(boolean()),
      is_premium: optional(boolean()),
      last_name: optional(string()),
      language_code: optional(string()),
      photo_url: optional(string()),
      username: optional(string())
    });
  }
  function et() {
    return looseObject({
      auth_date: pipe(
        string(),
        transform((t2) => new Date(Number(t2) * 1e3)),
        date()
      ),
      can_send_after: optional(pipe(string(), transform(Number), integer())),
      chat: optional(h2(rt())),
      chat_type: optional(string()),
      chat_instance: optional(string()),
      hash: string(),
      query_id: optional(string()),
      receiver: optional(h2(P2())),
      start_param: optional(string()),
      signature: string(),
      user: optional(h2(P2()))
    });
  }
  function F() {
    return W2(et());
  }
  function B2() {
    return record(
      string(),
      pipe(
        union([string(), number()]),
        transform((t2) => typeof t2 == "number" ? `#${(t2 & 16777215).toString(16).padStart(6, "0")}` : t2),
        check(k2)
      )
    );
  }
  function nt() {
    const t2 = optional(pipe(string(), transform((r2) => r2 === "1")));
    return looseObject({
      tgWebAppBotInline: t2,
      tgWebAppData: optional(F()),
      tgWebAppDefaultColors: optional(h2(B2())),
      tgWebAppFullscreen: t2,
      tgWebAppPlatform: string(),
      tgWebAppShowSettings: t2,
      tgWebAppStartParam: optional(string()),
      tgWebAppThemeParams: h2(B2()),
      tgWebAppVersion: string()
    });
  }
  function T2() {
    return W2(nt());
  }
  function ht() {
    return looseObject({
      eventType: string(),
      eventData: optional(unknown())
    });
  }
  function at(t2) {
    return G3(
      () => parse(F(), t2),
      (r2) => r2
    );
  }
  function it(t2) {
    return G3(
      () => parse(T2(), t2),
      (r2) => r2
    );
  }
  var lt = gr(at);
  var mt = gr(it);

  // node_modules/error-kid/dist/index.js
  var l = Object.defineProperty;
  var o = (e, t2, n) => t2 in e ? l(e, t2, { enumerable: true, configurable: true, writable: true, value: n }) : e[t2] = n;
  var c = (e, t2, n) => o(e, typeof t2 != "symbol" ? t2 + "" : t2, n);
  function f2(e) {
    return (t2) => t2 instanceof e;
  }
  function u(e, t2) {
    const s = class s extends Error {
      constructor(...d4) {
        const i = typeof t2 == "function" ? t2(...d4) : typeof t2 == "string" ? [t2] : t2 || [];
        super(...i), this.name = e;
      }
    };
    c(s, "is", f2(s));
    let n = s;
    return Object.defineProperty(n, "name", { value: e }), n;
  }
  function y2(e, t2, n) {
    const a = class a extends u(e, n) {
      constructor(...r2) {
        super(...r2);
        c(this, "data");
        this.data = t2(...r2);
      }
    };
    c(a, "is", f2(a));
    let s = a;
    return Object.defineProperty(s, "name", { value: e }), s;
  }

  // node_modules/mitt/dist/mitt.mjs
  function mitt_default(n) {
    return { all: n = n || /* @__PURE__ */ new Map(), on: function(t2, e) {
      var i = n.get(t2);
      i ? i.push(e) : n.set(t2, [e]);
    }, off: function(t2, e) {
      var i = n.get(t2);
      i && (e ? i.splice(i.indexOf(e) >>> 0, 1) : n.set(t2, []));
    }, emit: function(t2, e) {
      var i = n.get(t2);
      i && i.slice().map(function(n2) {
        n2(e);
      }), (i = n.get("*")) && i.slice().map(function(n2) {
        n2(t2, e);
      });
    } };
  }

  // node_modules/@tma.js/bridge/dist/index.js
  function se(e) {
    return is(
      looseObject({ TelegramWebviewProxy: looseObject({ postEvent: function_() }) }),
      e
    );
  }
  function ie() {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }
  var Ue = function(e, t2, r2) {
    if (r2 || arguments.length === 2) for (var n = 0, a = t2.length, o2; n < a; n++)
      (o2 || !(n in t2)) && (o2 || (o2 = Array.prototype.slice.call(t2, 0, n)), o2[n] = t2[n]);
    return e.concat(o2 || Array.prototype.slice.call(t2));
  };
  function x3(e, t2, r2, n, a, o2, s, i, c3) {
    switch (arguments.length) {
      case 1:
        return e;
      case 2:
        return function() {
          return t2(e.apply(this, arguments));
        };
      case 3:
        return function() {
          return r2(t2(e.apply(this, arguments)));
        };
      case 4:
        return function() {
          return n(r2(t2(e.apply(this, arguments))));
        };
      case 5:
        return function() {
          return a(n(r2(t2(e.apply(this, arguments)))));
        };
      case 6:
        return function() {
          return o2(a(n(r2(t2(e.apply(this, arguments))))));
        };
      case 7:
        return function() {
          return s(o2(a(n(r2(t2(e.apply(this, arguments)))))));
        };
      case 8:
        return function() {
          return i(s(o2(a(n(r2(t2(e.apply(this, arguments))))))));
        };
      case 9:
        return function() {
          return c3(i(s(o2(a(n(r2(t2(e.apply(this, arguments)))))))));
        };
    }
  }
  function l2(e, t2, r2, n, a, o2, s, i, c3) {
    switch (arguments.length) {
      case 1:
        return e;
      case 2:
        return t2(e);
      case 3:
        return r2(t2(e));
      case 4:
        return n(r2(t2(e)));
      case 5:
        return a(n(r2(t2(e))));
      case 6:
        return o2(a(n(r2(t2(e)))));
      case 7:
        return s(o2(a(n(r2(t2(e))))));
      case 8:
        return i(s(o2(a(n(r2(t2(e)))))));
      case 9:
        return c3(i(s(o2(a(n(r2(t2(e))))))));
      default: {
        for (var u2 = arguments[0], p2 = 1; p2 < arguments.length; p2++)
          u2 = arguments[p2](u2);
        return u2;
      }
    }
  }
  var T3 = function(e, t2) {
    var r2 = typeof e == "number" ? function(n) {
      return n.length >= e;
    } : e;
    return function() {
      var n = Array.from(arguments);
      return r2(arguments) ? t2.apply(this, n) : function(a) {
        return t2.apply(void 0, Ue([a], n, false));
      };
    };
  };
  var je = { _tag: "None" };
  var ze = function(e) {
    return { _tag: "Some", value: e };
  };
  var Ge = function(e) {
    return e._tag === "Left";
  };
  var Ve = function(e) {
    return { _tag: "Left", left: e };
  };
  var Be = function(e) {
    return { _tag: "Right", right: e };
  };
  var m3 = Ve;
  var _2 = Be;
  var ue = /* @__PURE__ */ T3(2, function(e, t2) {
    return d3(e) ? e : t2(e.right);
  });
  var De = function(e) {
    return function(t2) {
      return d3(t2) ? t2 : _2(e(t2.right));
    };
  };
  var Ne = function(e, t2) {
    return function(r2) {
      return d3(r2) ? m3(e(r2.left)) : _2(t2(r2.right));
    };
  };
  var d3 = Ge;
  var ce = function(e, t2) {
    return function(r2) {
      return d3(r2) ? e(r2.left) : t2(r2.right);
    };
  };
  var Qe = ce;
  var F2 = ce;
  var He = F2;
  var q4 = function(e, t2) {
    try {
      return _2(e());
    } catch (r2) {
      return m3(t2(r2));
    }
  };
  var Ke = ue;
  var Xe = je;
  var Ze = ze;
  var et2 = function(e) {
    return e._tag === "None";
  };
  var tt2 = function(e, t2) {
    return function(r2) {
      return et2(r2) ? e() : t2(r2.value);
    };
  };
  var rt2 = tt2;
  function nt2(e) {
    return x3(_2, e.of);
  }
  function ot(e) {
    return x3(m3, e.of);
  }
  function at2(e) {
    return function(t2, r2) {
      return e.chain(t2, function(n) {
        return d3(n) ? e.of(n) : r2(n.right);
      });
    };
  }
  function st(e) {
    return function(t2, r2, n) {
      return e.map(t2, Ne(r2, n));
    };
  }
  function it2(e) {
    return function(t2, r2) {
      return function(n) {
        return e.map(n, F2(t2, r2));
      };
    };
  }
  var pe = function(e, t2) {
    return l2(e, ct2(t2));
  };
  var ut = function(e, t2) {
    return l2(e, pt(t2));
  };
  var ct2 = function(e) {
    return function(t2) {
      return function() {
        return Promise.resolve().then(t2).then(e);
      };
    };
  };
  var pt = function(e) {
    return function(t2) {
      return function() {
        return Promise.all([Promise.resolve().then(t2), Promise.resolve().then(e)]).then(function(r2) {
          var n = r2[0], a = r2[1];
          return n(a);
        });
      };
    };
  };
  var _e = function(e) {
    return function() {
      return Promise.resolve(e);
    };
  };
  var _t = /* @__PURE__ */ T3(2, function(e, t2) {
    return function() {
      return Promise.resolve().then(e).then(function(r2) {
        return t2(r2)();
      });
    };
  });
  var fe = "Task";
  var le = {
    URI: fe,
    map: pe
  };
  var me = {
    of: _e
  };
  var ft2 = {
    URI: fe,
    map: pe,
    of: _e,
    ap: ut,
    chain: _t
  };
  var lt2 = /* @__PURE__ */ ot(me);
  var we = /* @__PURE__ */ nt2(me);
  var he = /* @__PURE__ */ it2(le);
  var mt2 = /* @__PURE__ */ T3(3, st(le));
  var ge = /* @__PURE__ */ T3(2, at2(ft2));
  var wt = ge;
  var ht2 = ge;
  var gt2 = class extends u("MethodUnsupportedError", (t2, r2) => [
    `Method "${t2}" is unsupported in Mini Apps version ${r2}`
  ]) {
  };
  var dt = class extends u("MethodParameterUnsupportedError", (t2, r2, n) => [
    `Parameter "${r2}" of "${t2}" method is unsupported in Mini Apps version ${n}`
  ]) {
  };
  var vt = class extends y2(
    "LaunchParamsRetrieveError",
    (t2) => ({ errors: t2 }),
    (t2) => [
      [
        "Unable to retrieve launch parameters from any known source. Perhaps, you have opened your app outside Telegram?",
        "\u{1F4D6} Refer to docs for more information:",
        "https://docs.telegram-mini-apps.com/packages/tma-js-bridge/environment",
        "",
        "Collected errors:",
        ...t2.map(({ source: r2, error: n }) => `Source: ${r2} / ${n instanceof Error ? n.message : String(n)}`)
      ].join(`
`)
    ]
  ) {
  };
  var bt = class extends u("InvalidLaunchParamsError", (t2, r2) => [
    `Invalid value for launch params: ${t2}`,
    { cause: r2 }
  ]) {
  };
  var de = class extends u("UnknownEnvError") {
  };
  var yt = class extends u(
    "InvokeCustomMethodError",
    (t2) => [`Server returned error: ${t2}`]
  ) {
  };
  var B3 = "launchParams";
  function D3(e) {
    return e.replace(/^[^?#]*[?#]/, "").replace(/[?#]/g, "&");
  }
  var Et = x3($4, Ke(it));
  var Nt = gr(Et);
  var Pt = x3($4, De((e) => {
    const t2 = new URLSearchParams(e).get("tgWebAppData");
    return t2 ? Ze(t2) : Xe;
  }));
  var Jt = x3(
    Pt,
    He((e) => {
      throw e;
    }, (e) => e),
    rt2(() => {
    }, (e) => e)
  );
  function $4() {
    const e = [];
    for (const [t2, r2] of [
      // Try to retrieve launch parameters from the current location. This method
      // can return nothing in case, location was changed, and then the page was
      // reloaded.
      [() => D3(window.location.href), "window.location.href"],
      // Then, try using the lower level API - window.performance.
      [() => {
        const n = performance.getEntriesByType("navigation")[0];
        return n && D3(n.name);
      }, "performance navigation entries"],
      // Finally, try using the session storage.
      [() => fr(B3), "local storage"]
    ]) {
      const n = t2();
      if (!n) {
        e.push({ source: r2, error: new Error("Source is empty") });
        continue;
      }
      const a = l2(
        it(n),
        Qe((o2) => o2, () => true)
      );
      if (typeof a != "boolean") {
        e.push({ source: r2, error: a });
        continue;
      }
      return sr(B3, n), _2(n);
    }
    return m3(new vt(e));
  }
  var Qt = gr($4);
  function xt(e, t2) {
    const r2 = /* @__PURE__ */ new Map(), n = mitt_default(), a = (o2, s, i = false) => {
      const c3 = r2.get(o2) || /* @__PURE__ */ new Map();
      r2.set(o2, c3);
      const u2 = c3.get(s) || [];
      c3.set(s, u2);
      const p2 = u2.findIndex((w3) => w3[1] === i);
      if (p2 >= 0 && (n.off(o2, u2[p2][0]), u2.splice(p2, 1), !u2.length && (c3.delete(s), !c3.size))) {
        const w3 = r2.size;
        r2.delete(o2), w3 && !r2.size && t2();
      }
    };
    return {
      on(o2, s, i) {
        !r2.size && e();
        const c3 = () => {
          a(o2, s, i);
        }, u2 = (...g3) => {
          i && c3(), o2 === "*" ? s({ name: g3[0], payload: g3[1] }) : s(...g3);
        };
        n.on(o2, u2);
        const p2 = r2.get(o2) || /* @__PURE__ */ new Map();
        r2.set(o2, p2);
        const w3 = p2.get(s) || [];
        return p2.set(s, w3), w3.push([u2, i || false]), c3;
      },
      off: a,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      emit: n.emit,
      clear() {
        const o2 = r2.size;
        n.all.clear(), r2.clear(), o2 && t2();
      }
    };
  }
  function A2(e, t2) {
    window.dispatchEvent(new MessageEvent("message", {
      data: JSON.stringify({ eventType: e, eventData: t2 }),
      // We specify this kind of source here in order to allow the package's "on" function to
      // capture it. The reason is this function always checks the event source and relies on
      // it to be the parent window.
      source: window.parent
    }));
  }
  function M4(e, t2, r2) {
    const n = [r2], a = e[t2];
    typeof a == "function" && n.push(a);
    const o2 = (...i) => {
      n.forEach((c3) => c3(...i));
    }, s = Object.assign((...i) => {
      o2(...i);
    }, {
      // Unwraps the composer.
      unwrap() {
        const { length: i } = n;
        if (i === 1) {
          delete e[t2];
          return;
        }
        if (i === 2) {
          J3(e, t2, n[1]);
          return;
        }
        n.unshift(1), J3(e, t2, o2);
      }
    });
    ve(
      e,
      t2,
      () => s,
      (i) => n.push(i)
    );
  }
  function N2(e, t2) {
    const r2 = e[t2];
    ve(e, t2, () => r2, (n) => {
      Object.entries(n).forEach(([a, o2]) => {
        r2[a] = o2;
      });
    });
  }
  function ve(e, t2, r2, n) {
    Object.defineProperty(e, t2, {
      enumerable: true,
      configurable: true,
      get: r2,
      set: n
    });
  }
  function J3(e, t2, r2) {
    Object.defineProperty(e, t2, {
      enumerable: true,
      configurable: true,
      writable: true,
      value: r2
    });
  }
  var kt = {
    clipboard_text_received: looseObject({
      req_id: string(),
      data: nullish(string())
    }),
    custom_method_invoked: looseObject({
      req_id: string(),
      result: optional(unknown()),
      error: optional(string())
    }),
    popup_closed: nullish(
      looseObject({ button_id: nullish(string(), () => {
      }) }),
      {}
    ),
    viewport_changed: nullish(
      looseObject({
        height: number(),
        width: nullish(number(), () => window.innerWidth),
        is_state_stable: boolean(),
        is_expanded: boolean()
      }),
      // TODO: At the moment, macOS has a bug with the invalid event payload - it is always equal to
      //  null. Leaving this default value until the bug is fixed.
      () => ({
        height: window.innerHeight,
        is_state_stable: true,
        is_expanded: true
      })
    ),
    theme_changed: looseObject({
      theme_params: B2()
    })
  };
  function Q3(e) {
    if (e.source !== window.parent)
      return;
    let t2;
    try {
      t2 = parse(h2(ht()), e.data);
    } catch {
      return;
    }
    const { eventType: r2, eventData: n } = t2, a = kt[r2];
    let o2;
    try {
      o2 = a ? parse(a, n) : n;
    } catch (s) {
      return h3().forceError(
        [
          `An error occurred processing the "${r2}" event from the Telegram application.`,
          "Please, file an issue here:",
          "https://github.com/Telegram-Mini-Apps/tma.js/issues/new/choose"
        ].join(`
`),
        t2,
        s
      );
    }
    Tt(r2, o2);
  }
  var {
    on: be,
    off: St,
    emit: Tt,
    clear: $t
  } = xt(
    () => {
      const e = window;
      !e.TelegramGameProxy && (e.TelegramGameProxy = {}), M4(e.TelegramGameProxy, "receiveEvent", A2), N2(e, "TelegramGameProxy"), !e.Telegram && (e.Telegram = {}), !e.Telegram.WebView && (e.Telegram.WebView = {}), M4(e.Telegram.WebView, "receiveEvent", A2), N2(e.Telegram, "WebView"), M4(e, "TelegramGameProxy_receiveEvent", A2), window.addEventListener("message", Q3);
    },
    () => {
      [
        ["TelegramGameProxy_receiveEvent"],
        ["TelegramGameProxy", "receiveEvent"],
        ["Telegram", "WebView", "receiveEvent"]
      ].forEach((e) => {
        const t2 = window;
        let r2 = [void 0, t2];
        for (const o2 of e)
          if (r2 = [r2[1], r2[1][o2]], !r2[1])
            return;
        const [n, a] = r2;
        "unwrap" in a && (a.unwrap(), n && n !== t2 && !Object.keys(n).length && delete t2[e[0]]);
      }), window.removeEventListener("message", Q3);
    }
  );
  var k3 = S(false);
  var O = S("https://web.telegram.org");
  var ye = x(k3);
  var Ee = x(O);
  var y3 = S((...e) => {
    window.parent.postMessage(...e);
  });
  var h3 = S(hr("Bridge", {
    bgColor: "#9147ff",
    textColor: "white",
    shouldLog: ye
  }));
  var Mt = (...e) => y3()(...e);
  function R2(e, t2) {
    h3().log("Posting event:", t2 ? { eventType: e, eventData: t2 } : { eventType: e });
    const r2 = window, n = JSON.stringify({ eventType: e, eventData: t2 });
    return ie() ? (Mt(n, Ee()), _2(void 0)) : se(r2) ? (r2.TelegramWebviewProxy.postEvent(e, JSON.stringify(t2)), _2(void 0)) : is(looseObject({ external: looseObject({ notify: function_() }) }), r2) ? (r2.external.notify(n), _2(void 0)) : m3(new de());
  }
  function U2(e, t2, r2 = {}) {
    const {
      // If no capture function was passed, we capture the first compatible event.
      capture: n = () => true,
      postEvent: a = R2
    } = r2, o2 = S(), [s, i] = lr();
    (Array.isArray(t2) ? t2 : [t2]).forEach((u2) => {
      s(
        be(u2, (p2) => {
          (Array.isArray(t2) ? n({ event: u2, payload: p2 }) : n(p2)) && o2.set([p2]);
        })
      );
    });
    const c3 = (u2) => (i(), u2);
    return l2(
      async () => a(e, r2.params),
      ht2(() => ur((u2, p2, w3) => {
        const g3 = o2();
        if (g3)
          return u2(g3[0]);
        const I3 = (j3) => {
          j3 && u2(j3[0]);
        }, ke2 = () => {
          o2.unsub(I3);
        };
        o2.sub(I3), w3.on("finalized", ke2);
      }, r2)),
      mt2(c3, c3)
    );
  }
  function Lt(e, t2) {
    const r2 = se(window);
    if (!e)
      return r2 || l2($4(), F2(() => false, () => true));
    if (r2)
      return we(true);
    const { timeout: n = 100 } = t2 || {};
    return l2(
      U2("web_app_request_theme", "theme_changed", { ...t2, timeout: n }),
      he(
        (a) => K.is(a) || de.is(a) ? _2(false) : m3(a),
        () => _2(true)
      )
    );
  }
  function Wt(e) {
    return ({ req_id: t2 }) => t2 === e;
  }
  function H4(e) {
    return e.split(".").map(Number);
  }
  function Ft(e, t2) {
    const r2 = H4(e), n = H4(t2), a = Math.max(r2.length, n.length);
    for (let o2 = 0; o2 < a; o2 += 1) {
      const s = r2[o2] || 0, i = n[o2] || 0;
      if (s !== i)
        return s > i ? 1 : -1;
    }
    return 0;
  }
  var K4 = {
    "6.0": [
      "iframe_ready",
      "iframe_will_reload",
      "web_app_close",
      "web_app_data_send",
      "web_app_expand",
      "web_app_open_link",
      "web_app_ready",
      "web_app_request_theme",
      "web_app_request_viewport",
      "web_app_setup_main_button",
      "web_app_setup_closing_behavior"
    ],
    6.1: [
      "web_app_open_tg_link",
      "web_app_open_invoice",
      "web_app_setup_back_button",
      "web_app_set_background_color",
      "web_app_set_header_color",
      "web_app_trigger_haptic_feedback"
    ],
    6.2: ["web_app_open_popup"],
    6.4: [
      "web_app_close_scan_qr_popup",
      "web_app_open_scan_qr_popup",
      "web_app_read_text_from_clipboard",
      { method: "web_app_open_link", param: "try_instant_view" }
    ],
    6.7: ["web_app_switch_inline_query"],
    6.9: [
      "web_app_invoke_custom_method",
      "web_app_request_write_access",
      "web_app_request_phone",
      { method: "web_app_set_header_color", param: "color" }
    ],
    "6.10": ["web_app_setup_settings_button"],
    7.2: [
      "web_app_biometry_get_info",
      "web_app_biometry_open_settings",
      "web_app_biometry_request_access",
      "web_app_biometry_request_auth",
      "web_app_biometry_update_token"
    ],
    7.6: [
      { method: "web_app_open_link", param: "try_browser" },
      { method: "web_app_close", param: "return_back" }
    ],
    7.7: ["web_app_setup_swipe_behavior"],
    7.8: ["web_app_share_to_story"],
    "7.10": [
      "web_app_setup_secondary_button",
      "web_app_set_bottom_bar_color",
      { method: "web_app_setup_main_button", param: "has_shine_effect" }
    ],
    "8.0": [
      "web_app_request_safe_area",
      "web_app_request_content_safe_area",
      "web_app_request_fullscreen",
      "web_app_exit_fullscreen",
      "web_app_set_emoji_status",
      "web_app_add_to_home_screen",
      "web_app_check_home_screen",
      "web_app_request_emoji_status_access",
      "web_app_check_location",
      "web_app_open_location_settings",
      "web_app_request_file_download",
      "web_app_request_location",
      "web_app_send_prepared_message",
      "web_app_start_accelerometer",
      "web_app_start_device_orientation",
      "web_app_start_gyroscope",
      "web_app_stop_accelerometer",
      "web_app_stop_device_orientation",
      "web_app_stop_gyroscope",
      "web_app_toggle_orientation_lock"
    ],
    "9.0": [
      "web_app_device_storage_clear",
      "web_app_device_storage_get_key",
      "web_app_device_storage_save_key",
      "web_app_secure_storage_clear",
      "web_app_secure_storage_get_key",
      "web_app_secure_storage_restore_key",
      "web_app_secure_storage_save_key"
    ],
    9.1: ["web_app_hide_keyboard"]
  };
  function Y3(e, t2) {
    return Object.keys(K4).find((n) => K4[n].some((a) => t2 ? typeof a == "object" && a.method === e && a.param === t2 : a === e)) || null;
  }
  function X3(e, t2, r2) {
    const n = r2 ? Y3(
      e,
      t2
    ) : Y3(e);
    return n ? Ft(n, r2 || t2) <= 0 : false;
  }
  function qt(e, t2, r2, n) {
    return l2(
      U2("web_app_invoke_custom_method", "custom_method_invoked", {
        ...n || {},
        params: { method: e, params: t2, req_id: r2 },
        capture: Wt(r2)
      }),
      wt(({ result: a, error: o2 }) => o2 ? lt2(new yt(o2)) : we(a))
    );
  }
  function Pe(e) {
    return q4(() => decodeURIComponent(
      atob(e).replace(/-/g, "+").replace(/_/g, "/").split("").map((t2) => "%" + ("00" + t2.charCodeAt(0).toString(16)).slice(-2)).join("")
    ), (t2) => t2);
  }
  var or = gr(Pe);
  function xe(e) {
    return btoa(
      encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, (t2, r2) => String.fromCharCode(parseInt(`0x${r2}`)))
    ).replace(/\+/g, "-").replace(/\//g, "_");
  }
  function Rt(e) {
    const t2 = xe(typeof e == "string" ? e : JSON.stringify(e));
    return t2.length > 512 ? m3(new Error("Value is too long for start parameter")) : _2(t2);
  }
  var ar2 = gr(Rt);

  // node_modules/@tma.js/sdk/dist/index.js
  var $e = Object.defineProperty;
  var Le = (s, e, r2) => e in s ? $e(s, e, { enumerable: true, configurable: true, writable: true, value: r2 }) : s[e] = r2;
  var t = (s, e, r2) => Le(s, typeof e != "symbol" ? e + "" : e, r2);
  var es = function(s, e, r2) {
    if (r2 || arguments.length === 2) for (var n = 0, i = e.length, o2; n < i; n++)
      (o2 || !(n in e)) && (o2 || (o2 = Array.prototype.slice.call(e, 0, n)), o2[n] = e[n]);
    return s.concat(o2 || Array.prototype.slice.call(e));
  };
  function _e2(s, e, r2, n, i, o2, u2, a, p2) {
    switch (arguments.length) {
      case 1:
        return s;
      case 2:
        return function() {
          return e(s.apply(this, arguments));
        };
      case 3:
        return function() {
          return r2(e(s.apply(this, arguments)));
        };
      case 4:
        return function() {
          return n(r2(e(s.apply(this, arguments))));
        };
      case 5:
        return function() {
          return i(n(r2(e(s.apply(this, arguments)))));
        };
      case 6:
        return function() {
          return o2(i(n(r2(e(s.apply(this, arguments))))));
        };
      case 7:
        return function() {
          return u2(o2(i(n(r2(e(s.apply(this, arguments)))))));
        };
      case 8:
        return function() {
          return a(u2(o2(i(n(r2(e(s.apply(this, arguments))))))));
        };
      case 9:
        return function() {
          return p2(a(u2(o2(i(n(r2(e(s.apply(this, arguments)))))))));
        };
    }
  }
  function c2(s, e, r2, n, i, o2, u2, a, p2) {
    switch (arguments.length) {
      case 1:
        return s;
      case 2:
        return e(s);
      case 3:
        return r2(e(s));
      case 4:
        return n(r2(e(s)));
      case 5:
        return i(n(r2(e(s))));
      case 6:
        return o2(i(n(r2(e(s)))));
      case 7:
        return u2(o2(i(n(r2(e(s))))));
      case 8:
        return a(u2(o2(i(n(r2(e(s)))))));
      case 9:
        return p2(a(u2(o2(i(n(r2(e(s))))))));
      default: {
        for (var l3 = arguments[0], m4 = 1; m4 < arguments.length; m4++)
          l3 = arguments[m4](l3);
        return l3;
      }
    }
  }
  var lt3 = function(s, e) {
    var r2 = typeof s == "number" ? function(n) {
      return n.length >= s;
    } : s;
    return function() {
      var n = Array.from(arguments);
      return r2(arguments) ? e.apply(this, n) : function(i) {
        return e.apply(void 0, es([i], n, false));
      };
    };
  };
  var ss = { _tag: "None" };
  var rs = function(s) {
    return { _tag: "Some", value: s };
  };
  var ns = function(s) {
    return s._tag === "Left";
  };
  var me2 = function(s) {
    return { _tag: "Left", left: s };
  };
  var be2 = function(s) {
    return { _tag: "Right", right: s };
  };
  var Rt2 = {};
  function os(s, e) {
    return function(r2) {
      return function(n) {
        return s.ap(s.map(n, function(i) {
          return function(o2) {
            return e.ap(i, o2);
          };
        }), r2);
      };
    };
  }
  function is2(s, e) {
    return function(r2) {
      return function(n) {
        return s.map(n, function(i) {
          return e.map(i, r2);
        });
      };
    };
  }
  function Pt2(s) {
    return function(e, r2) {
      return function(n) {
        return s.chain(n, function(i) {
          return s.map(r2(i), function(o2) {
            var u2;
            return Object.assign({}, i, (u2 = {}, u2[e] = o2, u2));
          });
        });
      };
    };
  }
  var V3 = me2;
  var I2 = be2;
  var as = /* @__PURE__ */ lt3(2, function(s, e) {
    return rt3(s) ? s : e(s.right);
  });
  var Ot = function(s, e) {
    return c2(s, P3(e));
  };
  var ge2 = function(s, e) {
    return c2(s, ps(e));
  };
  var Dt = "Either";
  var P3 = function(s) {
    return function(e) {
      return rt3(e) ? e : I2(s(e.right));
    };
  };
  var us = {
    URI: Dt,
    map: Ot
  };
  var cs = I2;
  var ls = function(s) {
    return function(e) {
      return rt3(e) ? e : rt3(s) ? s : I2(e.right(s.right));
    };
  };
  var ps = ls;
  var hs = {
    URI: Dt,
    map: Ot,
    ap: ge2
  };
  var ds = {
    URI: Dt,
    map: Ot,
    ap: ge2,
    chain: as
  };
  var fs = function(s, e) {
    return function(r2) {
      return rt3(r2) ? V3(s(r2.left)) : I2(e(r2.right));
    };
  };
  var rt3 = ns;
  var we2 = function(s, e) {
    return function(r2) {
      return rt3(r2) ? s(r2.left) : e(r2.right);
    };
  };
  var pt2 = we2;
  var _s = function(s, e) {
    try {
      return I2(s());
    } catch (r2) {
      return V3(e(r2));
    }
  };
  var ms = /* @__PURE__ */ cs(Rt2);
  var bs = /* @__PURE__ */ Pt2(ds);
  var ie2 = bs;
  function O2(s) {
    return typeof s == "function" ? s() : s;
  }
  function z2(s, e) {
    return x(() => X3(s, O2(e)));
  }
  var it3 = ss;
  var ht3 = rs;
  var gs = function(s, e) {
    return c2(s, Cs(e));
  };
  var ws = function(s, e) {
    return c2(s, vs(e));
  };
  var Fs = "Option";
  var Cs = function(s) {
    return function(e) {
      return ut2(e) ? it3 : ht3(s(e.value));
    };
  };
  var Ss = ht3;
  var vs = function(s) {
    return function(e) {
      return ut2(e) || ut2(s) ? it3 : ht3(e.value(s.value));
    };
  };
  var ys = /* @__PURE__ */ lt3(2, function(s, e) {
    return ut2(s) ? it3 : e(s.value);
  });
  var ks = {
    URI: Fs,
    map: gs,
    ap: ws,
    chain: ys
  };
  var ut2 = function(s) {
    return s._tag === "None";
  };
  var Es = function(s, e) {
    return function(r2) {
      return ut2(r2) ? s() : e(r2.value);
    };
  };
  var Fe = Es;
  var As = /* @__PURE__ */ Ss(Rt2);
  var ae = /* @__PURE__ */ Pt2(ks);
  function Is(s) {
    return _e2(I2, s.of);
  }
  function xs(s) {
    return _e2(V3, s.of);
  }
  function Bs(s) {
    return is2(s, us);
  }
  function qs(s) {
    return os(s, hs);
  }
  function Ms(s) {
    return function(e, r2) {
      return s.chain(e, function(n) {
        return rt3(n) ? s.of(n) : r2(n.right);
      });
    };
  }
  function Vs(s) {
    return function(e, r2, n) {
      return s.map(e, fs(r2, n));
    };
  }
  function Ts(s) {
    return function(e, r2) {
      return function(n) {
        return s.map(n, pt2(e, r2));
      };
    };
  }
  var Ut = function(s, e) {
    return c2(s, $s(e));
  };
  var Ce = function(s, e) {
    return c2(s, Ls(e));
  };
  var $s = function(s) {
    return function(e) {
      return function() {
        return Promise.resolve().then(e).then(s);
      };
    };
  };
  var Ls = function(s) {
    return function(e) {
      return function() {
        return Promise.all([Promise.resolve().then(e), Promise.resolve().then(s)]).then(function(r2) {
          var n = r2[0], i = r2[1];
          return n(i);
        });
      };
    };
  };
  var Gt = function(s) {
    return function() {
      return Promise.resolve(s);
    };
  };
  var Rs = /* @__PURE__ */ lt3(2, function(s, e) {
    return function() {
      return Promise.resolve().then(s).then(function(r2) {
        return e(r2)();
      });
    };
  });
  var jt = "Task";
  var Ht = {
    URI: jt,
    map: Ut
  };
  var Se = {
    of: Gt
  };
  var Ps = {
    URI: jt,
    map: Ut,
    ap: Ce
  };
  var Os = {
    URI: jt,
    map: Ut,
    of: Gt,
    ap: Ce,
    chain: Rs
  };
  var Ds = function(s, e, r2, n) {
    function i(o2) {
      return o2 instanceof r2 ? o2 : new r2(function(u2) {
        u2(o2);
      });
    }
    return new (r2 || (r2 = Promise))(function(o2, u2) {
      function a(m4) {
        try {
          l3(n.next(m4));
        } catch (_3) {
          u2(_3);
        }
      }
      function p2(m4) {
        try {
          l3(n.throw(m4));
        } catch (_3) {
          u2(_3);
        }
      }
      function l3(m4) {
        m4.done ? o2(m4.value) : i(m4.value).then(a, p2);
      }
      l3((n = n.apply(s, e || [])).next());
    });
  };
  var Us = function(s, e) {
    var r2 = { label: 0, sent: function() {
      if (o2[0] & 1) throw o2[1];
      return o2[1];
    }, trys: [], ops: [] }, n, i, o2, u2;
    return u2 = { next: a(0), throw: a(1), return: a(2) }, typeof Symbol == "function" && (u2[Symbol.iterator] = function() {
      return this;
    }), u2;
    function a(l3) {
      return function(m4) {
        return p2([l3, m4]);
      };
    }
    function p2(l3) {
      if (n) throw new TypeError("Generator is already executing.");
      for (; u2 && (u2 = 0, l3[0] && (r2 = 0)), r2; ) try {
        if (n = 1, i && (o2 = l3[0] & 2 ? i.return : l3[0] ? i.throw || ((o2 = i.return) && o2.call(i), 0) : i.next) && !(o2 = o2.call(i, l3[1])).done) return o2;
        switch (i = 0, o2 && (l3 = [l3[0] & 2, o2.value]), l3[0]) {
          case 0:
          case 1:
            o2 = l3;
            break;
          case 4:
            return r2.label++, { value: l3[1], done: false };
          case 5:
            r2.label++, i = l3[1], l3 = [0];
            continue;
          case 7:
            l3 = r2.ops.pop(), r2.trys.pop();
            continue;
          default:
            if (o2 = r2.trys, !(o2 = o2.length > 0 && o2[o2.length - 1]) && (l3[0] === 6 || l3[0] === 2)) {
              r2 = 0;
              continue;
            }
            if (l3[0] === 3 && (!o2 || l3[1] > o2[0] && l3[1] < o2[3])) {
              r2.label = l3[1];
              break;
            }
            if (l3[0] === 6 && r2.label < o2[1]) {
              r2.label = o2[1], o2 = l3;
              break;
            }
            if (o2 && r2.label < o2[2]) {
              r2.label = o2[2], r2.ops.push(l3);
              break;
            }
            o2[2] && r2.ops.pop(), r2.trys.pop();
            continue;
        }
        l3 = e.call(s, r2);
      } catch (m4) {
        l3 = [6, m4], i = 0;
      } finally {
        n = o2 = 0;
      }
      if (l3[0] & 5) throw l3[1];
      return { value: l3[0] ? l3[1] : void 0, done: true };
    }
  };
  var $5 = /* @__PURE__ */ xs(Se);
  var q5 = /* @__PURE__ */ Is(Se);
  var ve2 = Gt;
  var Gs = /* @__PURE__ */ Ts(Ht);
  var js = function(s, e) {
    return function() {
      return Ds(void 0, void 0, void 0, function() {
        var r2;
        return Us(this, function(n) {
          switch (n.label) {
            case 0:
              return n.trys.push([0, 2, , 3]), [4, s().then(be2)];
            case 1:
              return [2, n.sent()];
            case 2:
              return r2 = n.sent(), [2, me2(e(r2))];
            case 3:
              return [
                2
                /*return*/
              ];
          }
        });
      });
    };
  };
  var Hs = function(s, e) {
    return c2(s, B4(e));
  };
  var Ws = function(s, e) {
    return c2(s, Ks(e));
  };
  var B4 = /* @__PURE__ */ Bs(Ht);
  var Wt2 = /* @__PURE__ */ lt3(3, Vs(Ht));
  var Ks = /* @__PURE__ */ qs(Ps);
  var Kt = /* @__PURE__ */ lt3(2, Ms(Os));
  var Qs = q5;
  var zs = "TaskEither";
  var Ns = {
    URI: zs,
    map: Hs,
    ap: Ws,
    chain: Kt
  };
  var Js = /* @__PURE__ */ Qs(Rt2);
  var Ys = /* @__PURE__ */ Pt2(Ns);
  var wt2 = Ys;
  var Z3 = Kt;
  var at3 = Kt;
  function nt3(s) {
    return [s];
  }
  var Ft2 = class extends y2(
    "ValidationError",
    (e, r2) => ({ input: e, issues: r2 }),
    "Validation error"
  ) {
  };
  var Qt2 = class extends u(
    "CSSVarsBoundError",
    "CSS variables are already bound"
  ) {
  };
  var Zs = class extends u(
    "NotAvailableError",
    nt3
  ) {
  };
  var vn = class extends u(
    "InvalidEnvError",
    nt3
  ) {
  };
  var Xs = class extends u(
    "FunctionNotAvailableError",
    nt3
  ) {
  };
  var Q4 = class extends u(
    "InvalidArgumentsError",
    (e, r2) => [e, { cause: r2 }]
  ) {
  };
  var zt = class extends u(
    "ConcurrentCallError",
    nt3
  ) {
  };
  var tr2 = class extends u(
    "SetEmojiStatusError",
    (e) => [`Failed to set emoji status: ${e}`]
  ) {
  };
  var ye2 = class extends u(
    "AccessDeniedError",
    nt3
  ) {
  };
  var er2 = class extends u(
    "FullscreenFailedError",
    nt3
  ) {
  };
  var sr2 = class extends u(
    "ShareMessageError",
    nt3
  ) {
  };
  var rr2 = class extends u(
    "UnknownThemeParamsKeyError",
    (e) => [`Unknown theme params key passed: ${e}`]
  ) {
  };
  function A3(s, e) {
    const r2 = x(() => O2(e.version) || "100"), n = x(() => O2(e.isTma)), { requires: i, returns: o2 } = e, u2 = i ? typeof i == "object" ? i : { every: [i] } : void 0, a = (f3) => {
      if (!e.supports)
        return true;
      const b4 = e.supports[f3];
      return X3(b4.method, b4.param, r2());
    }, p2 = () => {
      if (!u2)
        return;
      const [f3, b4] = "every" in u2 ? ["every", u2.every] : ["some", u2.some];
      for (let d4 = 0; d4 < b4.length; d4++) {
        const x4 = b4[d4], R3 = typeof x4 == "function" ? x4() : X3(x4, r2()) ? void 0 : `it is unsupported in Mini Apps version ${r2()}`;
        if (R3 && (f3 === "every" || d4 === b4.length - 1))
          return R3;
      }
    }, l3 = (...f3) => {
      for (const b4 in e.supports)
        if (e.supports[b4].shouldCheck(...f3) && !a(b4))
          return `option ${b4} is not supported in Mini Apps version ${r2()}`;
    }, m4 = x(() => !p2()), _3 = x(() => r2() !== "0.0"), F3 = x(() => e.isMounted ? e.isMounted() : true), g3 = x(
      () => n() && _3() && m4() && F3()
    ), S4 = (f3) => {
      const b4 = new Xs(f3);
      return ["task", "promise"].includes(e.returns) ? $5(b4) : V3(b4);
    }, v2 = (...f3) => o2 === "plain" ? _s(() => s(...f3), (b4) => b4) : o2 === "promise" ? js(() => s(...f3), (b4) => b4) : s(...f3);
    return Object.assign(
      (...f3) => {
        var R3;
        const b4 = "Unable to call function:";
        if (!n())
          return S4(`${b4} it can't be called outside Mini Apps`);
        if (!_3())
          return S4(`${b4} the SDK was not initialized. Use the SDK init() function`);
        const d4 = p2();
        if (d4)
          return S4(`${b4} ${d4}`);
        const x4 = l3(...f3);
        if (x4)
          return S4(`${b4} ${x4}`);
        if (!F3()) {
          const T4 = (R3 = e.isMounting) != null && R3.call(e) ? "mounting. Wait for the mount completion" : "unmounted. Use the mount() method";
          return S4(`${b4} the component is ${T4}`);
        }
        return v2(...f3);
      },
      s,
      {
        isAvailable: g3,
        ifAvailable(...f3) {
          return g3() ? ht3(v2(...f3)) : it3;
        }
      },
      u2 ? { isSupported: m4 } : {},
      e.supports ? { supports: a } : {}
    );
  }
  function E3(s) {
    return (e) => A3(e, s);
  }
  function h4(s) {
    return Object.assign(gr(s), {
      ifAvailable(...e) {
        return c2(
          s.ifAvailable(...e),
          Fe(
            () => ({ ok: false }),
            (r2) => ({
              ok: true,
              data: er(r2)
            })
          )
        );
      }
    });
  }
  function Mt2(s) {
    const e = {};
    for (const r2 in s) {
      const n = s[r2];
      n !== void 0 && (e[r2] = n);
    }
    return e;
  }
  function At(s, e) {
    const r2 = Object.keys(s), n = Object.keys(e);
    return r2.length !== n.length ? false : r2.every((i) => Object.prototype.hasOwnProperty.call(e, i) && s[i] === e[i]);
  }
  var tt3 = class {
    constructor({ initialState: e, onChange: r2 }) {
      t(this, "_state");
      t(this, "state");
      t(this, "setState", (e2) => {
        const r3 = { ...this.state(), ...Mt2(e2) };
        At(r3, this.state()) || this._state.set(r3);
      });
      this._state = S(e, { equals: At }), this.state = x(this._state), this.state.sub(r2);
    }
    /**
     * Creates a computed signal based on the state.
     * @param key - a state key to use as a source.
     */
    getter(e) {
      return x(() => this._state()[e]);
    }
    /**
     * @returns True if specified payload will update the state.
     * @param state
     */
    hasDiff(e) {
      return !At({ ...this.state(), ...Mt2(e) }, this.state());
    }
  };
  var dt2 = class {
    constructor({
      onMounted: e,
      restoreState: r2,
      initialState: n,
      onUnmounted: i,
      isPageReload: o2
    }) {
      t(this, "_isMounted", S(false));
      t(this, "isMounted", x(this._isMounted));
      t(this, "mount");
      t(this, "unmount");
      this.mount = () => {
        if (this.isMounted())
          return I2(void 0);
        const u2 = O2(o2) ? r2() : void 0, a = u2 ? I2(u2) : typeof n == "function" ? n() : I2(n);
        return c2(a, P3((p2) => {
          m(() => {
            this._isMounted.set(true), e == null || e(p2);
          });
        }));
      }, this.unmount = () => {
        this._isMounted() && m(() => {
          this._isMounted.set(false), i == null || i();
        });
      };
    }
  };
  var kt2 = class {
    constructor({
      isTma: e,
      storage: r2,
      onClick: n,
      offClick: i,
      initialState: o2,
      isPageReload: u2,
      postEvent: a,
      payload: p2,
      method: l3,
      version: m4
    }) {
      t(this, "isMounted");
      t(this, "isSupported");
      t(this, "state");
      t(this, "stateSetters");
      t(this, "stateBoolSetters");
      t(this, "setStateFp");
      t(this, "setState");
      t(this, "onClickFp");
      t(this, "onClick");
      t(this, "offClickFp");
      t(this, "offClick");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      const _3 = new tt3({
        initialState: o2,
        onChange(f3) {
          r2.set(f3);
        }
      }), F3 = new dt2({
        initialState: o2,
        isPageReload: u2,
        onMounted: _3.setState,
        restoreState: r2.get
      }), g3 = { version: m4, requires: l3, isTma: e }, S4 = E3({
        ...g3,
        returns: "plain"
      }), v2 = E3({
        ...g3,
        returns: "either",
        isMounted: F3.isMounted
      });
      this.isMounted = F3.isMounted, this.isSupported = z2(l3, m4), this.state = _3.state, this.setStateFp = v2((f3) => {
        const b4 = { ...this.state(), ...Mt2(f3) };
        return _3.hasDiff(b4) ? c2(
          a(l3, p2(b4)),
          P3(() => {
            _3.setState(b4);
          })
        ) : I2(void 0);
      }), this.setState = h4(this.setStateFp), this.onClickFp = S4(n), this.onClick = h4(this.onClickFp), this.offClickFp = S4(i), this.offClick = h4(this.offClickFp), this.mountFp = S4(() => {
        const f3 = () => {
        };
        return c2(F3.mount(), pt2(f3, f3));
      }), this.mount = h4(this.mountFp), this.unmount = F3.unmount, this.stateSetters = (f3) => {
        const b4 = v2((d4) => this.setStateFp({ [f3]: d4 }));
        return [h4(b4), b4];
      }, this.stateBoolSetters = (f3) => {
        const [, b4] = this.stateSetters(f3), d4 = v2(() => b4(false)), x4 = v2(() => b4(true));
        return [
          [h4(d4), d4],
          [h4(x4), x4]
        ];
      };
    }
    /**
     * @returns A computed based on the specified state and its related key.
     * @param key - a key to use.
     */
    stateGetter(e) {
      return x(() => this.state()[e]);
    }
  };
  var nr2 = class {
    constructor(e) {
      t(this, "isVisible");
      t(this, "isMounted");
      t(this, "isSupported");
      t(this, "hideFp");
      t(this, "hide");
      t(this, "showFp");
      t(this, "show");
      t(this, "onClickFp");
      t(this, "onClick");
      t(this, "offClickFp");
      t(this, "offClick");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      const r2 = new kt2({
        ...e,
        method: "web_app_setup_back_button",
        payload: (n) => ({ is_visible: n.isVisible }),
        initialState: { isVisible: false }
      });
      this.isVisible = r2.stateGetter("isVisible"), this.isMounted = r2.isMounted, this.isSupported = r2.isSupported, [[this.hide, this.hideFp], [this.show, this.showFp]] = r2.stateBoolSetters("isVisible"), this.onClick = r2.onClick, this.onClickFp = r2.onClickFp, this.offClick = r2.offClick, this.offClickFp = r2.offClickFp, this.mount = r2.mount, this.mountFp = r2.mountFp, this.unmount = r2.unmount;
    }
  };
  function C3() {
    return { isTma: x(() => Lt()) };
  }
  function or2(s) {
    return {
      get: () => fr(s),
      set(e) {
        sr(s, e);
      }
    };
  }
  function ir() {
    return performance.getEntriesByType("navigation")[0];
  }
  function ar3() {
    const s = ir();
    return !!s && s.type === "reload";
  }
  function ft3(s) {
    return (e) => ({ ...e, ...O2(s) });
  }
  function et3(s) {
    return ft3({
      storage: or2(s),
      isPageReload: ar3
    });
  }
  // @__NO_SIDE_EFFECTS__
  function _t2(s, e) {
    return S(s, e);
  }
  var ke = /* @__PURE__ */ _t2(R2);
  var mt3 = (...s) => ke()(...s);
  var ur2 = (...s) => er(mt3(...s));
  var L3 = ft3({
    postEvent: mt3
  });
  var Vt = /* @__PURE__ */ _t2("0.0");
  var y4 = ft3({ version: Vt });
  function Nt2(s, e) {
    return {
      ...c2(
        C3(),
        L3,
        y4,
        et3(s)
      ),
      onClick(r2, n) {
        return be(e, r2, n);
      },
      offClick(r2, n) {
        St(e, r2, n);
      }
    };
  }
  var yn = new nr2(Nt2("backButton", "back_button_pressed"));
  var Jt2 = class {
    constructor({
      initialState: e,
      onMounted: r2,
      restoreState: n,
      onUnmounted: i,
      isPageReload: o2
    }) {
      t(this, "_isMounted", S(false));
      t(this, "isMounted", x(this._isMounted));
      t(this, "mount");
      t(this, "unmount");
      this.mount = (u2) => {
        if (this._isMounted())
          return q5(void 0);
        const a = O2(o2) ? n() : void 0;
        return c2(
          a ? q5(a) : e(u2),
          B4((p2) => {
            this._isMounted() || m(() => {
              this._isMounted.set(true), r2 == null || r2(p2);
            });
          })
        );
      }, this.unmount = () => {
        this._isMounted() && m(() => {
          this._isMounted.set(false), i == null || i();
        });
      };
    }
  };
  var ue2 = new Zs("Biometry is not available");
  function It(s) {
    let e = false, r2 = false, n = "", i = false, o2 = "", u2 = false;
    return s.available && (e = true, r2 = s.token_saved, n = s.device_id, i = s.access_requested, o2 = s.type, u2 = s.access_granted), { available: e, tokenSaved: r2, deviceId: n, type: o2, accessGranted: u2, accessRequested: i };
  }
  var cr2 = class {
    constructor({
      version: e,
      request: r2,
      postEvent: n,
      storage: i,
      onInfoReceived: o2,
      offInfoReceived: u2,
      isTma: a,
      isPageReload: p2
    }) {
      t(this, "isAvailable");
      t(this, "isSupported");
      t(this, "isMounted");
      t(this, "state");
      t(this, "authenticateFp");
      t(this, "authenticate");
      t(this, "openSettingsFp");
      t(this, "openSettings");
      t(this, "requestAccessFp");
      t(this, "requestAccess");
      t(this, "updateTokenFp");
      t(this, "updateToken");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      const l3 = (f3) => {
        m4.setState(It(f3));
      }, m4 = new tt3({
        initialState: {
          available: false,
          type: "unknown",
          accessGranted: false,
          accessRequested: false,
          deviceId: "",
          tokenSaved: false
        },
        onChange: i.set
      }), _3 = new Jt2({
        initialState(f3) {
          return c2(
            r2("web_app_biometry_get_info", "biometry_info_received", f3),
            B4(It)
          );
        },
        isPageReload: p2,
        onMounted(f3) {
          m4.setState(f3), o2(l3);
        },
        onUnmounted() {
          u2(l3);
        },
        restoreState: i.get
      }), F3 = { version: e, requires: "web_app_biometry_request_auth", isTma: a }, g3 = E3({
        ...F3,
        returns: "either"
      }), S4 = E3({
        ...F3,
        returns: "task"
      }), v2 = E3({
        ...F3,
        isMounted: _3.isMounted,
        returns: "task"
      });
      this.isAvailable = m4.getter("available"), this.isMounted = _3.isMounted, this.isSupported = z2("web_app_biometry_request_auth", e), this.state = m4.state, this.unmount = _3.unmount, this.mountFp = S4(_3.mount), this.authenticateFp = v2((f3) => this.isAvailable() ? c2(
        r2("web_app_biometry_request_auth", "biometry_auth_requested", {
          ...f3,
          params: { reason: ((f3 || {}).reason || "").trim() }
        }),
        B4((b4) => (m4.setState({ token: b4.token }), b4))
      ) : $5(ue2)), this.openSettingsFp = g3(() => n("web_app_biometry_open_settings")), this.requestAccessFp = v2((f3) => c2(
        r2("web_app_biometry_request_access", "biometry_info_received", {
          ...f3,
          params: { reason: ((f3 || {}).reason || "").trim() }
        }),
        Z3((b4) => {
          const d4 = It(b4);
          return d4.available ? (m4.setState(d4), q5(d4.accessRequested)) : $5(ue2);
        })
      )), this.updateTokenFp = v2((f3 = {}) => {
        var b4;
        return c2(
          r2("web_app_biometry_update_token", "biometry_token_updated", {
            ...f3,
            params: { token: f3.token || "", reason: (b4 = f3.reason) == null ? void 0 : b4.trim() }
          }),
          B4((d4) => d4.status)
        );
      }), this.authenticate = h4(this.authenticateFp), this.openSettings = h4(this.openSettingsFp), this.requestAccess = h4(this.requestAccessFp), this.updateToken = h4(this.updateTokenFp), this.mount = h4(this.mountFp);
    }
  };
  var Ee2 = (s, e, r2) => U2(s, e, {
    postEvent: mt3,
    ...r2
  });
  var G4 = ft3({
    request: Ee2
  });
  var En = new cr2({
    ...c2(
      C3(),
      L3,
      y4,
      G4,
      et3("biometry")
    ),
    offInfoReceived(s) {
      St("biometry_info_received", s);
    },
    onInfoReceived(s) {
      return be("biometry_info_received", s);
    }
  });
  var lr2 = class {
    constructor({ postEvent: e, storage: r2, isTma: n, isPageReload: i }) {
      t(this, "isConfirmationEnabled");
      t(this, "isMounted");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      t(this, "disableConfirmationFp");
      t(this, "disableConfirmation");
      t(this, "enableConfirmationFp");
      t(this, "enableConfirmation");
      const o2 = new tt3({
        initialState: { isConfirmationEnabled: false },
        onChange(_3) {
          r2.set(_3);
        }
      }), u2 = new dt2({
        onMounted: o2.setState,
        restoreState: r2.get,
        initialState: { isConfirmationEnabled: false },
        isPageReload: i
      }), a = { requires: "web_app_setup_closing_behavior", isTma: n }, p2 = E3({
        ...a,
        returns: "plain"
      }), l3 = E3({
        ...a,
        returns: "either",
        isMounted: u2.isMounted
      }), m4 = (_3) => _3 === this.isConfirmationEnabled() ? I2(void 0) : (o2.setState({ isConfirmationEnabled: _3 }), e("web_app_setup_closing_behavior", {
        need_confirmation: _3
      }));
      this.isConfirmationEnabled = o2.getter("isConfirmationEnabled"), this.isMounted = u2.isMounted, this.disableConfirmationFp = l3(() => m4(false)), this.enableConfirmationFp = l3(() => m4(true)), this.mountFp = p2(() => {
        const _3 = () => {
        };
        return c2(u2.mount(), pt2(_3, _3));
      }), this.unmount = u2.unmount, this.disableConfirmation = h4(this.disableConfirmationFp), this.enableConfirmation = h4(this.enableConfirmationFp), this.mount = h4(this.mountFp);
    }
  };
  var An = new lr2(c2(
    C3(),
    et3("closingBehavior"),
    L3
  ));
  var pr = class {
    constructor({ version: e, isTma: r2, invokeCustomMethod: n }) {
      t(this, "isSupported");
      t(this, "deleteItemFp");
      t(this, "deleteItem");
      t(this, "getItemFp");
      t(this, "getItem");
      t(this, "getItemsFp");
      t(this, "getItems");
      t(this, "getKeysFp");
      t(this, "getKeys");
      t(this, "setItemFp");
      t(this, "setItem");
      t(this, "clearFp");
      t(this, "clear");
      const i = E3({
        version: e,
        requires: "web_app_invoke_custom_method",
        isTma: r2,
        returns: "task"
      });
      this.isSupported = z2("web_app_invoke_custom_method", e), this.deleteItemFp = i((o2, u2) => {
        const a = Array.isArray(o2) ? o2 : [o2];
        return c2(
          a.length ? n("deleteStorageValues", { keys: a }, u2) : q5(void 0),
          B4(() => {
          })
        );
      }), this.getItemFp = i((o2, u2) => c2(
        this.getItemsFp([o2], u2),
        B4((a) => a[o2] || "")
      )), this.getItemsFp = i((o2, u2) => c2(
        o2.length ? n("getStorageValues", { keys: o2 }, u2) : q5({}),
        B4((a) => ({
          // Fulfill the response with probably missing keys.
          ...o2.reduce((p2, l3) => (p2[l3] = "", p2), {}),
          ...parse(record(string(), string()), a)
        }))
      )), this.getKeysFp = i((o2) => c2(
        n("getStorageKeys", {}, o2),
        B4((u2) => parse(array(string()), u2))
      )), this.setItemFp = i((o2, u2, a) => c2(
        n("saveStorageValue", { key: o2, value: u2 }, a),
        B4(() => {
        })
      )), this.clearFp = i((o2) => c2(this.getKeysFp(o2), Z3(this.deleteItemFp))), this.deleteItem = h4(this.deleteItemFp), this.getItem = h4(this.getItemFp), this.getItems = h4(this.getItemsFp), this.getKeys = h4(this.getKeysFp), this.setItem = h4(this.setItemFp), this.clear = h4(this.clearFp);
    }
  };
  var xt2 = /* @__PURE__ */ _t2(0);
  function Ae() {
    return xt2.set(xt2() + 1), xt2().toString();
  }
  function hr2(s, e, r2) {
    return qt(s, e, Ae(), {
      ...r2 || {},
      postEvent: mt3
    });
  }
  var Yt = ft3({
    invokeCustomMethod: hr2
  });
  var In = new pr(c2(
    C3(),
    y4,
    Yt
  ));
  function dr({ request: s, ...e }) {
    return A3((r2) => c2(
      s("web_app_request_emoji_status_access", "emoji_status_access_requested", r2),
      B4((n) => n.status)
    ), { ...e, requires: "web_app_request_emoji_status_access", returns: "task" });
  }
  var fr2 = dr(c2(
    C3(),
    y4,
    G4
  ));
  var xn = h4(fr2);
  function _r({ request: s, ...e }) {
    return A3((r2, n) => c2(
      s("web_app_set_emoji_status", ["emoji_status_set", "emoji_status_failed"], {
        params: {
          custom_emoji_id: r2,
          duration: (n || {}).duration
        },
        ...n
      }),
      at3((i) => i && "error" in i ? $5(new tr2(i.error)) : q5(void 0))
    ), {
      ...e,
      requires: "web_app_set_emoji_status",
      returns: "task"
    });
  }
  var mr = _r(c2(
    C3(),
    G4,
    y4
  ));
  var Bn = h4(mr);
  var br = class {
    constructor({ postEvent: e, isTma: r2, version: n }) {
      t(this, "isSupported");
      t(this, "impactOccurredFp");
      t(this, "impactOccurred");
      t(this, "notificationOccurredFp");
      t(this, "notificationOccurred");
      t(this, "selectionChangedFp");
      t(this, "selectionChanged");
      const i = "web_app_trigger_haptic_feedback", o2 = E3({
        requires: i,
        isTma: r2,
        version: n,
        returns: "plain"
      });
      this.isSupported = z2(i, n), this.impactOccurredFp = o2((u2) => e(i, { type: "impact", impact_style: u2 })), this.notificationOccurredFp = o2((u2) => e(i, { type: "notification", notification_type: u2 })), this.selectionChangedFp = o2(() => e(i, { type: "selection_change" })), this.impactOccurred = h4(this.impactOccurredFp), this.notificationOccurred = h4(this.notificationOccurredFp), this.selectionChanged = h4(this.selectionChangedFp);
    }
  };
  var qn = new br(c2(
    C3(),
    L3,
    y4
  ));
  function gr2({ postEvent: s, ...e }) {
    return A3(() => s("web_app_add_to_home_screen"), { ...e, requires: "web_app_add_to_home_screen", returns: "either" });
  }
  var wr = gr2(c2(
    C3(),
    y4,
    L3
  ));
  var Mn = h4(wr);
  function Fr({ request: s, ...e }) {
    return A3((r2) => c2(
      s("web_app_check_home_screen", "home_screen_checked", r2),
      B4((n) => n.status || "unknown")
    ), { ...e, requires: "web_app_check_home_screen", returns: "task" });
  }
  var Cr = Fr(c2(
    C3(),
    y4,
    G4
  ));
  var Vn = h4(Cr);
  var Sr = class {
    constructor({ retrieveInitData: e }) {
      t(this, "_state", S());
      t(this, "_raw", S());
      t(this, "state", x(this._state));
      t(this, "authDate", this.fromState("auth_date"));
      t(this, "canSendAfter", this.fromState("can_send_after"));
      t(this, "canSendAfterDate", x(() => {
        const e2 = this.authDate(), r2 = this.canSendAfter();
        return r2 && e2 ? new Date(e2.getTime() + r2 * 1e3) : void 0;
      }));
      t(this, "chat", this.fromState("chat"));
      t(this, "chatType", this.fromState("chat_type"));
      t(this, "chatInstance", this.fromState("chat_instance"));
      t(this, "hash", this.fromState("hash"));
      t(this, "queryId", this.fromState("query_id"));
      t(this, "raw", x(this._raw));
      t(this, "receiver", this.fromState("receiver"));
      t(this, "signature", this.fromState("signature"));
      t(this, "startParam", this.fromState("start_param"));
      t(this, "user", this.fromState("user"));
      t(this, "restoreFp");
      t(this, "restore");
      this.restoreFp = () => c2(
        e(),
        P3(Fe(() => {
        }, ({ raw: r2, obj: n }) => {
          this._state.set(n), this._raw.set(r2);
        }))
      ), this.restore = gr(this.restoreFp);
    }
    fromState(e) {
      return x(() => {
        const r2 = this._state();
        return r2 ? r2[e] : void 0;
      });
    }
  };
  var Tn = new Sr({
    retrieveInitData() {
      return c2(
        ms,
        ie2("obj", () => c2(
          Et(),
          P3(({ tgWebAppData: s }) => s ? ht3(s) : it3)
        )),
        ie2("raw", Pt),
        P3(({ obj: s, raw: e }) => c2(
          As,
          ae("obj", () => s),
          ae("raw", () => e)
        ))
      );
    }
  });
  var vr = class {
    constructor({ version: e, request: r2, isTma: n }) {
      t(this, "isOpened");
      t(this, "isSupported");
      t(this, "openSlugFp");
      t(this, "openSlug");
      t(this, "openUrlFp");
      t(this, "openUrl");
      const i = E3({
        version: e,
        isTma: n,
        requires: "web_app_open_invoice",
        returns: "task"
      }), o2 = S(false), u2 = () => {
        o2.set(false);
      };
      this.isSupported = z2("web_app_open_invoice", e), this.isOpened = x(o2), this.openSlugFp = i((a, p2) => c2(
        this.isOpened() ? $5(new zt("Invoice is already opened")) : q5(void 0),
        Z3(() => (o2.set(true), r2("web_app_open_invoice", "invoice_closed", {
          ...p2,
          params: { slug: a },
          capture: (l3) => a === l3.slug
        }))),
        Wt2((l3) => (u2(), l3), (l3) => (u2(), l3.status))
      )), this.openUrlFp = i((a, p2) => {
        const { hostname: l3, pathname: m4 } = new URL(a, window.location.href);
        if (l3 !== "t.me")
          return $5(new Q4(`Link has unexpected hostname: ${l3}`));
        const _3 = m4.match(/^\/(\$|invoice\/)([A-Za-z0-9\-_=]+)$/);
        return _3 ? this.openSlugFp(_3[2], p2) : $5(new Q4(
          'Expected to receive a link with a pathname in format "/invoice/{slug}" or "/${slug}"'
        ));
      }), this.openUrl = h4(this.openUrlFp), this.openSlug = h4(this.openSlugFp);
    }
  };
  var $n = new vr(c2(C3(), G4, y4));
  function yr({ postEvent: s, ...e }) {
    return A3((r2, n = {}) => {
      if (typeof r2 == "string")
        try {
          r2 = new URL(r2);
        } catch (i) {
          return V3(new Q4(`"${r2.toString()}" is invalid URL`, i));
        }
      return s("web_app_open_link", {
        url: r2.toString(),
        try_browser: n.tryBrowser,
        try_instant_view: n.tryInstantView
      });
    }, { ...e, returns: "either" });
  }
  var kr = yr(c2(
    C3(),
    L3
  ));
  var Ln = h4(kr);
  function Er({ postEvent: s, version: e, ...r2 }) {
    return A3((n) => {
      const i = n.toString();
      return i.match(/^https:\/\/t.me\/.+/) ? X3("web_app_open_tg_link", O2(e)) ? (n = new URL(n), s("web_app_open_tg_link", { path_full: n.pathname + n.search })) : (window.location.href = i, I2(void 0)) : V3(new Q4(`"${i}" is invalid URL`));
    }, { ...r2, returns: "either" });
  }
  var Ie = Er(c2(
    C3(),
    L3,
    y4
  ));
  var Rn = h4(Ie);
  function Ar({ openTelegramLink: s, ...e }) {
    return A3((r2, n) => s(
      "https://t.me/share/url?" + new URLSearchParams({ url: r2, text: n || "" }).toString().replace(/\+/g, "%20")
    ), { ...e, returns: "either" });
  }
  var Ir = Ar({
    ...C3(),
    openTelegramLink: Ie
  });
  var Pn = h4(Ir);
  function xr(s) {
    let e = false, r2, n;
    return s.available && (e = true, r2 = s.access_requested, n = s.access_granted), {
      available: e,
      accessGranted: n || false,
      accessRequested: r2 || false
    };
  }
  var Br = class {
    constructor({
      version: e,
      request: r2,
      postEvent: n,
      storage: i,
      isTma: o2,
      isPageReload: u2
    }) {
      t(this, "state");
      t(this, "isAvailable");
      t(this, "isAccessGranted");
      t(this, "isAccessRequested");
      t(this, "isMounted");
      t(this, "isSupported");
      t(this, "openSettingsFp");
      t(this, "openSettings");
      t(this, "requestLocationFp");
      t(this, "requestLocation");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      const a = new tt3({
        initialState: {
          available: false,
          accessGranted: false,
          accessRequested: false
        },
        onChange: i.set
      }), p2 = new Jt2({
        isPageReload: u2,
        restoreState: i.get,
        onMounted: a.setState,
        initialState(g3) {
          return c2(
            r2("web_app_check_location", "location_checked", g3),
            B4(xr)
          );
        }
      }), l3 = { version: e, requires: "web_app_check_location", isTma: o2 }, m4 = E3({
        ...l3,
        returns: "either"
      }), _3 = E3({
        ...l3,
        returns: "task"
      }), F3 = E3({
        ...l3,
        returns: "task",
        isMounted: p2.isMounted
      });
      this.isAvailable = a.getter("available"), this.isAccessRequested = a.getter("accessRequested"), this.isAccessGranted = a.getter("accessGranted"), this.isSupported = z2("web_app_check_location", e), this.isMounted = p2.isMounted, this.state = a.state, this.unmount = p2.unmount, this.mountFp = _3(p2.mount), this.openSettingsFp = m4(() => n("web_app_open_location_settings")), this.requestLocationFp = F3((g3) => c2(
        r2("web_app_request_location", "location_requested", g3),
        B4((S4) => {
          if (!S4.available)
            return a.setState({ available: false }), null;
          const { available: v2, ...f3 } = S4;
          return f3;
        })
      )), this.mount = h4(this.mountFp), this.openSettings = h4(this.openSettingsFp), this.requestLocation = h4(this.requestLocationFp);
    }
  };
  var On = new Br(c2(
    C3(),
    L3,
    y4,
    G4,
    et3("locationManager")
  ));
  var qr = class {
    constructor({ defaults: e, ...r2 }) {
      t(this, "bgColor");
      t(this, "hasShineEffect");
      t(this, "isEnabled");
      t(this, "isLoaderVisible");
      t(this, "isVisible");
      t(this, "isMounted");
      t(this, "state");
      t(this, "text");
      t(this, "textColor");
      t(this, "showFp");
      t(this, "show");
      t(this, "hideFp");
      t(this, "hide");
      t(this, "enableFp");
      t(this, "enable");
      t(this, "enableShineEffectFp");
      t(this, "enableShineEffect");
      t(this, "disableFp");
      t(this, "disable");
      t(this, "disableShineEffectFp");
      t(this, "disableShineEffect");
      t(this, "setBgColorFp");
      t(this, "setBgColor");
      t(this, "setTextColorFp");
      t(this, "setTextColor");
      t(this, "setTextFp");
      t(this, "setText");
      t(this, "showLoaderFp");
      t(this, "showLoader");
      t(this, "hideLoaderFp");
      t(this, "hideLoader");
      t(this, "setParamsFp");
      t(this, "setParams");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      t(this, "onClickFp");
      t(this, "onClick");
      t(this, "offClickFp");
      t(this, "offClick");
      const n = new kt2({
        ...r2,
        version: "100",
        initialState: {
          hasShineEffect: false,
          isEnabled: true,
          isLoaderVisible: false,
          isVisible: false,
          text: "Continue"
        },
        method: "web_app_setup_main_button",
        payload: (o2) => ({
          has_shine_effect: o2.hasShineEffect,
          is_visible: o2.isVisible,
          is_active: o2.isEnabled,
          is_progress_visible: o2.isLoaderVisible,
          text: o2.text,
          color: o2.bgColor,
          text_color: o2.textColor
        })
      }), i = (o2, u2) => {
        const a = n.stateGetter(o2);
        return x(() => a() || O2(u2));
      };
      this.bgColor = i("bgColor", e.bgColor), this.textColor = i("textColor", e.textColor), this.hasShineEffect = n.stateGetter("hasShineEffect"), this.isEnabled = n.stateGetter("isEnabled"), this.isLoaderVisible = n.stateGetter("isLoaderVisible"), this.text = n.stateGetter("text"), this.isVisible = n.stateGetter("isVisible"), this.isMounted = n.isMounted, this.state = n.state, [this.setBgColor, this.setBgColorFp] = n.stateSetters("bgColor"), [this.setTextColor, this.setTextColorFp] = n.stateSetters("textColor"), [
        [this.disableShineEffect, this.disableShineEffectFp],
        [this.enableShineEffect, this.enableShineEffectFp]
      ] = n.stateBoolSetters("hasShineEffect"), [
        [this.disable, this.disableFp],
        [this.enable, this.enableFp]
      ] = n.stateBoolSetters("isEnabled"), [
        [this.hideLoader, this.hideLoaderFp],
        [this.showLoader, this.showLoaderFp]
      ] = n.stateBoolSetters("isLoaderVisible"), [this.setText, this.setTextFp] = n.stateSetters("text"), [[this.hide, this.hideFp], [this.show, this.showFp]] = n.stateBoolSetters("isVisible"), this.setParams = n.setState, this.setParamsFp = n.setStateFp, this.onClick = n.onClick, this.onClickFp = n.onClickFp, this.offClick = n.offClick, this.offClickFp = n.offClickFp, this.mount = n.mount, this.mountFp = n.mountFp, this.unmount = n.unmount;
    }
    //#endregion
  };
  function xe2(s, e, r2) {
    return c2(
      Nt2(s, e),
      (n) => ({ ...n, defaults: r2 })
    );
  }
  var Tt2 = /* @__PURE__ */ _t2({});
  function Zt(s, e) {
    document.documentElement.style.setProperty(s, e);
  }
  function Xt(s) {
    document.documentElement.style.removeProperty(s);
  }
  function Mr(s) {
    return c2(
      b3(s),
      P3((e) => Math.sqrt(
        [0.299, 0.587, 0.114].reduce((r2, n, i) => {
          const o2 = parseInt(e.slice(1 + i * 2, 1 + (i + 1) * 2), 16);
          return r2 + o2 * o2 * n;
        }, 0)
      ) < 120)
    );
  }
  var Be2 = gr(Mr);
  var Vr = class {
    constructor({
      initialState: e,
      onChange: r2,
      offChange: n,
      isTma: i,
      storage: o2,
      isPageReload: u2
    }) {
      t(this, "accentTextColor");
      t(this, "bgColor");
      t(this, "buttonColor");
      t(this, "buttonTextColor");
      t(this, "bottomBarBgColor");
      t(this, "destructiveTextColor");
      t(this, "headerBgColor");
      t(this, "hintColor");
      t(this, "linkColor");
      t(this, "secondaryBgColor");
      t(this, "sectionBgColor");
      t(this, "sectionHeaderTextColor");
      t(this, "sectionSeparatorColor");
      t(this, "subtitleTextColor");
      t(this, "textColor");
      t(this, "_isCssVarsBound", S(false));
      t(this, "isCssVarsBound", x(this._isCssVarsBound));
      t(this, "bindCssVarsFp");
      t(this, "bindCssVars");
      t(this, "state");
      t(this, "isDark", x(() => {
        const e2 = this.bgColor();
        return !e2 || Be2(e2);
      }));
      t(this, "isMounted");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      const a = new tt3({
        initialState: {},
        onChange: o2.set
      }), p2 = (g3) => {
        a.setState(g3.theme_params);
      }, l3 = new dt2({
        initialState: () => I2(O2(e)),
        isPageReload: u2,
        onMounted(g3) {
          a.setState(g3), r2(p2);
        },
        onUnmounted() {
          n(p2);
        },
        restoreState: o2.get
      }), m4 = { isTma: i, returns: "either" }, _3 = E3(m4), F3 = E3({
        ...m4,
        isMounted: l3.isMounted
      });
      this.accentTextColor = a.getter("accent_text_color"), this.bgColor = a.getter("bg_color"), this.buttonColor = a.getter("button_color"), this.buttonTextColor = a.getter("button_text_color"), this.bottomBarBgColor = a.getter("bottom_bar_bg_color"), this.destructiveTextColor = a.getter("destructive_text_color"), this.headerBgColor = a.getter("header_bg_color"), this.hintColor = a.getter("hint_color"), this.linkColor = a.getter("link_color"), this.secondaryBgColor = a.getter("secondary_bg_color"), this.sectionBgColor = a.getter("section_bg_color"), this.sectionHeaderTextColor = a.getter("section_header_text_color"), this.sectionSeparatorColor = a.getter("section_separator_color"), this.subtitleTextColor = a.getter("subtitle_text_color"), this.textColor = a.getter("text_color"), this.state = a.state, this.isMounted = l3.isMounted, this.bindCssVarsFp = F3((g3) => {
        if (this._isCssVarsBound())
          return V3(new Qt2());
        g3 || (g3 = (f3) => `--tg-theme-${cr(f3)}`);
        const S4 = (f3) => {
          Object.entries(a.state()).forEach(([b4, d4]) => {
            d4 && f3(b4, d4);
          });
        }, v2 = () => {
          S4((f3, b4) => {
            Zt(g3(f3), b4);
          });
        };
        return v2(), a.state.sub(v2), this._isCssVarsBound.set(true), I2(() => {
          S4(Xt), a.state.unsub(v2), this._isCssVarsBound.set(false);
        });
      }), this.mountFp = _3(l3.mount), this.unmount = l3.unmount, this.bindCssVars = h4(this.bindCssVarsFp), this.mount = h4(this.mountFp);
    }
    //#endregion
  };
  var vt2 = new Vr({
    ...c2(
      C3(),
      et3("themeParams")
    ),
    offChange(s) {
      St("theme_changed", s);
    },
    onChange(s) {
      be("theme_changed", s);
    },
    initialState: Tt2
  });
  var Dn = new qr(
    xe2("mainButton", "main_button_pressed", {
      bgColor: x(() => vt2.buttonColor() || "#2481cc"),
      textColor: x(() => vt2.buttonTextColor() || "#ffffff")
    })
  );
  var Tr = class {
    constructor({
      storage: e,
      isPageReload: r2,
      version: n,
      postEvent: i,
      isTma: o2,
      theme: u2,
      onVisibilityChanged: a,
      offVisibilityChanged: p2
    }) {
      t(this, "isSupported");
      t(this, "isDark", x(() => {
        const e2 = this.bgColorRgb();
        return e2 ? Be2(e2) : false;
      }));
      t(this, "isActive");
      t(this, "state");
      t(this, "isCssVarsBound");
      t(this, "bindCssVarsFp");
      t(this, "bindCssVars");
      t(this, "isMounted");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      t(this, "bgColor");
      t(this, "bgColorRgb");
      t(this, "setBgColorFp");
      t(this, "setBgColor");
      t(this, "headerColor");
      t(this, "headerColorRgb");
      t(this, "setHeaderColorFp");
      t(this, "setHeaderColor");
      t(this, "bottomBarColor");
      t(this, "bottomBarColorRgb");
      t(this, "setBottomBarColorFp");
      t(this, "setBottomBarColor");
      t(this, "closeFp");
      t(this, "close");
      t(this, "readyFp");
      t(this, "ready");
      const l3 = (d4) => {
        F3.setState({ isActive: d4.is_visible });
      }, m4 = (d4) => {
        [
          [this.headerColor, "web_app_set_header_color"],
          [this.bgColor, "web_app_set_background_color"],
          [this.bottomBarColor, "web_app_set_bottom_bar_color"]
        ].forEach(([x4, R3]) => {
          const T4 = x4();
          if (!Y2(T4) && (R3 !== "web_app_set_header_color" || !["bg_color", "secondary_bg_color"].includes(T4))) {
            const D4 = d4[T4];
            D4 && i(R3, { color: D4 });
          }
        });
      }, _3 = new dt2({
        initialState() {
          return I2({
            bgColor: "bg_color",
            headerColor: "header_bg_color",
            bottomBarColor: "bottom_bar_bg_color",
            isActive: true
          });
        },
        isPageReload: r2,
        onMounted: (d4) => {
          a(l3), u2.sub(m4), F3.setState(d4);
        },
        onUnmounted() {
          p2(l3), u2.unsub(m4);
        },
        restoreState: e.get
      });
      this.isMounted = _3.isMounted, this.mountFp = A3(() => {
        const d4 = () => {
        };
        return c2(_3.mount(), pt2(d4, d4));
      }, { isTma: o2, returns: "plain" }), this.mount = h4(this.mountFp), this.unmount = _3.unmount;
      const F3 = new tt3({
        initialState: {
          bgColor: "bg_color",
          bottomBarColor: "bottom_bar_bg_color",
          headerColor: "bg_color",
          isActive: false
        },
        onChange: e.set
      });
      this.state = F3.state;
      const g3 = (d4) => Y2(d4) ? d4 : O2(u2)[d4], S4 = (d4) => x(() => g3(d4()));
      this.isActive = F3.getter("isActive"), this.isSupported = x(() => [
        "web_app_set_header_color",
        "web_app_set_background_color",
        "web_app_set_bottom_bar_color"
      ].some((d4) => X3(d4, O2(n))));
      const v2 = S(false);
      this.isCssVarsBound = x(v2), this.bindCssVarsFp = A3((d4) => {
        if (v2())
          return V3(new Qt2());
        const [x4, R3] = lr(() => {
          v2.set(false);
        }), T4 = (D4, U3) => {
          const H5 = () => {
            Zt(D4, U3() || null);
          };
          H5(), x4(U3.sub(H5), Xt.bind(null, D4));
        };
        return d4 || (d4 = (D4) => `--tg-${ar(D4)}`), T4(d4("bgColor"), this.bgColorRgb), T4(d4("bottomBarColor"), this.bottomBarColorRgb), T4(d4("headerColor"), this.headerColorRgb), v2.set(true), I2(R3);
      }, { isTma: o2, returns: "either", isMounted: this.isMounted }), this.bindCssVars = h4(this.bindCssVarsFp);
      const f3 = (d4) => {
        const x4 = F3.getter(d4), R3 = S4(x4), T4 = {
          headerColor: "web_app_set_header_color",
          bgColor: "web_app_set_background_color",
          bottomBarColor: "web_app_set_bottom_bar_color"
        }[d4], D4 = A3(
          (U3) => {
            if (U3 === x4())
              return I2(void 0);
            if (T4 === "web_app_set_header_color" && (U3 === "bg_color" || U3 === "secondary_bg_color"))
              return c2(
                i("web_app_set_header_color", { color_key: U3 }),
                P3(() => {
                  F3.setState({ [d4]: U3 });
                })
              );
            const H5 = g3(U3);
            return c2(
              H5 ? i(T4, { color: H5 }) : V3(new rr2(U3)),
              P3(() => {
                F3.setState({ [d4]: H5 });
              })
            );
          },
          {
            isTma: o2,
            version: n,
            requires: T4,
            isMounted: this.isMounted,
            returns: "either",
            supports: d4 === "headerColor" ? {
              rgb: {
                method: "web_app_set_header_color",
                param: "color",
                shouldCheck: Y2
              }
            } : void 0
          }
        );
        return [x4, R3, h4(D4), D4];
      };
      [
        this.bgColor,
        this.bgColorRgb,
        this.setBgColor,
        this.setBgColorFp
      ] = f3("bgColor"), [
        this.headerColor,
        this.headerColorRgb,
        this.setHeaderColor,
        this.setHeaderColorFp
      ] = f3("headerColor"), [
        this.bottomBarColor,
        this.bottomBarColorRgb,
        this.setBottomBarColor,
        this.setBottomBarColorFp
      ] = f3("bottomBarColor");
      const b4 = E3({ isTma: o2, returns: "either" });
      this.closeFp = b4((d4) => i("web_app_close", { return_back: d4 })), this.close = h4(this.closeFp), this.readyFp = b4(() => i("web_app_ready")), this.ready = h4(this.readyFp);
    }
    //#endregion
  };
  var $r = new Tr({
    ...c2(
      C3(),
      L3,
      y4,
      et3("miniApp")
    ),
    offVisibilityChanged(s) {
      St("visibility_changed", s);
    },
    onVisibilityChanged(s) {
      be("visibility_changed", s);
    },
    theme: vt2.state
  });
  function Lr(s) {
    const e = s.message.trim(), r2 = (s.title || "").trim(), n = s.buttons || [];
    if (r2.length > 64)
      return V3(new Q4(`Invalid title: ${r2}`));
    if (!e || e.length > 256)
      return V3(new Q4(`Invalid message: ${e}`));
    if (n.length > 3)
      return V3(new Q4(`Invalid buttons count: ${n.length}`));
    const i = [];
    if (!n.length)
      i.push({ type: "close", id: "" });
    else
      for (let o2 = 0; o2 < n.length; o2++) {
        const u2 = n[o2], a = u2.id || "";
        if (a.length > 64)
          return V3(new Q4(`Button with index ${o2} has invalid id: ${a}`));
        if (!u2.type || u2.type === "default" || u2.type === "destructive") {
          const p2 = u2.text.trim();
          if (!p2 || p2.length > 64)
            return V3(new Q4(`Button with index ${o2} has invalid text: ${p2}`));
          i.push({ type: u2.type, text: p2, id: a });
        } else
          i.push({ type: u2.type, id: a });
      }
    return I2({ title: r2, message: e, buttons: i });
  }
  var Rr = class {
    constructor({ version: e, isTma: r2, request: n }) {
      t(this, "isOpened");
      t(this, "isSupported");
      t(this, "showFp");
      t(this, "show");
      const i = S(false), o2 = () => {
        i.set(false);
      }, u2 = E3({
        version: e,
        isTma: r2,
        requires: "web_app_open_popup",
        returns: "task"
      });
      this.isSupported = z2("web_app_open_popup", e), this.isOpened = x(i), this.showFp = u2((a) => c2(
        this.isOpened() ? $5(new zt("A popup is already opened")) : q5(void 0),
        at3(() => ve2(Lr(a))),
        Z3((p2) => (i.set(true), n("web_app_open_popup", "popup_closed", {
          ...a,
          params: p2
        }))),
        Wt2(
          (p2) => (o2(), p2),
          (p2) => (o2(), p2.button_id)
        )
      )), this.show = h4(this.showFp);
    }
  };
  var Un = new Rr(c2(C3(), G4, y4));
  function Pr({ request: s, ...e }) {
    return A3((r2) => c2(
      s("web_app_request_phone", "phone_requested", r2),
      B4((n) => n.status)
    ), { ...e, requires: "web_app_request_phone", returns: "task" });
  }
  var qe = Pr(c2(
    C3(),
    y4,
    G4
  ));
  var Gn = h4(qe);
  function Or({
    invokeCustomMethod: s,
    requestPhoneAccess: e,
    ...r2
  }) {
    const n = (u2) => c2(
      s("getRequestedContact", {}, {
        ...u2,
        timeout: (u2 || {}).timeout || 5e3
      }),
      at3((a) => {
        const p2 = safeParse(string(), a);
        if (!p2.success)
          return $5(new Ft2(a, p2.issues));
        if (!p2.output)
          return q5(void 0);
        const l3 = safeParse(
          W2(
            looseObject({
              contact: h2(looseObject({
                user_id: number(),
                phone_number: string(),
                first_name: string(),
                last_name: optional(string())
              })),
              auth_date: pipe(
                string(),
                transform((m4) => new Date(Number(m4) * 1e3)),
                date()
              ),
              hash: string()
            })
          ),
          p2.output
        );
        return l3.success ? q5({ raw: p2.output, parsed: l3.output }) : $5(new Ft2(p2.output, l3.issues));
      })
    ), i = (u2) => c2(
      n(u2),
      Gs(
        // All other errors except validation ones should be ignored. Receiving validation error
        // means that we have some data, but we are unable to parse it properly. So, there is no
        // need to make some more requests further, the problem is local.
        (a) => Ft2.is(a) ? V3(a) : I2(void 0),
        (a) => I2(a)
      )
    ), o2 = (u2) => ur(
      async (a, p2, l3) => {
        let m4 = 50;
        for (; !l3.isRejected; ) {
          const _3 = await i(l3)();
          if (_3._tag === "Left")
            return p2(_3.left);
          if (_3.right)
            return a(_3.right);
          await new Promise((F3) => setTimeout(F3, m4)), m4 += 50;
        }
      },
      u2
    );
    return A3((u2) => ur.fn((a) => c2(
      // Try to get the requested contact. Probably, we already requested it before.
      i(a),
      Z3((p2) => p2 ? q5(p2) : c2(
        e(a),
        at3((l3) => l3 === "sent" ? o2(a) : $5(new ye2("User denied access")))
      ))
    ), u2), { ...r2, returns: "task", requires: "web_app_request_phone" });
  }
  function Dr({ requestContact: s, ...e }) {
    return A3(
      s,
      { ...e, returns: "task", requires: "web_app_request_phone" }
    );
  }
  var Me = Or({
    ...c2(C3(), Yt, y4),
    requestPhoneAccess: qe
  });
  var jn = h4(Me);
  var Ur = Dr({
    ...c2(C3(), y4),
    requestContact(s) {
      return c2(
        Me(s),
        B4((e) => e.parsed)
      );
    }
  });
  var Hn = h4(Ur);
  function Gr({ request: s, ...e }) {
    return A3((r2) => c2(
      s("web_app_request_write_access", "write_access_requested", r2),
      B4((n) => n.status)
    ), { ...e, requires: "web_app_request_write_access", returns: "task" });
  }
  var jr = Gr(c2(
    C3(),
    y4,
    G4
  ));
  var Wn = h4(jr);
  var Hr = class {
    constructor({
      version: e,
      onClosed: r2,
      onTextReceived: n,
      isTma: i,
      postEvent: o2
    }) {
      t(this, "isOpened");
      t(this, "isSupported");
      t(this, "captureFp");
      t(this, "capture");
      t(this, "closeFp");
      t(this, "close");
      t(this, "openFp");
      t(this, "open");
      const u2 = { version: e, requires: "web_app_open_scan_qr_popup", isTma: i }, a = E3({ ...u2, returns: "either" }), p2 = E3({ ...u2, returns: "task" }), l3 = S(false), m4 = () => {
        l3.set(false);
      };
      this.isSupported = z2("web_app_open_scan_qr_popup", e), this.isOpened = x(l3), this.captureFp = p2((_3) => {
        let F3;
        return c2(
          this.openFp({
            ..._3,
            onCaptured: (g3) => {
              _3.capture(g3) && (F3 = g3, this.close());
            }
          }),
          B4(() => F3)
        );
      }), this.closeFp = a(() => c2(o2("web_app_close_scan_qr_popup"), P3(m4))), this.openFp = p2((_3) => c2(
        this.isOpened() ? $5(new zt("The QR Scanner is already opened")) : async () => o2("web_app_open_scan_qr_popup", { text: _3.text }),
        at3(() => {
          const [F3, g3] = lr(), S4 = (v2) => (g3(), v2);
          return c2(
            ur((v2) => {
              F3(r2(v2), n(_3.onCaptured));
            }, _3),
            Wt2(S4, S4)
          );
        })
      )), this.open = h4(this.openFp), this.capture = h4(this.captureFp), this.close = h4(this.closeFp);
    }
  };
  var Kn = new Hr({
    ...c2(C3(), L3, y4),
    onClosed(s) {
      return be("scan_qr_popup_closed", s);
    },
    onTextReceived(s) {
      return be("qr_text_received", (e) => {
        s(e.data);
      });
    }
  });
  var Wr = class {
    constructor({ defaults: e, ...r2 }) {
      t(this, "isSupported");
      t(this, "position");
      t(this, "bgColor");
      t(this, "hasShineEffect");
      t(this, "isEnabled");
      t(this, "isLoaderVisible");
      t(this, "isVisible");
      t(this, "isMounted");
      t(this, "state");
      t(this, "text");
      t(this, "textColor");
      t(this, "showFp");
      t(this, "show");
      t(this, "hideFp");
      t(this, "hide");
      t(this, "enableFp");
      t(this, "enable");
      t(this, "enableShineEffectFp");
      t(this, "enableShineEffect");
      t(this, "disableFp");
      t(this, "disable");
      t(this, "disableShineEffectFp");
      t(this, "disableShineEffect");
      t(this, "setBgColorFp");
      t(this, "setBgColor");
      t(this, "setTextColorFp");
      t(this, "setTextColor");
      t(this, "setTextFp");
      t(this, "setText");
      t(this, "setPositionFp");
      t(this, "setPosition");
      t(this, "showLoaderFp");
      t(this, "showLoader");
      t(this, "hideLoaderFp");
      t(this, "hideLoader");
      t(this, "setParamsFp");
      t(this, "setParams");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      t(this, "onClickFp");
      t(this, "onClick");
      t(this, "offClickFp");
      t(this, "offClick");
      const n = new kt2({
        ...r2,
        initialState: {
          hasShineEffect: false,
          isEnabled: true,
          isLoaderVisible: false,
          isVisible: false,
          text: "Cancel",
          position: "left"
        },
        method: "web_app_setup_secondary_button",
        payload: (o2) => ({
          has_shine_effect: o2.hasShineEffect,
          is_visible: o2.isVisible,
          is_active: o2.isEnabled,
          is_progress_visible: o2.isLoaderVisible,
          text: o2.text,
          color: o2.bgColor,
          text_color: o2.textColor,
          position: o2.position
        })
      }), i = (o2, u2) => {
        const a = n.stateGetter(o2);
        return x(() => a() || O2(u2));
      };
      this.isSupported = z2("web_app_setup_secondary_button", r2.version), this.bgColor = i("bgColor", e.bgColor), this.textColor = i("textColor", e.textColor), this.position = n.stateGetter("position"), this.hasShineEffect = n.stateGetter("hasShineEffect"), this.isEnabled = n.stateGetter("isEnabled"), this.isLoaderVisible = n.stateGetter("isLoaderVisible"), this.text = n.stateGetter("text"), this.isVisible = n.stateGetter("isVisible"), this.isMounted = n.isMounted, this.state = n.state, [this.setPosition, this.setPositionFp] = n.stateSetters("position"), [this.setBgColor, this.setBgColorFp] = n.stateSetters("bgColor"), [this.setTextColor, this.setTextColorFp] = n.stateSetters("textColor"), [
        [this.disableShineEffect, this.disableShineEffectFp],
        [this.enableShineEffect, this.enableShineEffectFp]
      ] = n.stateBoolSetters("hasShineEffect"), [
        [this.disable, this.disableFp],
        [this.enable, this.enableFp]
      ] = n.stateBoolSetters("isEnabled"), [
        [this.hideLoader, this.hideLoaderFp],
        [this.showLoader, this.showLoaderFp]
      ] = n.stateBoolSetters("isLoaderVisible"), [this.setText, this.setTextFp] = n.stateSetters("text"), [[this.hide, this.hideFp], [this.show, this.showFp]] = n.stateBoolSetters("isVisible"), this.setParams = n.setState, this.setParamsFp = n.setStateFp, this.onClick = n.onClick, this.onClickFp = n.onClickFp, this.offClick = n.offClick, this.offClickFp = n.offClickFp, this.mount = n.mount, this.mountFp = n.mountFp, this.unmount = n.unmount;
    }
    //#endregion
  };
  var Qn = new Wr(
    xe2("secondaryButton", "secondary_button_pressed", {
      bgColor: x(() => $r.bottomBarColorRgb() || "#000000"),
      textColor: x(() => vt2.buttonColor() || "#2481cc")
    })
  );
  var Kr = class {
    constructor(e) {
      t(this, "isVisible");
      t(this, "isMounted");
      t(this, "isSupported");
      t(this, "hideFp");
      t(this, "hide");
      t(this, "showFp");
      t(this, "show");
      t(this, "onClickFp");
      t(this, "onClick");
      t(this, "offClickFp");
      t(this, "offClick");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      const r2 = new kt2({
        ...e,
        method: "web_app_setup_settings_button",
        payload: (n) => ({ is_visible: n.isVisible }),
        initialState: { isVisible: false }
      });
      this.isVisible = r2.stateGetter("isVisible"), this.isMounted = r2.isMounted, this.isSupported = r2.isSupported, [[this.hide, this.hideFp], [this.show, this.showFp]] = r2.stateBoolSetters("isVisible"), this.onClick = r2.onClick, this.onClickFp = r2.onClickFp, this.offClick = r2.offClick, this.offClickFp = r2.offClickFp, this.mount = r2.mount, this.mountFp = r2.mountFp, this.unmount = r2.unmount;
    }
  };
  var zn = new Kr(
    Nt2("settingsButton", "settings_button_pressed")
  );
  var Qr = class {
    constructor({ postEvent: e, storage: r2, isTma: n, isPageReload: i, version: o2 }) {
      t(this, "isSupported");
      t(this, "isVerticalEnabled");
      t(this, "isMounted");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "unmount");
      t(this, "disableVerticalFp");
      t(this, "disableVertical");
      t(this, "enableVerticalFp");
      t(this, "enableVertical");
      const u2 = { isVerticalEnabled: true }, a = new tt3({
        initialState: u2,
        onChange(g3) {
          r2.set(g3);
        }
      }), p2 = new dt2({
        initialState: u2,
        isPageReload: i,
        onMounted: a.setState,
        restoreState: r2.get
      }), l3 = { requires: "web_app_setup_swipe_behavior", isTma: n, version: o2 }, m4 = E3({
        ...l3,
        returns: "plain"
      }), _3 = E3({
        ...l3,
        isMounted: p2.isMounted,
        returns: "either"
      }), F3 = (g3) => {
        const S4 = { isVerticalEnabled: g3 };
        return a.hasDiff(S4) ? c2(
          e("web_app_setup_swipe_behavior", { allow_vertical_swipe: g3 }),
          P3(() => {
            a.setState(S4);
          })
        ) : I2(void 0);
      };
      this.isSupported = z2("web_app_setup_swipe_behavior", o2), this.isVerticalEnabled = a.getter("isVerticalEnabled"), this.isMounted = p2.isMounted, this.disableVerticalFp = _3(() => F3(false)), this.enableVerticalFp = _3(() => F3(true)), this.mountFp = m4(() => {
        const g3 = () => {
        };
        return c2(p2.mount(), pt2(g3, g3));
      }), this.unmount = p2.unmount, this.disableVertical = h4(this.disableVerticalFp), this.enableVertical = h4(this.enableVerticalFp), this.mount = h4(this.mountFp);
    }
  };
  var Nn = new Qr(c2(
    C3(),
    L3,
    y4,
    et3("swipeBehavior")
  ));
  function zr({ request: s, ...e }) {
    return A3((r2, n, i) => c2(
      s(
        "web_app_request_file_download",
        "file_download_requested",
        { ...i, params: { url: r2, file_name: n } }
      ),
      Z3((o2) => o2.status === "downloading" ? q5(void 0) : $5(new ye2("User denied the action")))
    ), { ...e, requires: "web_app_request_file_download", returns: "task" });
  }
  var Nr = zr(c2(
    C3(),
    G4,
    y4
  ));
  var Yn = h4(Nr);
  function Jr({ invokeCustomMethod: s, ...e }) {
    return A3((r2) => c2(
      s("getCurrentTime", {}, r2),
      Z3((n) => {
        const i = safeParse(
          pipe(number(), integer(), transform((o2) => new Date(o2 * 1e3)), date()),
          n
        );
        return i.success ? q5(i.output) : $5(new Ft2(n, i.issues));
      })
    ), { ...e, requires: "web_app_invoke_custom_method", returns: "task" });
  }
  var Yr = Jr(c2(
    C3(),
    Yt,
    y4
  ));
  var Zn = h4(Yr);
  function Zr({ postEvent: s, ...e }) {
    return A3(() => s("web_app_hide_keyboard"), { ...e, returns: "either", requires: "web_app_hide_keyboard" });
  }
  var Xr = Zr(c2(
    C3(),
    L3,
    y4
  ));
  var Xn = h4(Xr);
  function tn({ request: s, createRequestId: e, ...r2 }) {
    return A3((n) => {
      const i = e();
      return c2(
        s("web_app_read_text_from_clipboard", "clipboard_text_received", {
          ...n,
          params: { req_id: i },
          capture: Wt(i)
        }),
        B4(({ data: o2 = null }) => o2)
      );
    }, { ...r2, requires: "web_app_read_text_from_clipboard", returns: "task" });
  }
  var en = tn({
    ...c2(
      C3(),
      y4,
      G4
    ),
    createRequestId: Ae
  });
  var to = h4(en);
  function rn({ postEvent: s, ...e }) {
    return A3((r2) => {
      const { size: n } = new Blob([r2]);
      return !n || n > 4096 ? V3(
        new Q4(n ? "Maximum size of data to send is 4096 bytes" : "Attempted to send empty data")
      ) : s("web_app_data_send", { data: r2 });
    }, { ...e, returns: "either" });
  }
  var nn = rn(c2(C3(), L3));
  var so = h4(nn);
  function on({ request: s, ...e }) {
    return A3((r2, n) => c2(
      s(
        "web_app_send_prepared_message",
        ["prepared_message_failed", "prepared_message_sent"],
        {
          ...n,
          params: { id: r2 }
        }
      ),
      Z3((i) => i && "error" in i ? $5(new sr2(i.error)) : q5(void 0))
    ), { ...e, requires: "web_app_send_prepared_message", returns: "task" });
  }
  var an = on(c2(
    C3(),
    G4,
    y4
  ));
  var ro = h4(an);
  function un({ postEvent: s, ...e }) {
    return A3((r2, n = {}) => s("web_app_share_to_story", {
      text: n.text,
      media_url: r2,
      widget_link: n.widgetLink
    }), { ...e, requires: "web_app_share_to_story", returns: "either" });
  }
  var cn = un(c2(
    C3(),
    L3,
    y4
  ));
  var no = h4(cn);
  var $t2 = /* @__PURE__ */ _t2(false);
  function ln({ isInlineMode: s, postEvent: e, ...r2 }) {
    return A3((n, i) => e("web_app_switch_inline_query", {
      query: n,
      chat_types: i || []
    }), {
      ...r2,
      requires: {
        every: ["web_app_switch_inline_query", () => O2(s) ? void 0 : "The application must be launched in the inline mode"]
      },
      returns: "either"
    });
  }
  var pn = ln({
    ...c2(
      C3(),
      L3,
      y4
    ),
    isInlineMode: $t2
  });
  var oo = h4(pn);
  var hn = class {
    constructor({
      storage: e,
      isPageReload: r2,
      onContentSafeAreaInsetsChanged: n,
      onSafeAreaInsetsChanged: i,
      onViewportChanged: o2,
      onFullscreenChanged: u2,
      offContentSafeAreaInsetsChanged: a,
      offFullscreenChanged: p2,
      offSafeAreaInsetsChanged: l3,
      offViewportChanged: m4,
      request: _3,
      isViewportStable: F3,
      isFullscreen: g3,
      isTma: S4,
      version: v2,
      postEvent: f3
    }) {
      t(this, "state");
      t(this, "height");
      t(this, "stableHeight");
      t(this, "width");
      t(this, "isExpanded");
      t(this, "isStable", x(() => this.height() === this.stableHeight()));
      t(this, "contentSafeAreaInsets");
      t(this, "contentSafeAreaInsetTop");
      t(this, "contentSafeAreaInsetLeft");
      t(this, "contentSafeAreaInsetRight");
      t(this, "contentSafeAreaInsetBottom");
      t(this, "safeAreaInsets");
      t(this, "safeAreaInsetTop");
      t(this, "safeAreaInsetLeft");
      t(this, "safeAreaInsetRight");
      t(this, "safeAreaInsetBottom");
      t(this, "isFullscreen");
      t(this, "requestFullscreenFp");
      t(this, "requestFullscreen");
      t(this, "exitFullscreenFp");
      t(this, "exitFullscreen");
      t(this, "isCssVarsBound");
      t(this, "bindCssVarsFp");
      t(this, "bindCssVars");
      t(this, "isMounted");
      t(this, "mountFp");
      t(this, "mount");
      t(this, "expandFp");
      t(this, "expand");
      const b4 = { top: 0, right: 0, left: 0, bottom: 0 }, d4 = new tt3({
        initialState: {
          contentSafeAreaInsets: b4,
          height: 0,
          isExpanded: false,
          isFullscreen: false,
          safeAreaInsets: b4,
          stableHeight: 0,
          width: 0
        },
        onChange: e.set
      }), x4 = (k4) => {
        d4.setState({
          isExpanded: k4.is_expanded,
          height: k4.height,
          width: k4.width,
          stableHeight: k4.is_state_stable ? k4.height : void 0
        });
      }, R3 = (k4) => {
        d4.setState({ isFullscreen: k4.is_fullscreen });
      }, T4 = (k4) => {
        d4.setState({ safeAreaInsets: k4 });
      }, D4 = (k4) => {
        d4.setState({ contentSafeAreaInsets: k4 });
      }, U3 = new Jt2({
        initialState(k4) {
          const st2 = (N3) => () => {
            const [X4, W3] = N3 === "safe-area" ? ["web_app_request_safe_area", "safe_area_changed"] : ["web_app_request_content_safe_area", "content_safe_area_changed"];
            return X3(X4, O2(v2)) ? _3(X4, W3, k4) : q5({ top: 0, left: 0, right: 0, bottom: 0 });
          }, M5 = (N3) => () => typeof N3 == "boolean" ? q5(N3) : ve2(N3());
          return c2(
            Js,
            wt2("safeAreaInsets", st2("safe-area")),
            wt2("contentSafeAreaInsets", st2("content-safe-area")),
            wt2("isFullscreen", M5(g3)),
            wt2("isViewportStable", M5(F3)),
            at3(({ isViewportStable: N3, ...X4 }) => N3 ? q5({
              ...X4,
              height: window.innerHeight,
              isExpanded: true,
              stableHeight: window.innerHeight,
              width: window.innerWidth
            }) : c2(
              _3("web_app_request_viewport", "viewport_changed", k4),
              B4((W3) => ({
                ...X4,
                height: W3.height,
                isExpanded: W3.is_expanded,
                stableHeight: W3.is_state_stable ? W3.height : 0,
                width: W3.width
              }))
            ))
          );
        },
        isPageReload: r2,
        onMounted(k4) {
          o2(x4), u2(R3), i(T4), n(D4), d4.setState(k4);
        },
        onUnmounted() {
          m4(x4), p2(R3), l3(T4), a(D4);
        },
        restoreState: e.get
      }), H5 = (k4) => x(() => this.safeAreaInsets()[k4]), bt2 = (k4) => x(() => this.contentSafeAreaInsets()[k4]);
      this.state = d4.state, this.height = d4.getter("height"), this.stableHeight = d4.getter("stableHeight"), this.width = d4.getter("width"), this.isExpanded = d4.getter("isExpanded"), this.safeAreaInsets = d4.getter("safeAreaInsets"), this.safeAreaInsetTop = H5("top"), this.safeAreaInsetBottom = H5("bottom"), this.safeAreaInsetLeft = H5("left"), this.safeAreaInsetRight = H5("right"), this.contentSafeAreaInsets = d4.getter("contentSafeAreaInsets"), this.contentSafeAreaInsetTop = bt2("top"), this.contentSafeAreaInsetBottom = bt2("bottom"), this.contentSafeAreaInsetLeft = bt2("left"), this.contentSafeAreaInsetRight = bt2("right");
      const Ve2 = E3({ isTma: S4, returns: "task" }), te = E3({
        isTma: S4,
        returns: "either"
      }), Te = E3({
        isTma: S4,
        requires: "web_app_request_fullscreen",
        version: v2,
        returns: "task"
      }), ee = (k4) => Te((st2) => c2(
        _3(
          k4 ? "web_app_request_fullscreen" : "web_app_exit_fullscreen",
          ["fullscreen_changed", "fullscreen_failed"],
          st2
        ),
        Z3((M5) => "error" in M5 && M5.error !== "ALREADY_FULLSCREEN" ? $5(new er2(M5.error)) : (d4.setState({ isFullscreen: "is_fullscreen" in M5 ? M5.is_fullscreen : true }), q5(void 0)))
      ));
      this.isMounted = U3.isMounted, this.mountFp = Ve2(U3.mount), this.mount = h4(this.mountFp), this.isFullscreen = d4.getter("isFullscreen"), this.requestFullscreenFp = ee(true), this.requestFullscreen = h4(this.requestFullscreenFp), this.exitFullscreenFp = ee(false), this.exitFullscreen = h4(this.exitFullscreenFp);
      const gt3 = S(false);
      this.isCssVarsBound = x(gt3), this.bindCssVarsFp = te(
        (k4) => {
          if (gt3())
            return V3(new Qt2());
          k4 || (k4 = (M5) => `--tg-viewport-${ar(M5)}`);
          const st2 = [
            ["height", this.height],
            ["stableHeight", this.stableHeight],
            ["width", this.width],
            ["safeAreaInsetTop", this.safeAreaInsetTop],
            ["safeAreaInsetBottom", this.safeAreaInsetBottom],
            ["safeAreaInsetLeft", this.safeAreaInsetLeft],
            ["safeAreaInsetRight", this.safeAreaInsetRight],
            ["contentSafeAreaInsetTop", this.contentSafeAreaInsetTop],
            ["contentSafeAreaInsetBottom", this.contentSafeAreaInsetBottom],
            ["contentSafeAreaInsetLeft", this.contentSafeAreaInsetLeft],
            ["contentSafeAreaInsetRight", this.contentSafeAreaInsetRight]
          ].reduce((M5, [N3, X4]) => {
            const W3 = k4(N3);
            if (W3) {
              const se2 = () => {
                Zt(W3, `${X4()}px`);
              };
              M5.push({ update: se2, removeListener: X4.sub(se2), cssVar: W3 });
            }
            return M5;
          }, []);
          return st2.forEach((M5) => {
            M5.update();
          }), gt3.set(true), I2(() => {
            st2.forEach((M5) => {
              M5.removeListener(), Xt(M5.cssVar);
            }), gt3.set(false);
          });
        }
      ), this.bindCssVars = h4(this.bindCssVarsFp), this.expandFp = te(() => f3("web_app_expand")), this.expand = h4(this.expandFp);
    }
    //#endregion
  };
  function dn() {
    const s = (o2) => ({
      on: (u2) => {
        be(o2, u2);
      },
      off: (u2) => {
        St(o2, u2);
      }
    }), e = s("viewport_changed"), r2 = s("fullscreen_changed"), n = s("safe_area_changed"), i = s("content_safe_area_changed");
    return new hn({
      ...c2(
        C3(),
        et3("viewport"),
        y4,
        L3,
        G4
      ),
      isFullscreen() {
        return c2(Et(), P3((o2) => !!o2.tgWebAppFullscreen));
      },
      isViewportStable() {
        return c2(Et(), P3((o2) => ["macos", "tdesktop", "unigram", "webk", "weba", "web"].includes(o2.tgWebAppPlatform)));
      },
      offContentSafeAreaInsetsChanged: i.off,
      offFullscreenChanged: r2.off,
      offSafeAreaInsetsChanged: n.off,
      offViewportChanged: e.off,
      onContentSafeAreaInsetsChanged: i.on,
      onFullscreenChanged: r2.on,
      onSafeAreaInsetsChanged: n.on,
      onViewportChanged: e.on
    });
  }
  var io = dn();
  function fn(s = {}) {
    const {
      version: e,
      isInlineMode: r2,
      themeParams: n
    } = s;
    if (e && typeof r2 == "boolean" && n)
      Vt.set(e), $t2.set(r2), Tt2.set(n);
    else {
      const a = c2(Et(), we2(
        (p2) => p2,
        (p2) => {
          Vt.set(e || p2.tgWebAppVersion), $t2.set(typeof r2 == "boolean" ? r2 : !!p2.tgWebAppBotInline), Tt2.set(n || p2.tgWebAppThemeParams);
        }
      ));
      if (a)
        return V3(a);
    }
    s.postEvent && ke.set(s.postEvent);
    const [i, o2] = lr(
      be("reload_iframe", () => {
        h3().log("Received a request to reload the page"), ur2("iframe_will_reload"), window.location.reload();
      })
    ), { acceptCustomStyles: u2 = true } = s;
    if (u2) {
      const a = document.createElement("style");
      a.id = "telegram-custom-styles", document.head.appendChild(a), i(
        be("set_custom_style", (p2) => {
          a.innerHTML = p2;
        }),
        () => {
          document.head.removeChild(a);
        }
      );
    }
    return c2(
      mt3("iframe_ready", { reload_supported: true }),
      P3(() => (h3().log("The package was initialized"), o2))
    );
  }
  var ao = gr(fn);

  // src/telegram.ts
  var Telegram = class {
    // ждём, пока inset'ы станут ненулевыми или viewport развернётся
    static async waitViewportReady(timeout = 1500, interval = 50) {
      const start = Date.now();
      return new Promise((resolve) => {
        const tick = () => {
          const s = io.safeAreaInsets?.();
          const ready = io.isExpanded && io.isExpanded() || s && (s.top || s.bottom || s.left || s.right);
          if (ready || Date.now() - start > timeout) return resolve();
          setTimeout(tick, interval);
        };
        tick();
      });
    }
    static {
      this.inited = false;
    }
    static async Init() {
      if (this.inited) return;
      try {
        ao();
        $r.mount();
        console.log(`mounet=${$r.isMounted()}`);
        io.mount();
        io.bindCssVars();
        Nn.mount();
        Nn.disableVertical();
        await this.waitViewportReady();
        this.FullScreen();
        this.inited = true;
        console.log("Running inside Telegram WebApp");
      } catch (ex) {
        console.log("Telegram Mini App SDK init error", ex);
      }
    }
    static IsAvailable() {
      if (this.inited) {
        return true;
      }
      return false;
    }
    static async FullScreen() {
      if (this.inited) return true;
      try {
        io.expand();
        if (!io.isFullscreen()) {
          await io.requestFullscreen();
        }
      } catch (ex) {
        console.log("Telegram FullScreen error", ex);
      }
    }
    static GetSafeArea() {
      if (!io.isFullscreen()) {
        return { top: 0, left: 0, width: 0, height: 0 };
      }
      console.log(`viewport.height = ${io.height()}`);
      console.log(`viewport.stableHeight ${io.stableHeight()}`);
      console.log("Safe area:", io.safeAreaInsets());
      console.log("Safe area insets:", io.contentSafeAreaInsets());
      return io.contentSafeAreaInsets();
    }
    static GetSize() {
      try {
        return { width: io.width(), height: io.height() };
      } catch {
        return { width: window.innerWidth, height: window.innerHeight };
      }
    }
  };
  window.Telegram = Telegram;
  return __toCommonJS(telegram_exports);
})();
