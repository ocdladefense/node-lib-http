export { HttpCache }


class HttpCache {

    cache = {};

    constructor(data) {
        for (var key in data) {
            this.cache[key] = Response.json(data);
        }
    }


}