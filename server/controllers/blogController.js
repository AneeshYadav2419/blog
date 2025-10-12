import { json } from "express";
import imagekit from "../configs/imageKit.js";
import fs from 'fs';
import Blog from "../models/Blogs.js";

 const addBlog = async(req, res) => {
    try {
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog);
        console.log(req.body);

        const imageFile = req.file;

        if(!title || !description || !category || !imageFile){
            return res.json({success: false, message: "Missing required fields "})
        }

        const fileBuffer = fs.readFileSync(imageFile.path)

        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blog"
        })
        //optimized 

        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'}, // Auto compression
                {format: "webp"},//convert to modern format
                {width: '1280'} // width resizing
            ]
        });

        const image = optimizedImageUrl;

        await Blog.create({title, subTitle, description, category, image, isPublished})

        res.json({success: true, message : "Blog Added successfully "})
        
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
export default addBlog