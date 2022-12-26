import Joi from "joi";
import { RefreshTokens, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from 'bcrypt';
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const loginController = {
   // Login method 
   async login(req, res, next){
       //login 

       // 1.) CREATE LOGIN SCHEMA
       const loginSchema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
       });

       // 2.) VALIDATE SCHEMA 
       const { error } = loginSchema.validate(req.body);

       if(error) {
        return next(error);
       }

       // 3.) CHECK EMAIL AND PASSWORD 
       try {
           const user = await User.findOne({email: req.body.email})
            if(!user) {
                return next(CustomErrorHandler.wrongCredentials());
            }

            // compare/check password 
             const match = await bcrypt.compare(req.body.password, user.password);
             if(!match) {
                return next(CustomErrorHandler.wrongCredentials());
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
        return next(err);
       }
       
        
    },


   //  logout method
   async logout(req, res, next) {
      // logout logic
      // create schema
      const logoutSchema = Joi.object({
         refresh_token: Joi.string().required()
      });

      // validate 
      const {error} = logoutSchema.validate(req.body);

      if(error) {
         return next(error);
      }

      try {
         await RefreshTokens.deleteOne({token: req.body.refresh_token});
         res.json({
            status: 1
         });
      } catch (err) {
         return next(new Error('Something went wrong in the database.'));
      }
   }

};

export default loginController;