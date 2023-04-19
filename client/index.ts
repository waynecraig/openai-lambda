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
      action: "image-variation",
      params: {
        image: "https://hht-pub.bulingbuling.com/artwork/8c4955dab51ee45cd2e27834b1a9639b.png",
        n: 1,
        size: "256x256",
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
