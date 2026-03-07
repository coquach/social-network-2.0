import React from 'react';

import { ActivitySquare, BellRing, ShieldCheck, Users } from 'lucide-react';

type MetricIcon = 'shield' | 'users' | 'activity' | 'bell';

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon: MetricIcon;
};

const iconMap: Record<MetricIcon, React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheck,
  users: Users,
  activity: ActivitySquare,
  bell: BellRing,
};

export function MetricsOverview({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((item) => (
        <div
          key={item.label}
          className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm"
        >
          <div className="bg-linear-to-r px-4 py-3 text-sm text-slate-700 font-medium from-sky-50 to-white">
            {item.label}
          </div>

          <div className="flex items-center justify-between px-4 pb-4 pt-3">
            <div>
              <div className="text-2xl font-semibold text-slate-800">{item.value}</div>
              <p className="text-sm text-slate-500">{item.detail}</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-sky-50 to-white p-3 text-sky-600 shadow-inner">
              {React.createElement(iconMap[item.icon], { className: 'h-6 w-6' })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
