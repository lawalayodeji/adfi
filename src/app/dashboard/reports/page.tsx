import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Detailed performance analytics</p>
      </div>
      <ReportsClient />
    </div>
  );
}
