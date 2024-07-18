export default class HttpCache {

    static cache = {};

    static put(req, resp) {

        let key = req.method + req.url;
        //let lang = req.getHeaders("accept-language");
        //key = key + "-" + lang;
        HttpCache.cache[key] = resp;
    }

    static get(req) {
        let key = req.url;

        return HttpCache.cache[key] || null;
    }


}