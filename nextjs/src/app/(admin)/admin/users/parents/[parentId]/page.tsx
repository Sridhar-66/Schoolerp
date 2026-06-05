import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getParentByStudentId } from "@/services/parents/parents"

interface PageProps {
  params: {
    parentId: string
  }
}

export default async function ParentDetailPage({ params }: PageProps) {
  let parent = null
  let errorMsg = ""

  try {
    // Call your Supabase server action using the URL parameter
    parent = await getParentByStudentId(params.parentId)
  } catch (err: any) {
    console.error(err)
    errorMsg = err.message || "Failed to load parent details."
  }

  // Error handling state
  if (errorMsg) {
    return (
      <div className="p-6 text-xs text-red-500 bg-red-50 rounded-md border border-red-200">
        Error: {errorMsg}
      </div>
    )
  }

  // Fallback if no database row matches
  if (!parent) {
    return (
      <div className="p-6 text-muted-foreground">
        No guardian profile found matching this ID.
      </div>
    )
  }

  const linkedStudent = parent.profiles?.full_name

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Parent Profile</h1>
      
      {/* Dynamic Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Name: </span> 
            {parent.parent_name || "Not Provided"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Contact Phone: </span> 
            <span className="font-mono text-xs">{parent.parent_phone || "—"}</span>
          </p>
        </CardContent>
      </Card>

      {/* Dynamic Linked Student Context */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Student</CardTitle>
        </CardHeader>
        <CardContent>
          {linkedStudent ? (
            <span className="font-medium text-blue-600 bg-blue-50/60 border border-blue-100 rounded-md px-2 py-1 text-xs">
              {linkedStudent}
            </span>
          ) : (
            <p className="text-sm text-muted-foreground">No student linked.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}