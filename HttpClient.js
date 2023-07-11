import { HttpCache } from "./HttpCache.js";
import { HttpMock } from "./HttpMock.js";
import { Url } from "./Url.js";

export { HttpClient };




const MODE_TEST = 1;
const MODE_LIVE = 0;


class HttpClient {

  // Live mode, or Test mode (mocking)
  mode = MODE_TEST;

  config = null;
  static mocks = {};
  // Prototypical inheritance in JavaScript.

  // Class-based inheritance.
  /*(constructor(config) {
    this.config = config;
    this.cache = this.config.cache || HttpCache.newFromMode(this.mode);
  }*/


  /**
   * 
   * @param {*} req 
   * @returns Response
   */
  async send(req) {
    if (this.mode == MODE_TEST) {
      // Look for registered Mock classes here.
      // E.g., this.getMock(req.url).
      // For more info, see:
      //  https://developer.mozilla.org/en-US/docs/Web/API/Request/url
      //console.log(req.url);

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

        return Response.json(data);
    }
      // We may or may not continue to use this caching facility.
      // Instead, let's give preference to this.getMock().
      // return this.cache.get(req.url);
    } else {

      return fetch(req);

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





