import { Config } from "./config/index.js";

console.log("Server is running on port 3000");

const PORT = Config.PORT;

function a(x: number) {
  console.log(x);
  const z = {
    d: 1,
  };
  const a = z.d;
  console.log(a);
  console.log("servering running on", PORT);
}

a(1);
