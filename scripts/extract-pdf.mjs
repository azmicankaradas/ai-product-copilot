import pdf from "pdf-parse";
import { readFileSync } from "fs";

const buf = readFileSync("d:/Projects/GTC/ai-product-copilot/product-pdf/RF160.pdf");
const data = await pdf(buf);
console.log(data.text);
