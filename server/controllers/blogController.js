import { json } from "express";
import imagekit from "../configs/imageKit.js";
import fs from 'fs';
import Blog from "../models/Blogs.js";
import Comment from "../models/Comment.js";

const addBlog = async (req, res) => {
    try {
        const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
        console.log(req.body);

        const imageFile = req.file;

        if (!title || !description || !category || !imageFile) {
            return res.json({ success: false, message: "Missing required fields " })
        }

        const fileBuffer = fs.readFileSync(imageFile.path)

        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        })
        //optimized 

        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { quality: 'auto' }, // Auto compression
                { format: "webp" },//convert to modern format
                { width: '1280' } // width resizing
            ]
        });

        const image = optimizedImageUrl;

        await Blog.create({ title, subTitle, description, category, image, isPublished })

        res.json({ success: true, message: "Blog Added successfully " })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true })
        res.json({ success: true, blogs })
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

export const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });

        }
        res.json({ success: true, blog })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.body
        await Blog.findByIdAndDelete(id);
        // delete all comments associated with blogs

        await Comment.deleteMany({ blog: id });
        res.json({ success: true, message: 'Blog deleted successfully' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const togglePublish = async (req, res) => {
    try {
        const { id } = req.body;

        console.log("Toggle request received for:", id);

        const blog = await Blog.findById(id);

        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({ success: true, message: "Blog status successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

export const addComment = async (req, res) => {
    try {
        const { blog, name, content } = req.body;
        await Comment.create({ blog, name, content });
        res.json({ success: true, message: 'Comment added for review' })
    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

export const getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.body;
        const comments = await Comment.find({ blog: blogId, isApproved: true }).sort({ createdAt: -1 });
        res.json({ success: true, comments })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export default addBlog