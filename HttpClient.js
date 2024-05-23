import HttpCache from "./HttpCache.js";
import Url from "./Url.js";




const MODE_TEST = 1;

const MODE_LIVE = 0;


export default class HttpClient {

  // By default our client is in live mode,
  // i.e., it will make network requests.
  // Testing mode will use mocking classes in place of network requests.
  mode = MODE_LIVE;

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
  async send(req) {

    if (navigator.onLine == false) {
      throw new Error("Network offline.");
    }
      
    let data = [];


    try {

      let mock = this.getMock(req);

      if(mock) {
        return mock.getResponse(req);
      }


      let cached = HttpCache.get(req);

      if (cached || HttpClient.outbound[req.url]) {
        return (
          cached ||
          HttpClient.outbound[req.url].then((resp) => {
            return HttpCache.get(req);
          })
        );
      }
      let pending = fetch(req);

      HttpClient.outbound[req.url] = pending;

      return pending.then((resp) => {
        HttpCache.add(req, resp);
        return HttpCache.get(req);
      });


      

    } catch (e) {
      data = {
        success: false,
        error: true,
        code: e.cause,
        message: e.message
      };

      if (req.headers.get("Accept") == "application/json")
        return Response.json(data);
      //if (req.headers.get("Content-Type") == "text/html")
      return e.message
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





