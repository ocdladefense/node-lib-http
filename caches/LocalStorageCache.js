import LocalStorageResponse from "./LocalStorage/LocalStorageResponse.js";
import LocalStorage from "./LocalStorage/LocalStorage.js";


export default class LocalStorageCache {
    // @params: refresh - If refresh is specified, the cache will be refreshed every refresh seconds.
    constructor(config = {}) {
        this.refreshTime = config.refresh || null;
    }
    put(key, httpResp) {
        let expires = this.refreshTime >= 0 ? Date.now() + (this.refreshTime * 1000) : false
        let resp = LocalStorageResponse.fromHttpResponse(httpResp, expires);
        resp.then( resp => {      
            let localStorage = new LocalStorage();
            localStorage.setValue(key, resp.toString());
        });
    }

    get(key) {
        const localStorageParams = {
            defaults: {
                [key]: null
            }
        };

        // We get the value of the key. If there is nothing, we expect to get back null.
        let localStorage = new LocalStorage(localStorageParams);
        let json = localStorage.getValue(key);

        if (json) {
            let cachedResp;
            cachedResp = LocalStorageResponse.fromJson(json);
            if (LocalStorageCache.isResponseFresh(cachedResp))
                return cachedResp.toResponse();
        }
        
        return null;

    }

    match(key) {
        return this.get(key);
    }

    // Returns true if the cached response is fresh: i.e. not stale.
    static isResponseFresh(entry) {
        let expires = entry.expires;
        if (!expires) return true;
        return Date.now() < new Date(expires).getTime();
    }
}