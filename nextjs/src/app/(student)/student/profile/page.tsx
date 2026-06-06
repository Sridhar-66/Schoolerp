"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StudentProfileData = {
  id: number;
  roll_no: string;
  date_of_birth: string;
  gender: string;
  full_name: string;
  email: string;
};

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();

        // 1. Get current authenticated user session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn("Profile Debug: No authenticated session found.");
          setLoading(false);
          return;
        }

        // 2. Query only existing database paths (id and the profiles join)
        const { data: studentRaw, error: studentError } = await supabase
          .from("students")
          .select(`
            id,
            profiles (
              full_name
            )
          `)
          .eq("profile_id", user.id)
          .single();

        if (studentError) {
          console.error("Profile Debug -> Supabase Fetch Error:", studentError.message);
          setLoading(false);
          return;
        }

        if (studentRaw) {
          const raw = studentRaw as any;
          
          // Using clean UI placeholders for columns not yet inside your database
          setProfile({
            id: raw.id,
            roll_no: "STU-2026-089", 
            date_of_birth: "2007-11-07", 
            gender: "Male", 
            full_name: raw.profiles?.full_name || "Sridhar Raghumanda", 
            email: user.email || "student@academy.edu",
          });
        }
      } catch (err) {
        console.error("Critical Exception inside Profile Page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-sm text-muted-foreground">Loading profile details...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-medium">Failed to load student profile record. Check console for details.</p>
      </div>
    );
  }

  const formattedDOB = new Date(profile.date_of_birth).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage and view your official student account information.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Avatar */}
        <Card className="md:col-span-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl font-bold mb-4 border shadow-sm">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{profile.full_name}</h2>
          <p className="text-xs font-mono px-2 py-1 bg-muted rounded-md text-muted-foreground mt-1.5">
            ID: {profile.roll_no}
          </p>
          <span className="mt-4 inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            Active Student
          </span>
        </Card>

        {/* Right Card: Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="border-b pb-2 sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-medium mt-0.5 text-foreground">{profile.full_name}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-medium mt-0.5 text-foreground">{profile.email}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Roll Number</p>
              <p className="text-sm font-medium mt-0.5 text-foreground">{profile.roll_no}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date of Birth</p>
              <p className="text-sm font-medium mt-0.5 text-foreground">{formattedDOB}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender</p>
              <p className="text-sm font-medium mt-0.5 text-foreground">{profile.gender}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}