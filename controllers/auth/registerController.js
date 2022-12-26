import Joi from 'joi';
import bcrypt from 'bcrypt';
import { RefreshTokens, User } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';
import { REFRESH_SECRET } from '../../config';

const registerController = {
    async register(req, res, next) {
        // logic 
        // CHECKLIST
        //[] validate the request
        //[] authrise the request
        //[] check if user is in the database already
        //[] prepare model
        //[] store in database
        //[] generate jwt token
        //[] send response

        //1. CREATE SCHEMA AND VALIDATE IT..
        // validation ke liye Joi library use karenge. npm install joi 
        const registerSchema = Joi.object({
            name: Joi.string().min(3).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
            confirm_password: Joi.ref('password')
        });

        // console.log(req.body);

        const {error} = registerSchema.validate(req.body);

        // 2)  check if the user is in the database already
        try {
            const exist = await User.exists({ email: req.body.email });
            if(exist) {
                return next(CustomErrorHandler.alreadyExist('This email is already taken.'));
            } 

        } catch (err) {
            return next(err)
        }


        // PREPARE THE MODEL............

        // const user = new User({
        //     name: req.body.name,
        //     email: req.body.email,
        //     password: req.body.password
        // });

        // bar bar req.body krne se achha hum destructuring use kr sakte hain.

        const {name, email, password} = req.body;
         // hash password
        //library --> npm i bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        
        // SAVE INTO THE DATABASE...
        let access_token;
        let refresh_token;
        try {
            const result = await user.save();
            
            // CREATE TOKEN...
            // library - npm i jsonwebtoken
            // create a class inside the service like JwtService.js and handle jwt logic at there.
            access_token=JwtService.sign({_id: result._id, role: result.role});
            refresh_token=JwtService.sign({_id: result._id, role: result.role}, '1y', REFRESH_SECRET );

            // database whitelist
            await RefreshTokens.create({
                token: refresh_token
            });


        } catch (err) {
            return next(err);
        }

        res.json({
            access_token: access_token,
            refresh_token: refresh_token
        });
    }
}

export default registerController;