import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface TransactionTableProps {
  transactions: Array<{
    id: number;
    transactionId: string;
    amount: string;
    status: string;
    description?: string | null;
    createdAt: Date;
    user: {
      username: string;
    };
    merchant: {
      name: string;
    };
  }>;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

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

export default function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="discord-darker rounded-xl border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <button className="text-[hsl(var(--discord-primary))] hover:text-white text-sm font-medium">
            View All
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm discord-text border-b border-gray-700">
              <th className="p-4 font-medium">Transaction ID</th>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Merchant</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((transaction) => (
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
                <td className="p-4 discord-text">
                  {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
