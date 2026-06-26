import { redirect } from "next/navigation";

export default function CompressionPage() {
  redirect("/settings?item=plugins");
}
