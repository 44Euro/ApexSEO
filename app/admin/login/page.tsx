import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/admin/articles");

  const { callbackUrl } = await searchParams;

  return (
    <div className="grid min-h-screen place-items-center p-[40px]">
      <LoginForm callbackUrl={callbackUrl ?? "/admin/articles"} />
    </div>
  );
}
