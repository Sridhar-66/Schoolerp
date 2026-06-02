import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Register</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1"><Label>Name</Label><Input placeholder="Full Name" /></div>
        <div className="flex flex-col gap-1"><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
        <div className="flex flex-col gap-1"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
        <div className="flex flex-col gap-1">
          <Label>Role</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full">Register</Button>
      </CardContent>
    </Card>
  )
}
