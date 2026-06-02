import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Reset Password</CardTitle></CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1"><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
        <Button className="w-full">Send Reset Link</Button>
      </CardContent>
    </Card>
  )
}
