"use client";

import { admitStudent } from "@/services/students/admitStudent";

export default function AddStudentPage() {
  async function handleClick() {
    console.log("BUTTON CLICKED");

    try {
      const result = await admitStudent();

      console.log("SUCCESS");

      console.log(result);

      alert("SUCCESS");
    } catch (err) {
      console.error("FULL ERROR");

      console.error(err);

      alert("CHECK CONSOLE");
    }
  }

  return (
    <div className="p-10">
      <button
        onClick={handleClick}
        className="bg-black text-white p-4"
      >
        TEST
      </button>
    </div>
  );
}