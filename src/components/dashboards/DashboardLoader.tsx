"use client";

import dynamic from "next/dynamic";

function DashboardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 shadow-float" aria-busy="true" aria-label="Carregando dashboard">
      <div className="h-[60px] border-b border-ink-200 bg-white" />
      <div className="h-[108px] border-b border-ink-200 bg-white" />
      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-xl bg-white" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="h-[300px] animate-pulse rounded-xl bg-white lg:col-span-3" />
          <div className="h-[300px] animate-pulse rounded-xl bg-white lg:col-span-2" />
        </div>
      </div>
    </div>
  );
}

const dashboards = {
  condominios: dynamic(() => import("./CondominiosDashboard"), { ssr: false, loading: DashboardSkeleton }),
  distribuidora: dynamic(() => import("./DistribuidoraDashboard"), { ssr: false, loading: DashboardSkeleton }),
  financeiro: dynamic(() => import("./FinanceiroDashboard"), { ssr: false, loading: DashboardSkeleton }),
};

export function DashboardLoader({ id }: { id: keyof typeof dashboards }) {
  const Dashboard = dashboards[id];
  return <Dashboard />;
}
