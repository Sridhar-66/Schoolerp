import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader><CardTitle>Verify Email</CardTitle></CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Check your email to verify your account.</p>
      </CardContent>
    </Card>
  )
}
