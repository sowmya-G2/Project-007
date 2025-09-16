import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Thank you for signing up!</CardTitle>
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                You&apos;ve successfully signed up. Please check your email to confirm your account before signing in.
                Once confirmed, you'll be able to choose your AI assistant and start trading.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
