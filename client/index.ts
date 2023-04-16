import "dotenv/config";
import axios from "axios";
import jwt from "jsonwebtoken";

const main = async () => {
  if (process.argv.length != 3) {
    console.warn("pnpm client [url]");
  }
  const url = process.argv[2] as string;
  const token = jwt.sign({ sub: "test" }, process.env.SECRET!, {
    expiresIn: 300,
  });
  const res = await axios.post(
    url,
    {
      action: "chat",
      params: {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "What is HelloKitty?" }],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(res.statusText);
  console.log(res.data.choices[0].message);
};

main().then(() => {
  console.log("done");
});
