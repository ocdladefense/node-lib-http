
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
        let values = value.split(",").trim();
        if (values.length == 1) return values[0];

        for (let i = 0; i < values.length; i++) {
            let current = values[i];
            let [k,v] = current.split("="); // at index 0, when no "=", k = current, v = undefined
            map[k] = v;
        }

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