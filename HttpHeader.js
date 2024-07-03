
export default class HttpHeader {
  constructor(name, value) {
    this.name = name;
    this.values = HttpHeader.parseValues(value);
  }

  // 1. theres 1 value, no commas: pass
  // 2. theres multiple value, commas: pass
  // 3. some of those values are parameters, semicolons and commas:
  // 4. some of those parameters have values, semicolons, commas, and equals:

  static parseValues(value) {
    let map = {};
    let values = value.split(",");
    if (values.length == 1) return values[0];

    for (let i = 0; i < values.length; i++) {
      let current = values[i];
      let [k, v] = current.split("="); // at index 0, when no "=", k = current, v = undefined
      map[k] = v;
    }

    return map;
  }

  static parseHeader(value) {
    let map = {};
    let values = value.split(",");

    // Get rid of any leading or trailing whitespace.
    return values.map((value) => Foobar.parseHeaderField(value.trim()));
  }

  // Parse a string in accordance with the HTTP header field syntax.
  // including values that might have one or more parameters.
  // Remember parameter can be boolean.
  static parseHeaderField(str) {
    let isParam = str.includes("=");
    // simplest implementation, just return the text that was in the comma.
    return isParam ? Foobar.parseParam(str) : str;
  }

  // Parse a string in accordance with the HTTP header param syntax.
  static parseParam(str) {
    let map = {};
    let [k, v] = str.split("=");
    map[k] = v;

    return map;
  }

  /**
   *
   * @returns {bool}
   */
  hasValue(v) {
    // if v doesn't exist, it returns undefined which is falsy
    return this.values.hasOwnProperty(v);
  }

  getParameter(k) {
    return this.values[k];
  }

  getName() {
    return this.name;
  }
} 