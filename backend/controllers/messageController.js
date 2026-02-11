import axios from 'axios'
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from '../configs/imageKit.js';
import openai from '../configs/openai.js'

// AI Text-based message controller
export const textMessageController = async(req, res) => {
    try{
        const userId = req.user.id;

        //Check credits
        if(req.user.credits < 1){
            return res.json({sucess: false, message: "you don't have enough credits to use this feature"})
        }

        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({role: 'user', content: prompt, timestamp: Date.now(), isImage: false})

        const {choices} = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                
                {
                    role: 'user', 
                    content: prompt
                },
        
            ]
        });

        const reply={...choices[0].message, timestamp: Date.now(), isImage: false}
        res.json({success: true, reply})

        chat.messages.push(reply)
        await chat.save();
        await User.updateOne({_id: userId}, )

    }catch(error){
        res.json({sucess: false, message: error.message})
    }
}

// AI Image-based message controller
export const imageMessageController = async(req, res) => {
    try{
        const userId = req.user.id;
        if (req.user.credits < 2){
            return res.json({success: false, message: "You don't have enough credits"})
        }

        const {prompt, chatId, isPublished} = req.body;
        const chat = await Chat.findOne({userId, _id: chatId})

        chat.messages.push({role: 'user', content: prompt, timestamp: Date.now(), isImage: false})

        //Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt);

        //Construct the image URL using ImageKit's URL endpoint and transformation parameters
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/habeshagpt/${Date.now()}.jpg?tr=w-800,h-800`

        //Trigger generation by fetching from imagekit
        const aiImageResponse = await axios.get(generatedImageUrl, {responseType: 'arraybuffer'});

        //Convert to Base64
        const base64Image = `data:image/jpg;base64,${Buffer.from(aiImageResponse.data,'binary').toString('base64')}`

        //Upload to ImageKit Media Library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.jpg`,
            folder: 'habeshagpt'
        })

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(), 
            isImage: true,
            isPublished
        }

        res.json({success: true, reply})

        chat.messages.push(reply)
        await chat.save()

        await User.updateOne({_id: userId}, {$inc: {credits: -2}})

        }catch(error){
            res.json({sucess: false, message: error.message})
        }
    }