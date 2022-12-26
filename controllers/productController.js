import multer from 'multer';
import path from 'path'; 
import CustomErrorHandler from '../services/CustomErrorHandler';
import Joi from 'joi';
import fs from 'fs';
import { Product } from '../models'

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${path.extname(file.originalname)}`;
        // 3746674586-836534453.png
        cb(null, uniqueName);
    },
});

const handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 },
}).single('image'); // 5mb




// PRODUCT CONTROLLER
const productController = {
    
    // CREATE NEW PRODUCT                  
    async store(req, res, next) {
    //  Handle file uplaods
    /*
      multipart form data:- it is specially used for uploading files.
     library use krna padega.
     multer library :- npm i multer 
     multer: Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
     handleMultipartData()  buit in function hai. 
    */
    handleMultipartData(req, res, async (err)=> {
        if(err){
            return next(CustomErrorHandler.serverError(err.message));
        }
        
        /* 
    console.log(req.file);
        //console-result 
            {
            fieldname: 'image',
            originalname: 'abhi-3.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            destination: 'uploads/',
            filename: '1671957954887-412738940.jpg',     
            path: 'uploads\\1671957954887-412738940.jpg',
            size: 305476
            }
        
        */
       
        const filePath = req.file.path;

        // validate requests
        // using joi library
        const productSchema = Joi.object({
            name: Joi.string().required(),
            price: Joi.number().required(),
            size: Joi.string().required()
        });

        const { error } = productSchema.validate(req.body);
        if(error) {
        
        // task:  delete uploaded file first 
        /*
             suppose  koi error aa jata hai tab ke case me problem ye hai ki
             file to already upload folder ke under save ho chuka h.
             if user will try to save again than image same image upload ho jayegi
             same file ko multiple times upload krna it dont make any sence.
             rootfolder/uploads/filename.png
             appRoot is global varibale that is defined inside the server.js file
       */
            fs.unlink(`${appRoot}/${filePath}`, (err) => {
                // handle error while removing file from the upload folder
                if(err) {
                    return next(CustomErrorHandler.serverError(err.message));
                }
            });

            return next(error);
            
        }

    // 3) STORE DATA INSIDE THE DATABASE 
        let document;
        try {
            document = await Product.create({
                name: req.body.name,
                price: req.body.price,
                size: req.body.size,
                image: filePath
            });

            res.status(201).json(document);

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    });
    },

    // UPDATE PRODUCT                    
    async update(req, res, next) {
        handleMultipartData(req, res, async (err) => {
            
            if(err) {
                return next(CustomErrorHandler.serverError(err.message));
            }

            let filePath;
            if(req.file){
                filePath = req.file.path;
            }

            // create product schema 
            const productSchema = Joi.object({
                name:  Joi.string().required(),
                price: Joi.number().required(),
                size:  Joi.string().required(),
                image: Joi.string()
            });

            // validate product schema
            const {error} = productSchema.validate(req.body);
            if(error) {
                  // Delete the uploaded file
                  if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(
                                CustomErrorHandler.serverError(err.message)
                            );
                        }
                    });
                }

                return next(error);
            }


            // database record update
            let product;
            try {
                product = await Product.findOneAndUpdate(
                    { _id: req.params.id },

                    { 
                        name: req.body.name,
                        price: req.body.price,
                        size: req.body.size,
                        ...(req.file && {image: filePath})
                    }, 

                    { new: true }
                );
            } catch (err) {
                return next(err);
            }

            res.status(201).json(product);
        });
    },

    // DELETE PRODUCT
    async destroy(req, res, next){

        let product;
        try {
            product = await Product.findOneAndRemove({_id: req.params.id});
            if(!product){
                return next(new Error('nothing to delete'));
            }

            //image delete
            // const imagePath = product.image;
            // console.log(imagePath);
            //  http://localhost:3000/uploads\1672050162744-837102279.jpg
            // approot/http://localhost:3000/uploads\1672050162744-837102279.jpg        [+] WRONG PATTERN URL 
            // const imagePath = product.image                KRNE SE UPR WALA ISSUE CREATE HOGA.
            // url problem ko fix krne ke liye _doc use krna pdega
            
            const imagePath = product._doc.image;

            fs.unlink(`${appRoot}/${imagePath}`, (err)=>{
                if(err) {
                    return next(CustomErrorHandler.serverError());
                }

                return res.json( {
                    message: "Deleted",
                    data: product
                });

            } );

        } catch (err) {
            return next(err);
        }

      
    },

    // GET ALL PRODUCT
    async productList(req, res, next) {
        let products;
        // pagination - library mongoose pagination use kr skte hain 
        try {
            // need 1.  complete data list mil jayega
                // products = await Product.find().select('-updatedAt -__v');

            // need 2 but hame updatedAt aur __v  nahi dikhana tab hum chaining use karenge.
                // products = await Product.find().select('-updatedAt -__v');

            //  need 3 sorting 
            // sort( { field name : -1 } )  descending order
            products = await Product.find().select('-updatedAt -__v').sort({ _id: -1 });


        } catch (err) {
            return next(err);
        }

        return res.json(products);
        
    },


    // GET A SINGLE PRODUCT BY ID
    async singleProduct(req, res, next) {
        let product;
        try {
            product = await Product.findById({_id: req.params.id}).select("-updatedAt -__v");
            if(!product) {
                return next(CustomErrorHandler.notFound());
            }

            res.json(product);

        } catch (err) {
            return next(err);
        }
    }
}

export default productController;