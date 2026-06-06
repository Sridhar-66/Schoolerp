import { NextResponse } from "next/server";
// Connects to your logic file from the services/lib directory
import { deleteStudent } from "@/services/students/manageStudents"; 

export async function GET() {
  return Response.json({ data: [], message: "Not implemented yet" })
}

export async function POST() {
  return Response.json({ message: "Not implemented yet" }, { status: 501 })
}

// 👇 ADDED THIS DELETE HANDLER TO FIX THE 405 ERROR
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // 1. Guard clause if no ID was provided in the query string
  if (!id) {
    return NextResponse.json({ error: "Missing student ID parameter" }, { status: 400 });
  }

  try {
    // 2. Convert ID string to a number and execute your clean DB/Auth purge
    const result = await deleteStudent(Number(id));
    
    // 3. Return the { success: true } object back to your frontend table component
    return NextResponse.json(result);
  } catch (error: any) {
    // Catches any 'throw new Error' from your manageStudents.ts file
    console.error("API Route Deletion Exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}