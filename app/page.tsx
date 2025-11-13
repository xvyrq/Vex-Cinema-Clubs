import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-3xl text-center space-y-8">
        <div>
          <h1 className="text-5xl font-bold mb-4">🎬 Movie Club</h1>
          <p className="text-xl text-muted-foreground">
            Watch movies with friends, take turns picking, and rate together
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 my-12">
          <div className="p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Create Groups</h3>
            <p className="text-sm text-muted-foreground">
              Start a movie club with friends and become the commissioner
            </p>
          </div>
          <div className="p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Take Turns</h3>
            <p className="text-sm text-muted-foreground">
              Members rotate picking movies on a schedule you control
            </p>
          </div>
          <div className="p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Rate & Review</h3>
            <p className="text-sm text-muted-foreground">
              Share your thoughts and see what everyone thinks
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/auth/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/auth/login">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
