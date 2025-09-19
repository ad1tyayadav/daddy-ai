/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { saveFile } from "@/lib/fileStore";

export const runtime = "nodejs"; // ensures Node APIs like Buffer work

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    console.log("Received file:", file?.name, file?.type, file?.size);

    if (!file) {
      console.log("No file found in request");
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("Buffer length:", buffer.length);

    // Save in in-memory store
    const fileId = saveFile(buffer, file.name, file.type);

    console.log("Saved file with ID:", fileId);

    return NextResponse.json({
      success: true,
      fileId,
      filename: file.name,
      size: buffer.length,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}