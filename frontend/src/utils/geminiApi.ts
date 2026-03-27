import { GoogleGenerativeAI } from "@google/generative-ai";

export type ChatHistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};

export const streamGeminiResponse = async (
  apiKey: string,
  pdfText: string,
  history: ChatHistoryItem[],
  newMessage: string,
  onChunk: (text: string) => void
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Initialize the model with the system instruction containing the PDF text
  // We use gemini-2.5-flash as it is extremely fast and capable of large contexts (like PDFs)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are DocuChat, a helpful and polite AI assistant. Always prioritize generating a clean, human-readable response without raw technical artifacts. Answer the user's questions based primarily on the following PDF text. If the answer is not in the text, let the user know, but try to be helpful regardless.\n\n--- PDF Context ---\n${pdfText}`,
  });

  const chat = model.startChat({
    history: history,
  });

  const result = await chat.sendMessageStream(newMessage);

  let fullText = '';
  // Iterate over the stream and chunk by chunk update the UI
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    onChunk(fullText);
  }
  
  return fullText;
};
