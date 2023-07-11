export { Url };
const PATH_SEPARATOR = "/";
const QUERYSTRING_SEPARATOR = "?";
class Url {
    url = null;
    scheme = "http";
    domain = null;
    path = "";
    query = {};
    constructor(url) {
        this.url = url;
        //let re = /:\/\/ | ? | #/mis;
        let re = /:\/\/|\?/gis;
        let parts = this.url.split(re);
        this.scheme = parts.shift();
        let qs;
        if (parts.length == 2) {
            qs = parts.pop();
        }
        let d = parts[0];
        parts = d.split(PATH_SEPARATOR);
        this.domain = parts.shift();
        this.path = PATH_SEPARATOR + parts.join(PATH_SEPARATOR);
        if (qs != null) {
            this.query = Url.parseQueryString(qs);
        }


    }
    //https://www.googleapis.com/calendar/v3/calendars/biere-library@thebierelibrary.com/events?timeMin=2023-07-01&timeMax=2023=07-15&test
    static parseQueryString(qs) {
        let queryParts = qs.split("&");
        let query = {};
        for (let i = 0; i < queryParts.length; i++) {
            let kvp = queryParts[i];
            let parts = kvp.split("=");
            let key = parts[0];
            let value = parts[1];
            query[key] = value;
        }

        return query;
    }

    static formatQueryString(obj) {
        let params = [];
        for (let prop in obj) {
            let kvp;
            kvp = prop + "=" + obj[prop];
            params.push(kvp);
        };
        return params.join("&");
    }

    getDomain() {
        return this.domain;
    }

    getScheme() {
        return this.scheme;
    }

    getPath() {
        return this.path;
    }

    getQuery() {
        return this.query;
    }

    buildQuery(key, value) {
        this.query[key] = value;
    }

    toString() {
        let queryString = "";
        let fragment = "";

        let kvpa = [];
        // start with our query object and build a string
        for (var prop in this.query) {

            let value = this.query[prop];
            let kvp = !value ? prop : (prop + "=" + this.query[prop]);
            kvpa.push(kvp);
        }

        queryString = !kvpa.length ? "" : ("?" + kvpa.join("&"));

        return this.scheme + "://" + this.domain + "/" + this.path + queryString + fragment;
    }
} 