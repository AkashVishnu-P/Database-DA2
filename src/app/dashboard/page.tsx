import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardIndexPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  switch (user.role) {
    case "DOCTOR":
      redirect("/dashboard/doctor");
    case "RECEPTIONIST":
      redirect("/dashboard/reception");
    case "CASHIER":
      redirect("/dashboard/cashier");
    case "PHARMACIST":
      redirect("/dashboard/pharmacist");
    case "LAB_TECHNICIAN":
      redirect("/dashboard/lab");
    case "NURSE":
      redirect("/dashboard/nurse");
    case "PATIENT":
      redirect("/dashboard/patient");
    default:
      redirect("/dashboard/admin");
  }
}
