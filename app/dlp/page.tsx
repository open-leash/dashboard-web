import { redirect } from "next/navigation";

export default function DlpPage() {
  redirect("/settings?item=plugins");
}
