import { listDashboardData } from "@/lib/mock-db";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function HomePage() {
  const initialData = await listDashboardData();

  return <DashboardClient initialData={initialData} />;
}
