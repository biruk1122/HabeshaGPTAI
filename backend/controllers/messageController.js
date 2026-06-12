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

// import Chat from "../models/Chat.js";
// import User from "../models/User.js";
// import openai from "../configs/openai.js";

// /**
//  * Helper: build compact memory instead of full chat
//  */
// function buildSmartMemory(messages) {
//     const recent = messages.slice(-12); // reduce token cost

//     return recent
//         .filter(m => !m.isImage)
//         .map(m => ({
//             role: m.role === "assistant" ? "assistant" : "user",
//             content: m.content
//         }));
// }

// /**
//  * Optional: create short summary memory (for long chats)
//  */
// async function getChatSummary(messages) {
//     if (messages.length < 20) return null;

//     const summaryPrompt = messages.slice(0, -10).map(m =>
//         `${m.role}: ${m.content}`
//     ).join("\n");

//     const res = await openai.chat.completions.create({
//         model: "gpt-5-mini",
//         messages: [
//             {
//                 role: "system",
//                 content: "Summarize this chat in a short memory for context."
//             },
//             {
//                 role: "user",
//                 content: summaryPrompt
//             }
//         ]
//     });

//     return res.choices[0]?.message?.content;
// }

// export const textMessageController = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { chatId, prompt } = req.body;

//         // 1. Check credits
//         if (req.user.credits < 1) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Not enough credits"
//             });
//         }

//         // 2. Get chat
//         const chat = await Chat.findOne({ userId, _id: chatId });
//         if (!chat) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Chat not found"
//             });
//         }

//         // 3. Save user message
//         chat.messages.push({
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         });

//         // 4. Smart memory (cheap + fast)
//         const memory = buildSmartMemory(chat.messages);

//         // 5. Streaming headers
//         res.setHeader("Content-Type", "text/event-stream");
//         res.setHeader("Cache-Control", "no-cache");
//         res.setHeader("Connection", "keep-alive");

//         let fullResponse = "";
//         let sources = [];

//         // 6. OpenAI streaming with web search
//         const stream = await openai.responses.create({
//             model: "gpt-5-mini",
//             tools: [{ type: "web_search" }],
//             tool_choice: "required",
//             include: ["web_search_call.action.sources"],
//             input: [
//                 ...memory,
//                 { role: "user", content: prompt }
//             ],
//             stream: true
//         });

//         for await (const event of stream) {

//             // TEXT STREAMING
//             if (event.type === "response.output_text.delta") {
//                 const chunk = event.delta;
//                 fullResponse += chunk;

//                 res.write(`data: ${JSON.stringify({
//                     type: "token",
//                     text: chunk
//                 })}\n\n`);
//             }

//             // CAPTURE SOURCES
//             if (event.type === "response.web_search_call.completed") {
//                 sources = event.sources || [];
//             }
//         }

//         // 7. Save assistant message
//         const reply = {
//             role: "assistant",
//             content: fullResponse,
//             timestamp: Date.now(),
//             isImage: false,
//             sources
//         };

//         chat.messages.push(reply);

//         // 8. Optional chat summary (memory optimization)
//         const summary = await getChatSummary(chat.messages);
//         if (summary) {
//             chat.summary = summary;
//         }

//         await chat.save();

//         // 9. Deduct credits
//         await User.updateOne(
//             { _id: userId },
//             { $inc: { credits: -1 } }
//         );

//         // 10. Send final event
//         res.write(`data: ${JSON.stringify({
//             type: "done",
//             reply
//         })}\n\n`);

//         res.end();

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

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
            res.json({success: false, message: error.message})
        }
    }
