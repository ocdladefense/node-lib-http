# Node-lib-http

## Mocking examples
The below example demonstrates how to register a mocking class against a specific domain, in this case <code>api.example.com</code>.  The <code>MyApiMock</code> object will be used to intercept <code>fetch()</code> calls to the registered domain, and subsequent <code>Responses</code> will be generated from the object's <code>getResponse()</code> method.  This effectively prevents <code>fetch()</code> calls to the registered domain from reaching the network.
```javascript
class MyApiMock extends HttpMock {

    getResponse(req) {

        return Response.json({p1:"v1"});
    }
}

HttpClient.setMock("https://api.example.com", new MyMock());
```

## Caching options
When initalizing the http client, you can pass in some options to configure how the caching works.

```javascript
// HttpClient is our entry and processess the request
import HttpClient from '@ocdla/lib-http/HttpClient';

// Must include the import for the cache you want to use.
import LocalStorageCache from '@ocdla/lib-http/caches/LocalStorageCache';
import HttpCache from '@ocdla/lib-http/caches/HttpCache';

// Optional header for our request
const header =
{
    headers: {
        'Cache-Control': 'public, max-age=900' // Set the maximum age to 15 minutes
    }
};


const url = 'https://testApi.com/v1/?foo=123';
const req = new Request(url, header);


// Local storage caching accepts params refresh to denote staleness of fetch in seconds.
const clientOne = new HttpClient(
    {
        cacheOptions: {
            cache: LocalStorageCache,
            params: {
                refresh: 15 * 60 // Time in seconds or False. False will make data never expire.
            }
        }
    });


// HttpCache has no params
const clientTwo = new HttpClient(
    {
        cacheOptions: {
            cache: HttpCache
        }
    });


// Use the cache control specified in the header. Default behavior.
const clientThree = new HttpClient();

// In every instance, cached data is preferred and returned.
const responseOne = await clientOne.send(req);
const responseTwo = await clientTwo.send(req);
const responseThree = await clientThree.send(req);
```

## Adding a new caching option
Adding a new cache is simple. Make sure your cache impliments a 'match' and a 'put' method for retrieving data and for storing it using a key. Import it in HttpClient, and if it requires any parameters bundle them in a config object and pass them through with cacheOptions.params.
