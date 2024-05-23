
const URL_SCHEME_SEPARATOR = "://";

const URL_PATH_SEPARATOR = "/";

const URL_QUERYSTRING_SEPARATOR = "?";

const URL_FRAGMENT_SEPARATOR = "#";

const SCHEME_HTTP = "http";

const SCHEME_HTTPS = "https";

const SCHEME_FILE = "file";


export default class Url {
    
    url = null;

    scheme = SCHEME_HTTP;

    domain = null;

    path = "";

    query = {};

    constructor(url) {

        this.url = url;
        
        let re = /:\/\/|\?/gis;

        let parts = this.url.split(re);

        this.scheme = parts.shift();

        let qs;

        if (parts.length == 2) {
            qs = parts.pop();
        }

        let d = parts[0];

        parts = d.split(URL_PATH_SEPARATOR);

        this.domain = parts.shift();

        this.path = URL_PATH_SEPARATOR + parts.join(URL_PATH_SEPARATOR);
        
        if (qs != null) {
            this.query = Url.parseQueryString(qs);
        }
    }

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

        queryString = !kvpa.length ? "" : (URL_QUERYSTRING_SEPARATOR + kvpa.join("&"));

        return this.scheme + URL_SCHEME_SEPARATOR + this.domain + this.path + queryString + fragment;
    }
} 