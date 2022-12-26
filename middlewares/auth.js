import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";

const auth = async ( req, res, next ) => {
    let authHeader = req.headers.authorization;
    // console.log(authHeader);
    
    // header nahi mil raha tab 
    if(!authHeader) {
        return next(CustomErrorHandler.unAuthorized());
    }

    const token = authHeader.split(' ')[1];
    // console.log("__TOKEN___ ",token);

    // VARIFY THE TOKEN
    try {
        const {_id, role} = await JwtService.verify(token);
        
        const user = {
            _id: _id,
            role: role
        };

        req.user = user;
        next();
        
    } catch (err) {
        return next(CustomErrorHandler.unAuthorized());
    }
};

export default auth;