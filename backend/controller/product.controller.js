
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.modal.js";


export const getAllProducts = async (req, res) => {
    console.log("getAllProducts");
    try {
        const products = await Product.find();
        res.json({products});
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const getFeaturedProducts = async (req, res) => {  

    try {
        let featuredProducts = await redis.get("featured_products");

        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }

        // if not in redis, get from db
        // .lean() is gonna return a plain js object insead of mongoose object

        featuredProducts = await Product.find({featured: true}).lean();

        if(!featuredProducts){
            return res.status(404).json({message: "No featured products found"});
        }

        await redis.set("featured_products", JSON.stringify(featuredProducts));

    } catch (error) {
        console.log("Error in getFeaturedProducts controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }  
}

export const createProduct = async (req, res) => {
    try {
        const {name, description, price, image, category} = req.body;
        
        let cloudinaryResponse = null


        if(image){  
            cloudinaryResponse = await cloudinary.uploader.upload(image,{folder: "products"})
            console.log("sucessfully image uploaded to cloudinary");
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category
        
        });

        res.status(201).json({product});


    } catch (error) {
        
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if(!product){
            return res.status(404).json({message: "Product not found"});
        }

        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("deleted imagefrom cloudinary");
            } catch (error) {
                console.log("error deleting image from cloudinary", error);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

		res.json({ message: "Product deleted successfully" });


    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: {size: 3}
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1
                }
            }
        ])

        res.json({products});
    } catch (error) {
        console.log("Error in getRecommendedProducts controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

export const getProductsByCategory = async (req, res) =>{
    const {category} = req.params;
    try {
        const products = await Product.find({category});
        res.json({products});
    } catch (error) {
        console.log("Error in getProductsByCategory controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
}


export const toggleFeaturedProduct = async (req, res) =>{
    try {
        const product = await Product.findById(req.params.id);
        if(product){
            product.isFeatured = !product.isFeatured;
            const updatedProduct = await product.save();
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        }else{
            res.status(404).json({message: "Product not found"});
        }
        
    } catch (error) {
        console.log("Error in toggleFeaturedProduct controller", error.message);
        res.status(500).json({ message: "server error", error: error.message });
    }
}

async function updateFeaturedProductsCache(){
    try {
        // The lean() method is used to convert the Mongoose documents to plain JavaScript objects. this can significantly improve the performance of the application.
        const featuredProducts = await Product.find({isFeatured: true}).lean();
        await redis.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log("error in updateFeaturedProductsCache", error.message);
    }
}