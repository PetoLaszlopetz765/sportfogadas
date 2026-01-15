import { createToken } from "./lib/auth";

const token = createToken(1, "USER");
console.log("Token:", token);
