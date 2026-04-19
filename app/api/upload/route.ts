import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireUser, AuthError } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Simple local-disk upload handler. Writes files to /public/uploads/ so they
 * are served statically at /uploads/<name>. Swap this for S3/Cloudinary in
 * production if you want off-host storage.
 */
export async function POST(req: NextRequest) {
  try {
    await requireUser();
    const form = await req.formData();
    const files = form.getAll("file");
    if (files.length === 0) return NextResponse.json({ error: "No files" }, { status: 400 });

    const urls: string[] = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    for (const f of files) {
      if (!(f instanceof File)) continue;
      if (!ALLOWED.has(f.type)) {
        return NextResponse.json({ error: `${f.name}: only JPG/PNG/WebP allowed` }, { status: 400 });
      }
      if (f.size > MAX_SIZE) {
        return NextResponse.json({ error: `${f.name}: file too large (max 10MB)` }, { status: 400 });
      }
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const name = `${randomUUID()}.${ext}`;
      const buf = Buffer.from(await f.arrayBuffer());
      await writeFile(path.join(uploadDir, name), buf);
      urls.push(`/uploads/${name}`);
    }

    return NextResponse.json({ urls });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("upload error:", err);
    return NextResponse.json({ error: "Could not upload" }, { status: 500 });
  }
}
