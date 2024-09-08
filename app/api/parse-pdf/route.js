import { NextResponse } from "next/server";

export async function POST(request) {
  console.log("API route hit");

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    console.log("File received, size:", buffer.byteLength);

    try {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(Buffer.from(buffer));
      console.log("PDF parsed successfully, text length:", data.text.length);
      return NextResponse.json({
        message: "File parsed successfully",
        fullText: data.text,
      });
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      return NextResponse.json(
        { error: "Failed to parse PDF", details: parseError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
