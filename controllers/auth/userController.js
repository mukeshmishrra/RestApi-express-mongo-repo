import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";

const userController = {
   async me(req, res, next) {
        try {
            //select use krk unwanted data jo hame nahi dikhane user ko so wo hum yha remove kr skte hai select ka use krk.
            const user = await User.findOne({ _id: req.user._id }).select('-password -updatedAt -__v');
            
            // if there is no user
            if(!user) {
                return next(CustomErrorHandler.notFound());
            } 

            // if there is user
            res.json(user);

        } catch (err) {
            return next(err);
        }
    }
};

export default userController;