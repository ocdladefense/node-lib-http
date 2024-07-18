export default class HttpCache {

    cache = {};

    put(req, resp) {

        let key = req.method + req.url;
        //let lang = req.getHeaders("accept-language");
        //key = key + "-" + lang;
        HttpCache.cache[key] = resp;
    }

    get(req) {
        let key = req.url;

        return HttpCache.cache[key] || null;
    }

    // Stay compatible with other cache interfaces.
    match(req) {
        return HttpCache.get(req);
    }


}