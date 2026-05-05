import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function GET() {
  const icon = await readFile(join(process.cwd(), "assets", "favicon-dark.ico"));

  return new Response(icon, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/x-icon",
    },
  });
}
