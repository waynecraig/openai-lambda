# openai-lambda

[![deploy to lambda](https://github.com/waynecraig/openai-lambda/actions/workflows/main.yml/badge.svg)](https://github.com/waynecraig/openai-lambda/actions/workflows/main.yml)

This project allows you to deploy the OpenAI SDK on an AWS Lambda Function, and then call it via your own URL.

## Usage

To use openai-lambda:

1. Set up a Lambda function with NodeJS, and enable the function URL with NONE AuthType.

2. Build the project, and use `dist/index.js` as the Lambda source code. You can choose to deploy manually or utilize Github Actions for deployment.

3. Set your OpenAI key and JWT secret as environment variables in Lambda.

4. You can now use the URL with your JWT token. See the example in `client/index.ts`.

We hope that this project will be useful for anyone who wants to use the OpenAI SDK on AWS Lambda. If you have any questions or feedback, don't hesitate to reach out to us!