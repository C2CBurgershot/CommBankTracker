import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  change?: {
    value: string;
    type: "positive" | "negative";
  };
}

export default function StatsCard({ title, value, icon: Icon, iconColor, change }: StatsCardProps) {
  return (
    <div className="discord-darker rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
          <Icon className="text-xl w-6 h-6" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm discord-text">{title}</div>
        </div>
      </div>
      {change && (
        <div className="flex items-center text-sm">
          <span className={change.type === "positive" ? "text-green-500" : "text-red-500"}>
            {change.type === "positive" ? "+" : ""}{change.value}
          </span>
          <span className="discord-text ml-1">from last week</span>
        </div>
      )}
    </div>
  );
}
