import { HttpCache } from "./HttpCache.js";
import { HttpMock } from "./HttpMock.js";
import { Url } from "./Url.js";

export { HttpClient };




const MODE_TEST = 1;
const MODE_LIVE = 0;


class HttpClient {

  // Live mode, or Test mode (mocking)
  mode = MODE_LIVE;

  config = null;
  static mocks = {};
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
        //if (req.contentType == application/json)
        //return response.json
        //if (req.contentType == text/html)
        //e.message
        return Response.json(data);
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
  //https://www.googleapis.com/calendar/v3/calendars/biere-library@thebierelibrary.com/events?timeMin=2023-07-01&timeMax=2023=07-15&test
  getMock(req) {
    let url = new Url(req.url);

    /* With the way I have split this you need to choose the string at index 2 because 0 will be https: and 1 
    will just be an empty string because there is no space or anything between // */
    let domain = url.getDomain();
    /* could also do this
    
    */
    return HttpClient.mocks[domain];
  }
}





