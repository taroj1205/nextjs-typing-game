import { useClerk } from "@clerk/nextjs"
import { useLoading } from "@yamada-ui/react";
import { useRouter } from "next/navigation"

const SignOut = () => {
  const router = useRouter()
  const { signOut } = useClerk();
  const {screen} = useLoading();

  screen.start()

  signOut(() => {router.push("/");
    screen.finish();
});

  return (
    <div>Signing you out...</div>
  )
}

export default SignOut;