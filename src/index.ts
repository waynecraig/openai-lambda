import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Configuration, OpenAIApi } from "openai";
import jwt from "jsonwebtoken";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const allowed = checkPermission(event);
    if (!allowed) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "No Permission" }),
      };
    }
    const { action, params } = JSON.parse(event.body!);
    // Initialize the OpenAI client with API credentials
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    // Call the OpenAI sdk with the provided params for the specified action
    let response;
    switch (action) {
      case "completion":
        response = await openai.createCompletion(params);
        break;
      case "chat":
        response = await openai.createChatCompletion(params);
        break;
      case "edit":
        response = await openai.createEdit(params);
        break;
      case "image":
        response = await openai.createImage(params);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    // Return the OpenAI sdk response
    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

// Check authorization, return true if authorized
const checkPermission = (event: APIGatewayProxyEvent): boolean => {
  const auth = event.headers.Authorization;
  if (!auth || auth.indexOf("Bearer ") !== 0) {
    console.log("no credential");
    return false;
  }
  const token = auth.replace("Bearer ", "");
  try {
    const info = jwt.verify(token, process.env.SECRET!);
    console.log("verified", info);
    return true;
  } catch (e) {
    console.log("verifing failed", e);
    return false;
  }
};
