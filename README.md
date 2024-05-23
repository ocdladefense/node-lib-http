# Node-lib-http

## Mocking examples
The below example demonstrates how to register a mocking class against a specific domain, in this case <code>api.example.com</code>.  The <code>MyApiMock</code> object will be used to intercept <code>fetch()</code> calls the registered domain, and subsequent <code>Response</code>s will be generated from the object's <code>getResponse()</code> method.  This effectively prevents <code>fetch()</code> calls from reaching the network.
```javascript
class MyApiMock extends HttpMock {

    getResponse(req) {

        return Response.json({p1:"v1"});
    }
}

HttpClient.setMock("https://api.example.com", new MyMock());
```