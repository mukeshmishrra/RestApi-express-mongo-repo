class CustomErrorHandler extends Error {
    constructor(status, msg) {
        super();
        this.status = status;
        this.message = msg;
    }
    
    // email is already exist in the database 
    static alreadyExist(message) {
        return new CustomErrorHandler(409, message);
    }

    // wrong credentials error handler
    static wrongCredentials(message="username and password is wrong!") {
        // unauthorized status code 401
        return new CustomErrorHandler(401, message);
    }

    // unAuthorized error handler
    static unAuthorized(message="unauthoried") {
        return new CustomErrorHandler(401, message);
    }

    // not found error
    static notFound(message="404 not found") {
        return new CustomErrorHandler(404, message);
    };

    static serverError(message='internal server error') {
        return new CustomErrorHandler(500, message);
    }

}

export default CustomErrorHandler;