import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/stats-card";
import TransactionTable from "@/components/transaction-table";
import CommandCenter from "@/components/command-center";
import MerchantList from "@/components/merchant-list";
import AlertNotifications from "@/components/alert-notifications";
import { DollarSign, ArrowLeftRight, Users, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions/recent"],
    refetchInterval: 10000,
  });

  const handleAddMerchant = () => {
    // This would open a modal or navigate to merchant creation page
    alert("Add merchant functionality would be implemented here");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          description="Monitor CommBank bot transactions and user activity"
          }}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Volume"
              value={
                statsLoading ? "Loading..." : `$${stats?.totalVolume || "0.00"}`
              }
              icon={DollarSign}
              iconColor="bg-green-500/90 text-white-500"
              change={{ value: "0%", type: "positive" }}
            />
            <StatsCard
              title="Transactions"
              value={
                statsLoading ? "Loading..." : stats?.totalTransactions || 0
              }
              icon={ArrowLeftRight}
              iconColor="bg-blue-500/90 text-white-500"
              change={{ value: "0%", type: "positive" }}
            />
            <StatsCard
              title="Active Users"
              value={statsLoading ? "Loading..." : stats?.activeUsers || 0}
              icon={Users}
              iconColor="bg-yellow-500/90 text-white-500"
              change={{ value: "1%", type: "positive" }}
            />
            <StatsCard
              title="Failed Today"
              value={
                statsLoading ? "Loading..." : stats?.failedTransactions || 0
              }
              icon={AlertTriangle}
              iconColor="bg-red-500/90 text-White-500"
              change={{ value: "0%", type: "negative" }}
            />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              {transactionsLoading ? (
                <div className="discord-darker rounded-xl border border-blue-700 p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-blue-700 rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 bg-blue-700 rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <TransactionTable transactions={transactions} />
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <CommandCenter />
              <MerchantList />
              <AlertNotifications />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
