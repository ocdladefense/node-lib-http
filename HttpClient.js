import { HttpCache } from "./HttpCache.js";
import { Url } from "./Url.js";

export { HttpClient };




const MODE_TEST = 1;

const MODE_LIVE = 0;


class HttpClient {

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
   * @param {*} req 
   * @returns Response
   */
  async send(req) {
    if (this.mode == MODE_TEST) {

      let data = [];

      try {
        if (navigator.onLine == false) {
          throw new Error("Network offline.");
        }

        let mock = this.getMock(req);

        return mock.getResponse(req);
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

    } else {
      let cached = HttpCache.get(req);

      if (cached || HttpClient.outbound[req.url]) {
        return cached || HttpClient.outbound[req.url]
          .then((resp) => { return HttpCache.get(req); });
      }
      let pending = fetch(req);

      HttpClient.outbound[req.url] = pending;

      return pending.then((resp) => {
        HttpCache.add(req, resp);
        return HttpCache.get(req);
      });
    }

  }

  static register(domain, mock) {
    HttpClient.mocks[domain] = mock;
  }

  getMock(req) {
    let url = new Url(req.url);
    let domain = url.getDomain();

    return HttpClient.mocks[domain];
  }

  toggleTest() {
    this.mode = MODE_TEST;
  }
  getLiveMode() {
    return this.mode == MODE_LIVE;
  }
}





