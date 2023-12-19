const IncomingMessage = require("http");
const { Configuration, OpenAIApi } = require("openai");

const API_KEY = process.env.OPEN_AI_API_KEY;
const openai = new OpenAIApi(new Configuration({ apiKey: API_KEY }));

exports.streamChatCompletion = async function* (params) {
  console.log(params)
  const response = await openai.createChatCompletion(
    {
      ...params,
      stream: true,
    },
    {
      responseType: "stream",
    }
  );

  const stream = response.data;
  for await (const chunk of stream) {
    const lines = chunk
      .toString("utf8")
      .split("\n")
      .filter((line) => line.trim().startsWith("data: "));
    
    console.log(lines)

    for (const line of lines) {
      const message = line.replace(/^data: /, "");
      if (message === "[DONE]") {
        return;
      }

      console.log(message)
      try{
        const json = JSON.parse(message);
        const token = json.choices[0].delta.content;
        if (token) {
          yield token;
        }
      }catch{
        console.log("JSON connot parse")
      }
    }
  }
}