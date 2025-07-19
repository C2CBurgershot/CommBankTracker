import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

function getAlertIcon(type: string) {
  switch (type) {
    case "fraud":
      return AlertTriangle;
    case "high_volume":
      return Clock;
    case "system":
      return CheckCircle;
    default:
      return AlertTriangle;
  }
}

function getAlertColor(severity: string) {
  switch (severity) {
    case "error":
      return "bg-red-500/10 border-red-500/20 text-red-500";
    case "warning":
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    case "info":
      return "bg-green-500/10 border-green-500/20 text-green-500";
    default:
      return "bg-gray-500/10 border-gray-500/20 text-gray-500";
  }
}

export default function AlertNotifications() {
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="discord-darker rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-3 bg-gray-800/50 rounded-lg">
                <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="discord-darker rounded-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 discord-text">
              No recent alerts
            </div>
          ) : (
            alerts.map((alert: any) => {
              const Icon = getAlertIcon(alert.type);
              const colorClass = getAlertColor(alert.severity);
              
              return (
                <div key={alert.id} className={`flex items-start space-x-3 p-3 border rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium capitalize">{alert.type.replace('_', ' ')}</div>
                    <div className="text-xs discord-text mt-1">{alert.message}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
