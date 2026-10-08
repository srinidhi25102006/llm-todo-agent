import Groq from "groq-sdk";
import { tools, executeTool } from "./tools.js";

const client = new Groq();

// Convert our tool list into the format Groq expects
const groqTools = tools.map((t) => ({
  type: "function",
  function: {
    name: t.name,
    description: t.description,
    parameters: t.input_schema,
  },
}));

export async function runAgent(userMessage) {
  const today = new Date().toLocaleDateString("en-CA");

  const system = `You are a todo assistant. Today's date is ${today}. Convert relative dates like "tomorrow" into YYYY-MM-DD. Use the tools to act, then confirm briefly to the user.`;

  const messages = [
    { role: "system", content: system },
    { role: "user", content: userMessage },
  ];

  for (let i = 0; i < 5; i++) {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      tools: groqTools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    messages.push({
      role: "assistant",
      content: message.content,
      tool_calls: message.tool_calls,
    });

    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content;
    }

    for (const call of message.tool_calls) {
      let result;
      try {
        const args = JSON.parse(call.function.arguments);
        console.log("Tool call:", call.function.name, args);
        result = executeTool(call.function.name, args);
      } catch (err) {
        result = { error: "Could not run tool: " + err.message };
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  return "Sorry, I couldn't finish that request.";
}