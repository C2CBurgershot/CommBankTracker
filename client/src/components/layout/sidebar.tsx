import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  BarChart3, 
  ArrowLeftRight, 
  Wallet, 
  Store, 
  Terminal, 
  Settings,
  Circle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Balances", href: "/balances", icon: Wallet },
  { name: "Merchants", href: "/merchants", icon: Store },
  { name: "Commands", href: "/commands", icon: Terminal },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000,
  });

  return (
    <div className="w-64 discord-darker border-r border-gray-700 flex flex-col">
      {/* Bot Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 discord-primary rounded-full flex items-center justify-center">
            <Bot className="text-xl w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">GameBank Bot</h1>
            <div className="flex items-center space-x-2">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              <span className="text-sm discord-text">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "discord-primary text-white"
                        : "discord-text hover:text-white hover:bg-gray-700"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bot Status */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs discord-text mb-2">Server Status</div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Uptime</span>
            <span>{botStatus?.uptime || "Loading..."}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Commands</span>
            <span>{botStatus?.commandsToday || "0"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
