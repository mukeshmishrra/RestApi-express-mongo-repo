import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { RefreshTokens, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";

const refreshController = {
    async refresh(req, res, next) {
        // 1) create refresh schema

        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required()
        });

        // 2) validate schema
        const { error } = refreshSchema.validate(req.body)
        
        if(error) {
            return next(error);
        }

        //check refresh token in the database
        try {
            const refreshToken = await RefreshTokens.findOne({ token: req.body.refresh_token })
            if(!refreshToken) {
                return next(CustomErrorHandler.unAuthorized('invalid refresh token'));
            }

            let userId;
            try {
                const { _id } = await JwtService.verify(refreshToken.token, REFRESH_SECRET);
                userId = _id;
            } catch (err) {
                return next(CustomErrorHandler.unAuthorized('invalid refresh token'))
            }

            const user = User.findOne({ _id: userId });

            if(!user) {
                return next(CustomErrorHandler.unAuthorized('No user found'));
            }

             // generate token
             const access_token = JwtService.sign({_id: user._id, role: user.role});
             const refresh_token = JwtService.sign({_id: user._id, role: user.role}, '1y', REFRESH_SECRET);

             //database whitelist
             await RefreshTokens.create({
               token: refresh_token
             });
             
             // send token in as a response
             res.json({
                access_token: access_token,
                refresh_token: refresh_token
             });

        } catch (err) {
            return next(new Error('something went wrong ', err.message));            
        } 


    }
};
export default refreshController;