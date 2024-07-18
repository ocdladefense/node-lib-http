import HttpCache from "./HttpCache.js";
import LocalStorageCache from "./LocalStorageCache.js";
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
  @param cache - Name of a class that implements the HttpCache interface.
  */
// local, always, never, or empty string
  constructor(config) {
    let cacheType = config.cache || null;
    this.cache = new cacheType(); // Dynamically instantiate our cache service from the config.        
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

    
    let key = req.method + req.url;


    try {

      mock = this.getMock(req);

      if(mock)
      {
        return mock.getResponse(req);
      }






      // Check the cache for a response.
      if (req.method == "GET")
      {

        
        // cached = HttpCache.get(req);
        // check the cache for a matching response;
        // if nothing's there we return null.
       cached = this.cache.match(req);
        // Prefer a completed response, if one already happens to be in the cache.
        if(cached && this.isResponseFresh(cached)) return cached;
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


        // Get our cache-control if it exists.
        let cacheControl = new HttpHeader(
          "cache-control",
          req.headers.get("cache-control") || ""
        );
  
        // Do not cache if response has a cache-control value called no-cache
        // or if the method is anything but GET.

        if (req.method == "GET" && !cacheControl.hasValue("no-cache")) {
        // If we are using local storage caching, intercept the cache put and use local storage cache instead following the same logic of no-cache.

            // HttpCache.put(req, resp.clone());
            this.cache.put(req, resp.clone());
             
        } // else dont cache
        return resp;
      });

      // Store the pending request.
      // This will prevent multiple unfulfilled requests to the same URL.
      HttpClient.outbound[key] = pending;

      return pending;
      

    } catch (e) {

      console.log(e);
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

  // Returns true if the cached response is fresh: i.e. not stale.
  isResponseFresh(entry) {
    // Using the header included in the request
    let cacheControl = new HttpHeader("Cache-Control", entry.headers.get("Cache-Control") || "");
    
    // If we have a force-cache header, return true. Data is never stale.
    if (cacheControl.hasValue("force-cache")) return true;
    
    // Check if there is a cache-control max-age value.
    let maxAge = cacheControl.getParameter("max-age");
    if (maxAge) {

        // Get the date of the cached response.
        let cachedDate = new Date(entry.headers.get("Date"));
        let cachedTime = cachedDate.getTime() / 1000;

        // Get the current time.
        let now = new Date();
        let nowTime = now.getTime() / 1000;
        
        // Return true if the response is not stale.
        return (nowTime - cachedTime) > maxAge;
    }
    else
      // If there is no cache-control max-age value, we want to get a new request anyways. Treat it as stale.
      return false;  
  }

}





