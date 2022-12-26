import { DEBUG_MODE } from "../config";
import { ValidationError } from 'joi';
import CustomErrorHandler from "../services/CustomErrorHandler";

// application me kahin v error aa ra hai to usko hum yha handle kar sakte hai.

const errorHandler = (err, req, res, next) => {
    let statusCode = 500 // default
    let data = {
        message: 'internal server error', // defualt error
        // originaError directly nahi bhej sakte. development mode tak it is ok but 
        // production mode me apn originalError nahi bhej sakte.
        // iske liye hame check krna pdega ki debuge mode agr true hai, tabhi apn 
        // originError message send krenge. 
        // condition check krne ke liye apn spread operator use krenge yha
        ...(DEBUG_MODE==='true' && {originalError: err.message})
    }


    if( err instanceof ValidationError ) {
        statusCode = 422; //validation error code
        data = {
            message: err.message
        }
    }


    if( err instanceof CustomErrorHandler ) {
        statusCode = err.status;
        data = {
            message: err.message
        }
    }

    return res.status(statusCode).json(data);
}

export default errorHandler;