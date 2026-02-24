const fs = require("fs");

async function main() {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const buf = fs.readFileSync("d:/Projects/GTC/ai-product-copilot/product-pdf/RF160.pdf");
    const data = await pdfParse(buf);
    console.log(data.text);
}

main().catch(console.error);
