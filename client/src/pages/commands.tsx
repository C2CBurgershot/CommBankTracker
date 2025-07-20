import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  Bot,
  Users,
  DollarSign,
  Store,
  ArrowRightLeft,
} from "lucide-react";

const commands = [
  {
    name: "/balance",
    description: "Check user balance",
    usage: "/balance [@user]",
    category: "Finance",
    icon: DollarSign,
  },
  {
    name: "/transaction",
    description: "Get transaction details",
    usage: "/transaction [id]",
    category: "Finance",
    icon: ArrowRightLeft,
  },
  {
    name: "/history",
    description: "View transaction history",
    usage: "/history [@user] [limit]",
    category: "Finance",
    icon: Terminal,
  },
  {
    name: "/merchants",
    description: "List available merchants",
    usage: "/merchants",
    category: "Shopping",
    icon: Store,
  },
  {
    name: "/pay",
    description: "Send money to another user",
    usage: "/pay @user [amount]",
    category: "Finance",
    icon: DollarSign,
  },
  {
    name: "/order",
    description: "Place an order with a merchant",
    usage: "/order [merchant] [amount] [description]",
    category: "Shopping",
    icon: Store,
  },
];

const categories = {
  Finance: "bg-green-500/20 text-green-500",
  Shopping: "bg-blue-500/20 text-blue-500",
  Admin: "bg-red-500/20 text-red-500",
};

export default function Commands() {
  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000,
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Bot Commands"
          description="Available Discord bot commands and their usage"
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Bot Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="discord-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium discord-text">
                  Bot Status
                </CardTitle>
                <Bot className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">Online</div>
                <p className="text-xs discord-text">Responding to commands</p>
              </CardContent>
            </Card>

            <Card className="discord-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium discord-text">
                  Uptime
                </CardTitle>
                <Terminal className="h-4 w-4 discord-text" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {botStatus?.uptime || "Loading..."}
                </div>
                <p className="text-xs discord-text">Current session</p>
              </CardContent>
            </Card>

            <Card className="discord-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium discord-text">
                  Commands Today
                </CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-[hsl(var(--discord-primary))]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {botStatus?.commandsToday || "0"}
                </div>
                <p className="text-xs discord-text">Executed successfully</p>
              </CardContent>
            </Card>

            <Card className="discord-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium discord-text">
                  Available Commands
                </CardTitle>
                <Users className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {commands.length}
                </div>
                <p className="text-xs discord-text">Slash commands</p>
              </CardContent>
            </Card>
          </div>

          {/* Commands List */}
          <Card className="discord-darker border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Available Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {commands.map((command) => (
                  <div
                    key={command.name}
                    className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[hsl(var(--discord-primary))]/20 text-[hsl(var(--discord-primary))] rounded-lg flex items-center justify-center">
                          <command.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-mono text-[hsl(var(--discord-primary))] font-medium">
                            {command.name}
                          </div>
                          <div className="text-sm text-white">
                            {command.description}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          categories[
                            command.category as keyof typeof categories
                          ]
                        }
                      >
                        {command.category}
                      </Badge>
                    </div>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm">
                      <span className="discord-text">Usage: </span>
                      <span className="text-white">{command.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card className="discord-darker border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Usage Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm discord-text mb-2">
                    Check your balance:
                  </div>
                  <div className="font-mono text-[hsl(var(--discord-primary))]">
                    /balance
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm discord-text mb-2">
                    Send money to another user:
                  </div>
                  <div className="font-mono text-[hsl(var(--discord-primary))]">
                    /pay @username 69.00
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm discord-text mb-2">
                    Place an order:
                  </div>
                  <div className="font-mono text-[hsl(var(--discord-primary))]">
                    /order "BURGERSHOT" 15.99 "Moneyshot combo"
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm discord-text mb-2">
                    View transaction history:
                  </div>
                  <div className="font-mono text-[hsl(var(--discord-primary))]">
                    /history @username 10
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
