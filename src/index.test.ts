import { handler } from "./index";

const mockAction = "completion";
const mockParams = { prompt: "Hello,", max_tokens: 5 };
const mockEvent = {
  body: JSON.stringify({ action: mockAction, params: mockParams }),
} as any;
const mockCreateCompletion = jest.fn();
const mockCreateChatCompletion = jest.fn();
const mockCreateEdit = jest.fn();
const mockCreateImage = jest.fn();

// mock the OpenAI api
jest.mock("openai", () => ({
  Configuration: jest.fn().mockImplementation(() => ({
    apiKey: jest.fn(),
  })),
  OpenAIApi: jest.fn().mockImplementation(() => ({
    createCompletion: mockCreateCompletion,
    createChatCompletion: mockCreateChatCompletion,
    createEdit: mockCreateEdit,
    createImage: mockCreateImage,
  })),
}));

// set the OpenAI api key as an environment variable
process.env.OPENAI_API_KEY = "test_api_key";

describe("handler", () => {
  it("should return a successful response for the completion action", async () => {
    // mock the OpenAI response
    const mockResponse = { choices: [{ text: "world" }] };
    mockCreateCompletion.mockResolvedValueOnce({ data: mockResponse });

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockResponse));
  });

  it("should return a successful response for the chat action", async () => {
    // mock the OpenAI response
    const mockResponse = { messages: [{ text: "Hello, how are you?" }] };
    mockCreateChatCompletion.mockResolvedValueOnce({ data: mockResponse });

    // update the event object with the chat action
    const chatEvent = {
      ...mockEvent,
      body: JSON.stringify({ action: "chat", params: mockParams }),
    };

    const result = await handler(chatEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockResponse));
  });

  it("should return a successful response for the edit action", async () => {
    // mock the OpenAI response
    const mockResponse = { text: "Hello, how are you?" };
    mockCreateEdit.mockResolvedValueOnce({ data: mockResponse });

    // update the event object with the edit action
    const editEvent = {
      ...mockEvent,
      body: JSON.stringify({ action: "edit", params: mockParams }),
    };

    const result = await handler(editEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockResponse));
  });

  it("should return a successful response for the image action", async () => {
    // mock the OpenAI response
    const mockResponse = {
      url: "https://openai.com/content/images/2021/05/image.png",
    };
    mockCreateImage.mockResolvedValueOnce({ data: mockResponse });

    // update the event object with the image action
    const imageEvent = {
      ...mockEvent,
      body: JSON.stringify({ action: "image", params: mockParams }),
    };

    const result = await handler(imageEvent);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockResponse));
  });

  it("should return a 500 error response for an unsupported action", async () => {
    // update the event object with an unsupported action
    const unsupportedEvent = {
      ...mockEvent,
      body: JSON.stringify({ action: "invalid", params: mockParams }),
    };

    const result = await handler(unsupportedEvent);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBe(
      JSON.stringify({ message: "Internal Server Error" })
    );
  });

  it("should return a 500 error response if the OpenAI service unavaiable", async () => {
    // mock the OpenAI response
    const mockResponse = { choices: [{ text: "world" }] };
    mockCreateCompletion.mockRejectedValueOnce("error");

    const result = await handler(mockEvent);

    expect(result.statusCode).toBe(500);
    expect(result.body).toBe(
      JSON.stringify({ message: "Internal Server Error" })
    );
  });
});
