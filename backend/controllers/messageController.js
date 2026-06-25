import axios from "axios";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import imagekit from "../configs/imageKit.js";
import gemini from "../configs/openai.js";

// AI Text-based message controller - using Google Gemini API
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user.id;

    //Always get fresh user from DB to ensure credits are up-to-date
    const user = await User.findById(userId);

    //Check credits
    if (user.credits < 1) {
      return res.json({
        success: false,
        message: "you don't have enough credits to use this feature",
      });
    }

    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Build conversation history for Gemini (keep last 10 messages to save tokens)
    const recentMessages = chat.messages
      .filter((msg) => !msg.isImage)
      
    //Safty (Prevent huge context crash, Not limiting user)
    const MAX_MESSAGES = 100;
    const safeMessages = recentMessages.length > MAX_MESSAGES ? recentMessages.slice(-MAX_MESSAGES) : recentMessages;

    const history = safeMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

        // Use Gemini 2.5 Flash as default with Google Search grounding for current data
        const result = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction: {
          parts: [
            {
              text: "You are HabeshaGPT, a helpful AI assistant. Answer questions accurately and concisely. Today's date is " + new Date().toISOString().split('T')[0] + ". Use Google Search when the user asks about current events, news, weather, sports, prices, recent information, or any time-sensitive data. For general knowledge, coding, explanations, writing, math, and brainstorming, answer from your knowledge.",
            },
          ],
        },
        tools: [{ googleSearch: {} }]
      },
    });

    const responseText =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response.";

    const reply = {
      role: "assistant",
      content: responseText,
      timestamp: Date.now(),
      isImage: false,
    };
    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();

    await User.findByIdAndUpdate( userId , { $inc: { credits: -1 } });

    req.user.credits = user.credits - 1; 

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// AI Image-based message controller
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (user.credits < 2) {
      return res.json({
        success: false,
        message: "You don't have enough credits",
      });
    }

    const { prompt, chatId, isPublished } = req.body;
    const chat = await Chat.findOne({ userId, _id: chatId });

    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    //Encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);

    //Construct the image URL using ImageKit's URL endpoint and transformation parameters
    const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/habeshagpt/${Date.now()}.jpg?tr=w-800,h-800`;

    //Trigger generation by fetching from imagekit
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    //Convert to Base64
    const base64Image = `data:image/jpg;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

    //Upload to ImageKit Media Library
    const uploadResponse = await imagekit.upload({
      file: base64Image,
      fileName: `${Date.now()}.jpg`,
      folder: "habeshagpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ success: true, reply });

    chat.messages.push(reply);
    await chat.save();

    await User.findByIdAndUpdate( userId , { $inc: { credits: -2 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
