// // app/api/tts/route.js
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(req) {
//   try {
//     const { text, language } = await req.json();

//     if (!text || text.trim().length === 0) {
//       return NextResponse.json({ error: "Text is required" }, { status: 400 });
//     }

//     // Voice selection based on language
//     const voiceMap = {
//       en: "alloy", // natural neutral English
//       hi: "verse", // clear for Hindi phonetics
//       bn: "shimmer", // ✅ best for Bengali text pronunciation
//       ta: "fable", // Tamil
//       te: "copper", // Telugu
//       mr: "verse", // Marathi
//       gu: "verse", // Gujarati
//       kn: "copper", // Kannada
//       pa: "fable", // Punjabi
//       ml: "verse", // Malayalam
//     };

//     const voice = voiceMap[language] || "alloy";

//     console.log(`🔊 Generating TTS for ${language} using voice: ${voice}`);

//     // Generate speech using OpenAI TTS
//     const response = await openai.audio.speech.create({
//       model: "tts-1", // Use 'tts-1-hd' for higher quality
//       voice: voice,
//       input: text,
//       response_format: "mp3",
//       speed: 1.0,
//     });

//     // Convert response to buffer
//     const buffer = Buffer.from(await response.arrayBuffer());

//     // Return audio as MP3
//     return new NextResponse(buffer, {
//       headers: {
//         "Content-Type": "audio/mpeg",
//         "Content-Length": buffer.length.toString(),
//         "Cache-Control": "no-cache",
//       },
//     });
//   } catch (error) {
//     console.error("TTS API Error:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to generate speech",
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
