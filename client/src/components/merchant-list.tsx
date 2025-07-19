import { useQuery } from "@tanstack/react-query";
import { Utensils, Gamepad, Coffee } from "lucide-react";

function getMerchantIcon(category: string) {
  switch (category) {
    case "food":
      return Utensils;
    case "items":
      return Gamepad;
    default:
      return Coffee;
  }
}

function getMerchantIconColor(category: string) {
  switch (category) {
    case "food":
      return "bg-green-500/20 text-green-500";
    case "items":
      return "bg-blue-500/20 text-blue-500";
    default:
      return "bg-[hsl(var(--discord-primary))]/20 text-[hsl(var(--discord-primary))]";
  }
}

export default function MerchantList() {
  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ["/api/merchants/top"],
  });

  if (isLoading) {
    return (
      <div className="discord-darker rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Top Merchants</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-700 rounded w-16 mb-1"></div>
                </div>
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
        <h3 className="text-lg font-semibold text-white">Top Merchants</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {merchants.slice(0, 5).map((merchant: any) => {
            const Icon = getMerchantIcon(merchant.category);
            const iconColor = getMerchantIconColor(merchant.category);
            
            return (
              <div key={merchant.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{merchant.name}</div>
                    <div className="text-sm discord-text">{merchant.orderCount} orders</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">${merchant.totalRevenue}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
