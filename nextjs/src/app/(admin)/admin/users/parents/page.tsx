"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getParents, ParentRecord } from "@/services/parents/parents";

export default function ParentsPage() {
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDirectory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getParents();
      
      // Sort parents alphabetically by name
      const sorted = [...data].sort((a, b) => {
        const nameA = (a.parent_name || "Unnamed Parent").toLowerCase();
        const nameB = (b.parent_name || "Unnamed Parent").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setParents(sorted);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load guardian listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parents Directory</h1>
        <p className="text-sm text-muted-foreground">
          View and manage parent/guardian contact information tied to student profiles.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-500 bg-red-50 p-3 rounded-md border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parent Name</TableHead>
              <TableHead>Contact Phone</TableHead>
              <TableHead>Child (Student Reference)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">
                  Querying guardian roster rows...
                </TableCell>
              </TableRow>
            ) : parents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No guardian profile mappings found.
                </TableCell>
              </TableRow>
            ) : (
              parents.map((p) => {
                const pName = p.parent_name || "Not Provided";
                const pPhone = p.parent_phone || "—";
                const childName = p.profiles?.full_name || "Unknown Student Row";

                return (
                  <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-semibold text-slate-900">{pName}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{pPhone}</TableCell>
                    <TableCell className="text-sm text-slate-700">
                      <span className="font-medium text-blue-600 bg-blue-50/60 border border-blue-100 rounded-md px-2 py-0.5 text-xs">
                        {childName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild className="text-xs h-8">
                        <Link href={`/admin/users/parents/${p.id}`}>
                          Edit Info
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}