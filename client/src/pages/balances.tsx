import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function Balances() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
    refetchInterval: 30000,
  });

  // Sort users by balance (highest first)
  const sortedUsers = [...users].sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="User Balances"
          description="Monitor user account balances and activity"
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="discord-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium discord-text">Total Users</CardTitle>
                <Wallet className="h-4 w-4 discord-text" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{users.length}</div>
                <p className="text-xs discord-text">Registered accounts</p>
              </CardContent>
            </Card>

            <Card className="discord-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium discord-text">Total Balance</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${users.reduce((sum, user) => sum + parseFloat(user.balance), 0).toFixed(2)}
                </div>
                <p className="text-xs discord-text">Combined user balances</p>
              </CardContent>
            </Card>

            <Card className="discord-darker border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium discord-text">Average Balance</CardTitle>
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  ${users.length > 0 ? (users.reduce((sum, user) => sum + parseFloat(user.balance), 0) / users.length).toFixed(2) : "0.00"}
                </div>
                <p className="text-xs discord-text">Per user average</p>
              </CardContent>
            </Card>
          </div>

          {/* User Balances Table */}
          <Card className="discord-darker border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-700 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedUsers.map((user: any, index) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm discord-text w-6">#{index + 1}</span>
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="discord-primary text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.username}</div>
                          <div className="text-sm discord-text">
                            Discord ID: {user.discordId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">${user.balance}</div>
                          <div className="text-xs discord-text">
                            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <Badge 
                          variant={parseFloat(user.balance) > 50 ? "default" : "secondary"}
                          className={parseFloat(user.balance) > 50 ? "status-completed" : "status-pending"}
                        >
                          {parseFloat(user.balance) > 50 ? "Active" : "Low Balance"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-8 discord-text">
                      No users found
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
