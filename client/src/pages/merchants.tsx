import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMerchantSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Store, Utensils, Gamepad, Coffee, MoreVertical } from "lucide-react";

function getMerchantIcon(category: string) {
  switch (category) {
    case "main":
      return Utensils;
    case "indepent":
      return Gamepad;
    default:
      return Store;
  }
}

function getMerchantIconColor(category: string) {
  switch (category) {
    case "main":
      return "bg-green-500/20 text-green-500";
    case "items":
      return "bg-blue-500/20 text-blue-500";
    default:
      return "bg-gray-500/20 text-gray-500";
  }
}

export default function Merchants() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ["/api/merchants"],
    refetchInterval: 30000,
  });

  const { data: topMerchants = [], isLoading: topLoading } = useQuery({
    queryKey: ["/api/merchants/top"],
    refetchInterval: 30000,
  });

  const form = useForm({
    resolver: zodResolver(insertMerchantSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      isActive: true,
    },
  });

  const createMerchantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/merchants", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merchants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/merchants/top"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Merchant created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create merchant",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createMerchantMutation.mutate(data);
  };

  const handleCreateMerchant = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Merchants"
          description="Manage bank merchants and view transaction statistics"
          action={{
            label: "Add Merchant",
            onClick: handleCreateMerchant,
          }}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Top Merchants Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="discord-darker border-blue-700">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-700 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-blue-700 rounded w-20"></div>
                            <div className="h-3 bg-blue-700 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              : topMerchants.slice(0, 3).map((merchant: any, index) => {
                  const Icon = getMerchantIcon(merchant.category);
                  const iconColor = getMerchantIconColor(merchant.category);

                  return (
                    <Card
                      key={merchant.id}
                      className="discord-darker border-blue-700"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {merchant.name}
                              </div>
                              <div className="text-sm discord-text">
                                {merchant.orderCount} orders
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              ${merchant.totalRevenue}
                            </div>
                            <div className="text-xs discord-text">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>

          {/* All Merchants */}
          <Card className="discord-darker border-blue-700">
            <CardHeader>
              <CardTitle className="text-white">All Merchants</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse p-4 bg-blue-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-700 rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-blue-700 rounded w-24"></div>
                          <div className="h-3 bg-blue-700 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-blue-700 rounded w-full"></div>
                        <div className="h-3 bg-blue-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {merchants.map((merchant: any) => {
                    const Icon = getMerchantIcon(merchant.category);
                    const iconColor = getMerchantIconColor(merchant.category);

                    return (
                      <div
                        key={merchant.id}
                        className="p-4 bg-blue-800/70 rounded-lg hover:bg-blue-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {merchant.name}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {merchant.category}
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant={
                              merchant.isActive ? "default" : "secondary"
                            }
                          >
                            {merchant.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {merchant.description && (
                          <p className="text-sm discord-text mb-3">
                            {merchant.description}
                          </p>
                        )}
                        <div className="text-xs discord-text">
                          Created By:{" GOVERNMENT "}
                          {formatDistanceToNow(new Date(merchant.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Create Merchant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="discord-darker border-blue-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Merchant</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter merchant name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="food">MAIN</SelectItem>
                        <SelectItem value="items">INDEPENT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter merchant description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMerchantMutation.isPending}
                  className="discord-primary hover:bg-[hsl(var(--discord-secondary))]"
                >
                  {createMerchantMutation.isPending
                    ? "Creating..."
                    : "Create Merchant"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
