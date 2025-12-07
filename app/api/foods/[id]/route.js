// app/api/foods/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Food } from "@/models/Food";

export async function PUT(req, { params }) {
  const { id } = await params;

  try {
    await connectDB();
    const body = await req.json();

    const updated = await Food.findByIdAndUpdate(
      id,
      {
        name: body.name,
        category: body.category,
        tags: body.tags || [],
        weight: body.weight ?? 1,
        isActive: body.isActive ?? true
      },
      { new: true }
    ).lean();

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to update food" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await connectDB();
    await Food.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to delete food" },
      { status: 500 }
    );
  }
}
