"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Badge, StatCard, ProgressBar, Skeleton } from "@/components/ui";
import { useCommissions } from "@/lib/hooks";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  Building2,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("6months");

  const { commissions, isLoading } = useCommissions();

  // Calculate commission stats from real data
  const commissionStats = {
    grossCommission: commissions?.reduce((sum, c) => sum + (c.gross_premium * c.commission_rate / 100), 0) || 48750,
    paidCommission: commissions?.reduce((sum, c) => sum + c.paid_amount, 0) || 38500,
    pendingCommission: commissions?.reduce((sum, c) => sum + (c.gross_premium * c.commission_rate / 100) - c.paid_amount, 0) || 10250,
    monthlyRenewalIncome: commissions?.reduce((sum, c) => sum + c.renewal_amount, 0) || 4200,
    chargebacks: commissions?.reduce((sum, c) => sum + c.chargeback_amount, 0) || 1850,
    advancesPaid: 12000,
    advancesOutstanding: 3500,
  };

  const commissionByCarrier = [
    { name: "Northwestern Mutual", value: 18500, color: "#10B981" },
    { name: "Lincoln Financial", value: 14200, color: "#3B82F6" },
    { name: "Pacific Life", value: 9800, color: "#D4AF37" },
    { name: "John Hancock", value: 6250, color: "#8B5CF6" },
  ];

  const monthlyCommissions = [
    { month: "Jan", gross: 6200, paid: 5800, renewal: 400 },
    { month: "Feb", gross: 8500, paid: 7200, renewal: 800 },
    { month: "Mar", gross: 7800, paid: 6500, renewal: 900 },
    { month: "Apr", gross: 9200, paid: 8500, renewal: 1000 },
    { month: "May", gross: 10500, paid: 9000, renewal: 1100 },
    { month: "Jun", gross: 6550, paid: 5500, renewal: 1000 },
  ];

  const cashFlowForecast = [
    { month: "Jul", expected: 8200, type: "forecast" },
    { month: "Aug", expected: 7800, type: "forecast" },
    { month: "Sep", expected: 9500, type: "forecast" },
    { month: "Oct", expected: 11200, type: "forecast" },
    { month: "Nov", expected: 9800, type: "forecast" },
    { month: "Dec", expected: 12500, type: "forecast" },
  ];

  const recentCommissions = commissions?.slice(0, 5).map((c: any) => ({
    id: c.id,
    policy: `Policy #${c.policy_id.slice(0, 8)}`,
    carrier: "Insurance Carrier",
    amount: c.gross_premium * c.commission_rate / 100,
    type: c.renewal_amount > 0 ? "renewal" : "new",
    status: c.commission_status,
    date: c.created_at,
  })) || [
    { id: "1", policy: "Jennifer Martinez - Whole Life", carrier: "Northwestern Mutual", amount: 4200, type: "new", status: "paid", date: "2024-06-15" },
    { id: "2", policy: "Robert Anderson - Term Life", carrier: "Lincoln Financial", amount: 1850, type: "renewal", status: "paid", date: "2024-06-10" },
    { id: "3", policy: "Amanda Brooks - Whole Life", carrier: "Northwestern Mutual", amount: 5800, type: "new", status: "pending", date: "2024-06-08" },
    { id: "4", policy: "Christopher Wilson - UL", carrier: "Pacific Life", amount: 2100, type: "renewal", status: "pending", date: "2024-06-05" },
    { id: "5", policy: "Michael Johnson - Term Life", carrier: "John Hancock", amount: 3200, type: "new", status: "pending", date: "2024-06-01" },
  ];

  const pendingAdvances = [
    { id: "1", lead: "Amanda Brooks", amount: 3500, date: "2024-06-08", status: "pending" },
    { id: "2", lead: "Christopher Wilson", amount: 1800, date: "2024-06-05", status: "pending" },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "commissions", label: "Commissions" },
    { id: "advances", label: "Advances" },
    { id: "forecast", label: "Forecast" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Commission Center</h1>
            <p className="text-text-secondary mt-1">
              Track your earnings, renewals, and commission forecasts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg text-text-primary text-sm"
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last 12 Months</option>
              <option value="ytd">Year to Date</option>
            </select>
            <Button variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Commission"
            value={isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(commissionStats.grossCommission)}
            change={18.5}
            changeLabel="vs last period"
            icon={<DollarSign className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Paid Commission"
            value={isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(commissionStats.paidCommission)}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="gold"
          />
          <StatCard
            title="Pending Commission"
            value={isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(commissionStats.pendingCommission)}
            icon={<Clock className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            title="Monthly Renewals"
            value={isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(commissionStats.monthlyRenewalIncome)}
            change={8.2}
            changeLabel="vs last month"
            icon={<RefreshCw className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-surface p-1 rounded-lg border border-border w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-card"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Commission by Carrier */}
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Commission by Carrier</h3>
                  <p className="text-sm text-text-secondary">Breakdown of earnings by insurance carrier</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={commissionByCarrier}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {commissionByCarrier.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {commissionByCarrier.map((carrier) => (
                    <div key={carrier.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: carrier.color }}
                        />
                        <span className="text-sm text-text-secondary">{carrier.name}</span>
                      </div>
                      <span className="font-medium text-text-primary">{formatCurrency(carrier.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Chargebacks & Advances */}
            <div className="space-y-6">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-secondary">Chargebacks</h3>
                  <Badge variant="error">-{formatCurrency(commissionStats.chargebacks)}</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">This Period</span>
                    <span className="text-red-400 font-medium">-1,850</span>
                  </div>
                  <ProgressBar value={3.8} max={100} color="red" />
                  <p className="text-xs text-text-muted">3.8% chargeback rate (industry avg: 5%)</p>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-secondary">Advances</h3>
                  <Badge variant="warning">{formatCurrency(commissionStats.advancesOutstanding)}</Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Outstanding</span>
                    <span className="text-yellow-400 font-medium">3,500</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Recovered (MTD)</span>
                    <span className="text-emerald-400 font-medium">12,000</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">YTD Production</p>
                    <p className="text-xs text-text-muted">vs. last year</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-emerald-400">+24.5%</p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "commissions" && (
          <div className="space-y-6">
            {/* Monthly Commission Chart */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Commission Trend</h3>
                  <p className="text-sm text-text-secondary">Monthly gross vs paid commission</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyCommissions}>
                    <defs>
                      <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
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
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === "gross" ? "Gross" : "Paid",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="gross"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorGross)"
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPaid)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-text-secondary">Gross Commission</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-text-secondary">Paid Commission</span>
                </div>
              </div>
            </Card>

            {/* Recent Commissions Table */}
            <Card className="p-0">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-text-primary">Recent Commissions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface/50">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Policy</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Carrier</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentCommissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-primary">{commission.policy}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-text-muted" />
                            <span className="text-sm text-text-secondary">{commission.carrier}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={commission.type === "new" ? "success" : "info"}>
                            {commission.type === "new" ? "New" : "Renewal"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-emerald-400">{formatCurrency(commission.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={commission.status === "paid" ? "success" : "warning"}>
                            {commission.status === "paid" ? "Paid" : "Pending"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-muted">{formatDate(commission.date)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "advances" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outstanding Advances */}
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-text-primary">Outstanding Advances</h3>
              </div>
              <div className="p-6 space-y-4">
                {pendingAdvances.map((advance) => (
                  <div key={advance.id} className="p-4 rounded-xl bg-surface">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/20">
                          <CreditCard className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{advance.lead}</p>
                          <p className="text-xs text-text-muted">{formatDate(advance.date)}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-yellow-400">{formatCurrency(advance.amount)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <ProgressBar value={35} max={100} color="gold" />
                      <span className="text-xs text-text-muted">35% recovered</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recovery Stats */}
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-text-primary">Recovery Statistics</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-surface text-center">
                    <p className="text-3xl font-bold text-emerald-400">98.2%</p>
                    <p className="text-sm text-text-muted mt-1">Recovery Rate</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface text-center">
                    <p className="text-3xl font-bold text-text-primary">45</p>
                    <p className="text-sm text-text-muted mt-1">Avg Days to Recover</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Advances Paid (YTD)</span>
                    <span className="font-medium text-text-primary">{formatCurrency(commissionStats.advancesPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Advances Outstanding</span>
                    <span className="font-medium text-yellow-400">{formatCurrency(commissionStats.advancesOutstanding)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Recovery Progress</span>
                    <span className="font-medium text-emerald-400">77.4%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "forecast" && (
          <div className="space-y-6">
            {/* Cash Flow Forecast */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">6-Month Cash Flow Forecast</h3>
                  <p className="text-sm text-text-secondary">Expected commission income based on policy projections</p>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowForecast}>
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
                      formatter={(value: number) => [formatCurrency(value), "Expected"]}
                    />
                    <Bar dataKey="expected" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="font-medium text-text-primary">6-Month Projection</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(cashFlowForecast.reduce((acc, curr) => acc + curr.expected, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tax Estimate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Tax Estimate (1099)</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Gross Income</span>
                    <span className="font-medium text-text-primary">{formatCurrency(commissionStats.grossCommission)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Business Expenses (Est.)</span>
                    <span className="font-medium text-red-400">-{formatCurrency(4875)}</span>
                  </div>
                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">Taxable Income (Est.)</span>
                    <span className="font-bold text-text-primary">{formatCurrency(commissionStats.grossCommission - 4875)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface">
                    <p className="text-xs text-text-muted mb-1">Estimated Tax (25% bracket)</p>
                    <p className="text-lg font-bold text-yellow-400">{formatCurrency((commissionStats.grossCommission - 4875) * 0.25)}</p>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Production Leaderboard</h3>
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "You", amount: 48750, trend: "up" },
                    { rank: 2, name: "Sarah Chen", amount: 42100, trend: "up" },
                    { rank: 3, name: "Marcus Johnson", amount: 38500, trend: "down" },
                  ].map((agent) => (
                    <div key={agent.rank} className="flex items-center gap-3 p-3 rounded-lg bg-surface">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        agent.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                        agent.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                        "bg-orange-600/20 text-orange-600"
                      )}>
                        {agent.rank}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{agent.name}</p>
                        <p className="text-xs text-text-muted">YTD Production</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-text-primary">{formatCurrency(agent.amount)}</p>
                        {agent.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400 ml-auto" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-400 ml-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
