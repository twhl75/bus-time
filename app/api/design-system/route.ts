import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const designPath = path.join(process.cwd(), "DESIGN.md");
  const [source, fileStats] = await Promise.all([
    readFile(designPath, "utf8"),
    stat(designPath),
  ]);

  return Response.json(
    {
      source,
      version: `${fileStats.mtimeMs}-${fileStats.size}`,
      updatedAt: fileStats.mtime.toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
