import { NextResponse } from "next/server";

const ALLOWED_COMPILERS = [
  "openjdk-jdk-21+35",
  "gcc-13.2.0",
  "nodejs-20.17.0"
];

export async function POST(request) {
  try {
    const { code, compiler, stdin } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid code parameter" }, { status: 400 });
    }

    if (!compiler || !ALLOWED_COMPILERS.includes(compiler)) {
      return NextResponse.json({ error: "Invalid or unsupported compiler" }, { status: 400 });
    }

    const res = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, compiler, stdin: stdin || "" })
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Wandbox compilation failed" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
