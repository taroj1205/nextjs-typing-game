import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

const SignOut = () => {
  const router = useRouter()
  const { signOut } = useClerk();

  signOut(() => router.push("/"));

  return (
    <div>Signing you out...</div>
  )
}