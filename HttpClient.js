import HttpCache from "./HttpCache.js";
import Url from "./Url.js";
import HttpHeader from "./HttpHeader.js";



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
  send(req) {

    if (navigator.onLine == false) {
      throw new Error("Network offline.");
    }
      
    // Will hold any reference to a mocking class for the request.
    let mock;

    // Will hold a reference to the cached response, if there is one.
    let cached; 

    // Indicates whether the cached response is stale or not.
    // Needs further implementation so for now let's consider it not* stale.
    let stale = false;

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
        cached = HttpCache.get(req)
      
        // Prefer a completed response, if one already happens to be in the cache.
        if(cached && !stale) return cached;
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

        // Question: is there always cache-control? im assumin yes...
        let cacheControl = new HttpHeader(
          "cache-control",
          resp.headers.get("cache-control")
        );
  
        // Do not cache if response has a cache-control value called no-cache
        // or if the method is anything but GET.
        if (req.method == "GET" && !cacheControl.hasValue("no-cache")) {
          HttpCache.put(req, resp.clone());
        } // else dont cache

        return resp;
      });

      // Store the pending request.
      // This will prevent multiple unfulfilled requests to the same URL.
      HttpClient.outbound[key] = pending;

      return pending;
      

    } catch (e) {

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


}





