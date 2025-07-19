import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "status-completed";
    case "pending":
      return "status-pending";
    case "failed":
    case "cancelled":
      return "status-failed";
    default:
      return "";
  }
}

export default function Transactions() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    refetchInterval: 10000,
  });

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Transactions"
          description="View and manage all game banking transactions"
        />

        <main className="flex-1 overflow-auto p-6">
          <Card className="discord-darker border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">All Transactions</CardTitle>
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
                      <div className="h-4 bg-gray-700 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm discord-text border-b border-gray-700">
                        <th className="p-4 font-medium">Transaction ID</th>
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Merchant</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Description</th>
                        <th className="p-4 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.map((transaction: any) => (
                        <tr 
                          key={transaction.id} 
                          className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="p-4">
                            <span className="font-mono text-[hsl(var(--discord-primary))]">
                              #{transaction.transactionId}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="discord-primary text-xs">
                                  {transaction.user.username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-white">{transaction.user.username}</span>
                            </div>
                          </td>
                          <td className="p-4 text-white">{transaction.merchant.name}</td>
                          <td className="p-4 font-medium text-white">${transaction.amount}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="p-4 text-white max-w-xs truncate">
                            {transaction.description || "N/A"}
                          </td>
                          <td className="p-4 discord-text">
                            {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
