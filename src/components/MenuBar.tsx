import {
  Menubar,
  MenubarItem,
  MenubarMenu,
  MenubarContent,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function MenuBar() {
  const router = useRouter();
  const { signOut } = useClerk();
  return (
    <Menubar className="w-screen fixed top-0">
      <MenubarMenu>
        <MenubarTrigger>Menu</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => router.push("/dashboard")}>
            Dashboard
          </MenubarItem>
          <MenubarItem onClick={() => router.push("/profile")}>
            Profile
          </MenubarItem>
          <MenubarItem onClick={() => signOut()}>
            Logout
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}