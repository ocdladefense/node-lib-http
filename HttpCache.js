export { HttpCache }


class HttpCache {

    cache = {};

    static add(key, value) {
        cache[key] = value;
    }

    static get(key) {
        return cache[key];
    }


}