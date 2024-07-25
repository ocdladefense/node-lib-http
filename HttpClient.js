import HttpCache from "./caches/HttpCache.js";
import LocalStorageCache from "./caches/LocalStorageCache.js";
import Url from "./Url.js";
import HttpHeader from "./HttpHeader.js";


console.log("I am local HTTP module");

export default class HttpClient {

  // Store references to mocking classes.
  // Mocking classes are registered against domains.
  static mocks = {};

  // For performance reasons, store outbound requests.
  // This enables what would otherwise be multiple requests to
  // the same URL to resolve to the same fetch request.
  static outbound = {};


  /**
   * 
   * @param {Request} req 
   * @returns Response
   */


  /*
  @param cacheOptions - Object with two keys: 'cache' and 'params'. Constructor is the name of our cache implementation. Params is an object that will be passed to that constructor.
  */
  constructor(config = {}) {
    // Turns on and off hashing
    this.debug = config.debug || false;
    let cache = config['cacheOptions'] || null;
    this.cache = cache ? new cache['cache'](cache['params']) : null; // Dynamically instantiate our cache service from the config. Leave null to use browser cache.
  }


  send(req) {
    if (navigator.onLine == false) {
      throw new Error("Network offline.");
    }

      
    // Will hold any reference to a mocking class for the request.
    let mock;

    // Will hold a reference to the cached response, if there is one.
    let cached; 

    // Reference to the pending outbound request.
    let pending;

    // Key for our cache. If we are debugging, don't hash it. Otherwise, hash it.
    let key = this.debug ? req.method + req.url : HttpClient.cyrb53(req.method + req.url);

    // Get the cache control from our request headers. If there is no cache control, use an empty string.
    let cacheHeader = req.headers.get("cache-control") || "";
    let cacheControl = new HttpHeader(
      "cache-control",
      cacheHeader
    );

    // Store our complex condition in a variable. If the request is a GET, we have a caching solution, and the cache control doesn't specify no-cache.
    let usingCaching = req.method == "GET" && this.cache && !cacheControl.hasValue("no-cache"); 

    try {

      mock = this.getMock(req);

      if(mock)
      {
        return mock.getResponse(req);
      }


      // Check the cache for a response.
      if (usingCaching)
      {
        // cached = HttpCache.get(req);
        // check the cache for a matching response;
        // if nothing's there we return null.
        cached = this.cache.match(key);
        // Prefer a completed response, if one already happens to be in the cache.
        if(cached) return cached;
      }


      // If there is a pending request to the same URL, return it.
      if (HttpClient.outbound[key])
      {
        return HttpClient.outbound[key];
      }


      // If we've made it this far, we need to go to the network to get the resource.
      pending = fetch(req).then((resp) => {

        // Remove the pending request, as we've now fulfilled it.
        delete HttpClient.outbound[key];


        // If we are using caching, store the response in the cache.
        if (usingCaching) {
            this.cache.put(key, resp.clone());
        } 


        return resp;
      });


      // Store the pending request.
      // This will prevent multiple unfulfilled requests to the same URL.
      HttpClient.outbound[key] = pending;


      return pending;

    } catch (e) {

      console.error(e);
      if (req.headers.get("Accept") == "application/json") {
        return Response.json({
          success: false,
          error: true,
          code: e.cause,
          message: e.message
        }, {status: 500});
      }

      else return new Response(e.message, {status: 500});
    }


  }

  static register(domain, mock) {
    let url = new Url(domain);
    domain = url.getDomain();

    HttpClient.mocks[domain] = mock;
  }

  getMock(req) {
    let url = new Url(req.url);
    let domain = url.getDomain();

    return HttpClient.mocks[domain];
  }

  static cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

}





