import Chat from "../models/Chat.js";
import User from "../models/User.js";

// AI Text-based message controller
export const textMessageController = async(req, res) => {
    try{
        const userId = req.user.id;
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
        }catch(error){
        }
    }