"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Shield, Zap, BarChart3, Users, Calendar, DollarSign, ChevronDown, Settings, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button, Card, Avatar } from "@/components/ui";
import { useAuth } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Users,
    title: "Lead Management",
    description: "Capture, organize, and score leads automatically with AI-powered insights.",
    color: "emerald",
  },
  {
    icon: Zap,
    title: "AI Call Analysis",
    description: "Transcribe calls, extract insights, and get coaching recommendations instantly.",
    color: "blue",
  },
  {
    icon: BarChart3,
    title: "Visual Pipeline",
    description: "Drag-and-drop Kanban board with real-time updates across all stages.",
    color: "purple",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Integrated calendar with automated reminders and follow-ups.",
    color: "yellow",
  },
  {
    icon: DollarSign,
    title: "Commission Tracking",
    description: "Monitor earnings, forecasts, and residuals with detailed analytics.",
    color: "emerald",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "HIPAA-conscious data handling with encryption and audit logs.",
    color: "blue",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">Elevare</span>
              <span className="text-xs text-emerald-400 font-medium">Sales OS</span>
            </Link>

            {/* Auth Section - Show profile or login buttons */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
            ) : user ? (
              /* User is signed in - show profile dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <Avatar name={user.user_metadata?.full_name || user.email || "User"} size="sm" />
                  <span className="text-sm font-medium text-text-primary hidden sm:block">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-text-muted transition-transform",
                    profileOpen && "rotate-180"
                  )} />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 py-2">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-text-primary">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-surface transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* User is not signed in - show login buttons */
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Start Free Trial</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Sales Intelligence
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Elevate Your
            <br />
            <span className="text-gradient-emerald">Insurance Sales</span>
          </h1>

          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            The ultimate sales operating system for life insurance professionals.
            Capture leads, analyze calls with AI, track commissions, and close more deals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
                View Demo
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-text-muted">
            No credit card required • 14-day free trial • Cancel anytime
          </p>

          {/* Mock Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="bg-surface rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "New Leads", value: "12", change: "+24%" },
                    { label: "Calls Today", value: "8", change: "+12%" },
                    { label: "Appointments", value: "5", change: "+8%" },
                    { label: "Commissions", value: "$12.4K", change: "+32%" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-lg p-4 border border-border">
                      <p className="text-xs text-text-muted">{stat.label}</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
                      <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-lg border border-border flex items-center justify-center">
                  <p className="text-text-muted text-sm">Revenue Trend Chart Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Powerful features designed specifically for insurance sales professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    feature.color === "emerald"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : feature.color === "blue"
                      ? "bg-blue-500/20 text-blue-400"
                      : feature.color === "purple"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-text-primary mb-4">
                Ready to Elevate Your Sales?
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
                Join hundreds of insurance professionals who have transformed their sales process with Elevare.
              </p>
              <Link href="/register">
                <Button size="lg" className="px-12 py-6 text-lg">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-text-primary">Elevare</span>
              <span className="text-xs text-emerald-400">Sales OS</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-text-secondary">
              <Link href="/privacy" className="hover:text-text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-text-primary transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-sm text-text-muted">
              © 2024 Elevare Sales OS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
