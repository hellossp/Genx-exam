import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { code, compiler, stdin } = await request.json();

    const res = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, compiler, stdin })
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
