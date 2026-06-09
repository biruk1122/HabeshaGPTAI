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
            return res.json({success: false, message: "you don't have enough credits to use this feature"})
        }

        const {chatId, prompt} = req.body

        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({role: 'user', content: prompt, timestamp: Date.now(), isImage: false})

        const response = await openai.responses.create({
            model: process.env.OPENAI_TEXT_MODEL || "gpt-5-mini",
            tools: [{type: "web_search"}],
            tool_choice: "auto",
            include: ["web_search_call.action.sources"],
            instructions: "This chat is connected to OpenAI web search. Do not say you lack live web search. Use web search only when the user asks about current, recent, live, location-specific, price, news, weather, sports, law, product availability, or other changing information. For general knowledge, coding help, explanations, writing, math, brainstorming, and timeless questions, answer without web search. Include useful source links only when web information is used.",
            input: chat.messages
                .filter(msg => !msg.isImage)
                .map(msg => ({
                    role: msg.role === "assistant" ? "assistant" : "user",
                    content: msg.content
                }))
        });

        const reply={
            role: 'assistant',
            content: response.output_text || "I couldn't generate a response.",
            timestamp: Date.now(),
            isImage: false
        }
        res.json({success: true, reply})

        chat.messages.push(reply)
        await chat.save();
        await User.updateOne({_id: userId}, {$inc: {credits: -1}})

    }catch(error){
        res.json({success: false, message: error.message})
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
