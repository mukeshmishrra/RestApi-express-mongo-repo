import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

class JwtService {
    // 1.) sign the token
    static sign(payload, expiry='60s', secret=JWT_SECRET){
        return jwt.sign(payload, secret, {expiresIn: expiry});
    }

    // 2.) varify the token
    static verify(token, secret=JWT_SECRET) {
        return jwt.verify(token, secret);
    }
}

export default JwtService;