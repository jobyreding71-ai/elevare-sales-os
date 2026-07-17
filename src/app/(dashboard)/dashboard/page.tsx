"use client";

import { useAuth, useDashboardStats, useTasks, useAppointments, useLeads } from "@/lib/hooks";
import { Card, StatCard, Badge, Skeleton } from "@/components/ui";
import { DashboardLayout } from "@/components/layout";
import { formatCurrency, formatDate, getRelativeTime, PIPELINE_STAGES } from "@/lib/utils";
import {
  Users,
  Phone,
  Calendar,
  FileText,
  TrendingUp,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading: statsLoading } = useDashboardStats();
  const { tasks } = useTasks({ assignedTo: user?.id, completed: false });
  const { appointments } = useAppointments({ userId: user?.id, status: "scheduled" });
  const { leads } = useLeads();

  // Calculate pipeline distribution from real leads
  const getPipelineDistribution = () => {
    const stages = [
      { name: "New Lead", value: 8, color: "#3B82F6" },
      { name: "Contacted", value: 5, color: "#EC4899" },
      { name: "Appointment", value: 4, color: "#F59E0B" },
      { name: "Quoted", value: 3, color: "#14B8A6" },
      { name: "Application", value: 3, color: "#2563EB" },
      { name: "Issued", value: 2, color: "#D4AF37" },
    ];

    if (leads && leads.length > 0) {
      const stageCounts = leads.reduce((acc, lead) => {
        const stage = lead.pipeline_stage || "new_lead";
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return stages.map(s => ({
        ...s,
        value: stageCounts[s.name.toLowerCase().replace(" ", "_")] || 0
      })).filter(s => s.value > 0);
    }

    return stages;
  };

  const pipelineData = getPipelineDistribution();

  const revenueData = [
    { month: "Jan", revenue: 12500, leads: 12 },
    { month: "Feb", revenue: 18200, leads: 18 },
    { month: "Mar", revenue: 15800, leads: 15 },
    { month: "Apr", revenue: 22100, leads: 22 },
    { month: "May", revenue: 19500, leads: 19 },
    { month: "Jun", revenue: 24800, leads: 25 },
  ];

  const recentActivity = [
    { type: "call", content: "Called Jennifer Martinez", time: "10 min ago", status: "completed" },
    { type: "appointment", content: "Appointment with Brian Clark", time: "1 hour ago", status: "scheduled" },
    { type: "lead", content: "New lead: Katherine Scott", time: "2 hours ago", status: "new" },
    { type: "policy", content: "Policy issued for Amanda Brooks", time: "3 hours ago", status: "active" },
    { type: "commission", content: "Commission received: $4,620", time: "5 hours ago", status: "paid" },
  ];

  const upcomingTasks = tasks?.slice(0, 4).map(task => ({
    title: task.title,
    due: task.due_date ? formatDate(task.due_date) : "No due date",
    priority: task.priority || "medium"
  })) || [
    { title: "Call Jennifer Martinez", due: "Today, 2:00 PM", priority: "high" },
    { title: "Prepare quote for William Chen", due: "Tomorrow, 10:00 AM", priority: "medium" },
    { title: "Follow up with Christopher Wilson", due: "Tomorrow, 3:00 PM", priority: "high" },
    { title: "Review application status", due: "Mar 15, 9:00 AM", priority: "low" },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="w-4 h-4 text-blue-400" />;
      case "appointment":
        return <Calendar className="w-4 h-4 text-yellow-400" />;
      case "lead":
        return <Users className="w-4 h-4 text-emerald-400" />;
      case "policy":
        return <FileText className="w-4 h-4 text-purple-400" />;
      case "commission":
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Agent"}
            </h1>
            <p className="text-text-secondary mt-1">
              Here's what's happening with your pipeline today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" className="px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              Live
            </Badge>
            <span className="text-sm text-text-muted">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="New Leads Today"
            value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.newLeadsToday ?? 0}
            change={12}
            changeLabel="vs yesterday"
            icon={<Users className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Calls Made"
            value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.callsMade ?? 0}
            change={8}
            changeLabel="vs last week"
            icon={<Phone className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Appointments"
            value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.appointmentsBooked ?? 0}
            icon={<Calendar className="w-5 h-5" />}
            color="gold"
          />
          <StatCard
            title="Applications"
            value={statsLoading ? <Skeleton className="h-8 w-16" /> : stats?.applicationsSubmitted ?? 0}
            icon={<FileText className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Second Row - Commission KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Commission"
            value={statsLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(stats?.grossCommission ?? 0)}
            change={15}
            changeLabel="this month"
            icon={<TrendingUp className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Paid Commission"
            value={statsLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(stats?.paidCommission ?? 0)}
            icon={<DollarSign className="w-5 h-5" />}
            color="gold"
          />
          <StatCard
            title="Monthly Renewals"
            value={statsLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(stats?.monthlyRenewalIncome ?? 0)}
            change={5}
            changeLabel="vs last month"
            icon={<Target className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Close Rate"
            value={statsLoading ? <Skeleton className="h-8 w-16" /> : `${stats?.closeRate ?? 0}%`}
            change={2.3}
            changeLabel="improvement"
            icon={<Activity className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Revenue Trend</h3>
                <p className="text-sm text-text-secondary">Monthly commission earnings</p>
              </div>
              <Badge variant="success">+24.5%</Badge>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#F9FAFB" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Pipeline Distribution */}
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Pipeline</h3>
              <p className="text-sm text-text-secondary">Distribution by stage</p>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pipelineData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-text-secondary">{item.name}</span>
                  <span className="text-xs font-semibold text-text-primary ml-auto">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
              <button className="text-sm text-emerald-400 hover:text-emerald-300">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{activity.content}</p>
                    <p className="text-xs text-text-muted mt-0.5">{activity.time}</p>
                  </div>
                  <Badge
                    variant={
                      activity.status === "completed"
                        ? "success"
                        : activity.status === "active"
                        ? "info"
                        : activity.status === "new"
                        ? "warning"
                        : "default"
                    }
                    size="sm"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Upcoming Tasks</h3>
              <button className="text-sm text-emerald-400 hover:text-emerald-300">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{task.title}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {task.due}
                    </p>
                  </div>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "error"
                        : task.priority === "medium"
                        ? "warning"
                        : "default"
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 rounded-xl bg-surface hover:bg-card-hover border border-border transition-all group">
                <Users className="w-6 h-6 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-text-primary group-hover:text-emerald-400">
                  Add Lead
                </p>
              </button>
              <button className="p-4 rounded-xl bg-surface hover:bg-card-hover border border-border transition-all group">
                <Phone className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-sm font-medium text-text-primary group-hover:text-blue-400">
                  Log Call
                </p>
              </button>
              <button className="p-4 rounded-xl bg-surface hover:bg-card-hover border border-border transition-all group">
                <Calendar className="w-6 h-6 text-yellow-400 mb-2" />
                <p className="text-sm font-medium text-text-primary group-hover:text-yellow-400">
                  Schedule
                </p>
              </button>
              <button className="p-4 rounded-xl bg-surface hover:bg-card-hover border border-border transition-all group">
                <FileText className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-sm font-medium text-text-primary group-hover:text-purple-400">
                  New Quote
                </p>
              </button>
            </div>

            {/* Alerts */}
            <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Attention Needed</p>
                  <p className="text-xs text-text-secondary mt-1">
                    3 leads have been in "Contact Attempted" for over 7 days
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
