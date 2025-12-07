// app/api/foods/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Food } from "@/models/Food";

export async function GET() {
  await connectDB();
  const foods = await Food.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(foods);
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const food = await Food.create({
      name: body.name,
      category: body.category,
      tags: body.tags || [],
      weight: body.weight ?? 1,
      isActive: body.isActive ?? true
    });

    return NextResponse.json(food, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to create food" },
      { status: 500 }
    );
  }
}
