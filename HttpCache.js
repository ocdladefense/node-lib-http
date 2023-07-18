export { HttpCache }


class HttpCache {

    static cache = {};

    static add(req, resp) {

        let key = req.url;
        //let lang = req.getHeaders("accept-language");
        //key = key + "-" + lang;
        HttpCache.cache[key] = resp;
    }

    static get(req) {
        let key = req.url;
        if (HttpCache.cache[key]) {
            return HttpCache.cache[key];
        }
        else {
            return null;
        }

        //return this.cache[key] ? this.cache[key] : null;
    }


}