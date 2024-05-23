



// Mocking classes should extend this.
export default class HttpMock {

    constructor() {
        
    }

    /**
     * 
     * @param {Request} req 
     */
    getResponse(req) {
        
        switch (req.method) {
            case "GET":
                return this.get(req);
            case "POST":
                return this.post(req);
            case "PUT":
                return this.put(req);
            case "DELETE":
                return this.delete(req);
            default:
                return Response.error();
        }

        
    }
}

