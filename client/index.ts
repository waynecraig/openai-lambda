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
      action: "image",
      params: {
        prompt: "A cute baby sea otter",
        n: 2,
        size: "1024x1024",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log(res.statusText);
  console.log(res.data);
};

main().then(() => {
  console.log("done");
});
