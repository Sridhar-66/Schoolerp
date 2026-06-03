import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            School ERP Portal
          </CardTitle>

          <CardDescription className="text-base mt-1">
            Secure access gateway for students and staff.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Log In</Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/register">Register</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}