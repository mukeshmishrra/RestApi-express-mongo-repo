import mongoose, { model } from 'mongoose';
import { APP_URL } from '../config';

const Schema  = mongoose.Schema;


const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    image: { 
        type: String,
        required: true,
        // for setting complete image path, we need to use getter method.
        get: (image) => {
            // http://localhost:3000/uploads/935894035-342.png
            return `${APP_URL}/${image}`;
        }
    }
}, {timestamps: true, toJSON: { getters: true }, id: false });

export default mongoose.model('Product', productSchema, 'products');