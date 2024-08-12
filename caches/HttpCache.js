export default class HttpCache {

    static cache = {};

    put(key, resp) {
        HttpCache.cache[key] = resp;
    }

    get(key) {
        return HttpCache.cache[key] || null;
    }

    // Stay compatible with other cache interfaces.
    match(key) {
        return this.get(key);
    }


}