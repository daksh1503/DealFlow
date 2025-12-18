"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth } from "date-fns";
import {
  DollarSign,
  Clock,
  Calendar,
  TrendingUp,
  Plus,
  Kanban,
  FileText,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/stat-card";
import { LoadingPage } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { DealForm } from "@/components/deal-form";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "@/lib/supabase";
import type { Deal, Payment, Reminder } from "@shared/schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const [showDealForm, setShowDealForm] = useState(false);

  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: [`${API_URL}/api/v1/deals`],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: [`${API_URL}/api/v1/payments`],
  });

  const { data: reminders = [], isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: [`${API_URL}/api/v1/reminders`],
  });

  const isLoading = dealsLoading || paymentsLoading || remindersLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const next7Days = addDays(now, 7);

  const totalEarnings = payments
    .filter((p) => p.paid)
    .reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

  const monthlyEarnings = payments
    .filter((p) => {
      if (!p.paid || !p.paymentDate) return false;
      const date = new Date(p.paymentDate);
      return isAfter(date, monthStart) && isBefore(date, monthEnd);
    })
    .reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

  const pendingPayments = payments
    .filter((p) => !p.paid)
    .reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

  const pendingCount = payments.filter((p) => !p.paid).length;

  const upcomingDeadlines = deals.filter((d) => {
    if (!d.deadline || d.status === "paid") return false;
    const deadline = new Date(d.deadline);
    return isAfter(deadline, now) && isBefore(deadline, next7Days);
  });

  const upcomingReminders = reminders.filter((r) => {
    if (r.sent) return false;
    const remindAt = new Date(r.remindAt);
    return isAfter(remindAt, now) && isBefore(remindAt, next7Days);
  });

  const brandEarnings = payments
    .filter((p) => p.paid)
    .reduce((acc, p) => {
      const deal = deals.find((d) => d.id === p.dealId);
      if (deal) {
        acc[deal.brandName] = (acc[deal.brandName] || 0) + parseFloat(p.amount as string);
      }
      return acc;
    }, {} as Record<string, number>);

  const topBrands = Object.entries(brandEarnings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const platformEarnings = payments
    .filter((p) => p.paid)
    .reduce((acc, p) => {
      const deal = deals.find((d) => d.id === p.dealId);
      if (deal) {
        acc[deal.platform] = (acc[deal.platform] || 0) + parseFloat(p.amount as string);
      }
      return acc;
    }, {} as Record<string, number>);

  const platformData = Object.entries(platformEarnings)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthEarnings = payments
      .filter((p) => {
        if (!p.paid || !p.paymentDate) return false;
        const payDate = new Date(p.paymentDate);
        return isAfter(payDate, monthStart) && isBefore(payDate, monthEnd);
      })
      .reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

    return {
      name: format(date, "MMM"),
      earnings: monthEarnings,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here's your creator business at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowDealForm(true)} data-testid="button-new-deal">
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings)}
          icon={DollarSign}
          testId="stat-total-earnings"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(monthlyEarnings)}
          icon={TrendingUp}
          testId="stat-monthly-earnings"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(pendingPayments)}
          icon={Clock}
          description={`${pendingCount} payment${pendingCount !== 1 ? "s" : ""} pending`}
          testId="stat-pending-payments"
        />
        <StatCard
          title="Active Deals"
          value={deals.filter((d) => d.status !== "paid").length}
          icon={Kanban}
          testId="stat-active-deals"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.some((d) => d.earnings > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Earnings"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="earnings"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No earnings yet"
                description="Complete your first deal to see your earnings trend."
                testId="empty-earnings-chart"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Top Brands</CardTitle>
          </CardHeader>
          <CardContent>
            {topBrands.length > 0 ? (
              <div className="space-y-4">
                {topBrands.map((brand, index) => (
                  <div key={brand.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{brand.name}</p>
                    </div>
                    <p className="text-sm font-mono font-medium">
                      {formatCurrency(brand.value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No brand data"
                description="Track payments to see your top brands."
                testId="empty-top-brands"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Platform Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {platformData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Earnings"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={Kanban}
                title="No platform data"
                description="Complete deals to see platform breakdown."
                testId="empty-platform-chart"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Upcoming Deadlines</CardTitle>
            <Link href="/deals">
              <Button variant="ghost" size="sm" data-testid="link-view-deals">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 4).map((deal) => (
                  <div key={deal.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.brandName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(deal.deadline!), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {deal.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No upcoming deadlines"
                description="You're all caught up!"
                testId="empty-deadlines"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Upcoming Reminders</CardTitle>
            <Link href="/reminders">
              <Button variant="ghost" size="sm" data-testid="link-view-reminders">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.slice(0, 4).map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(reminder.remindAt), "MMM d 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {reminder.type.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="No upcoming reminders"
                description="Set reminders to stay on top of your deals."
                testId="empty-reminders"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => setShowDealForm(true)}
                data-testid="quick-action-deal"
              >
                <Kanban className="w-5 h-5" />
                <span className="text-sm">New Deal</span>
              </Button>
              <Link href="/contracts">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex-col gap-2"
                  data-testid="quick-action-contract"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Upload Contract</span>
                </Button>
              </Link>
              <Link href="/reminders">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex-col gap-2"
                  data-testid="quick-action-reminder"
                >
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">Set Reminder</span>
                </Button>
              </Link>
              <Link href="/deals">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex-col gap-2"
                  data-testid="quick-action-pipeline"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">View Pipeline</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <DealForm
        open={showDealForm}
        onOpenChange={setShowDealForm}
        onSubmit={() => {
          setShowDealForm(false);
        }}
      />
    </div>
  );
}

