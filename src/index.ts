import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Configuration, OpenAIApi } from "openai";
import jwt from "jsonwebtoken";
import axios from "axios";
import { File } from "buffer";

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
      case "image-edit":
        response = await openai.createImageEdit(
          await urlToFile(params.image),
          params.prompt,
          params.mask ? await urlToFile(params.mask) : undefined,
          params.n,
          params.size,
          params.responseFormat,
          params.user,
        )
        break;
      case "image-variation":
        response = await openai.createImageVariation(
          urlToFile(params.image),
          params.n,
          params.size,
          params.responseFormat,
          params.user,
        );
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
  const auth = event.headers.Authorization || event.headers.authorization;
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


// Function to convert a remote url to a File object
// The function takes a remote url as input and returns a File object. 
// It uses axios to make a GET request to the url and sets the responseType to "blob" to get the response as a Blob object. 
// It then creates a new File object from the Blob and returns it. 
// The filename of the File is extracted from the url and the type is set to the type of the Blob.
const urlToFile = async (url: string): Promise<File> => {
  const response = await axios.get(url, { responseType: "blob" });
  const blob = response.data;
  const filename = url.substring(url.lastIndexOf("/") + 1);
  const file = new File([blob], filename, { type: blob.type });
  return file;
};
