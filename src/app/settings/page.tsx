"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Button, Input, Avatar, Badge } from "@/components/ui";
import { useAuth } from "@/lib/hooks";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Users,
  Palette,
  Globe,
  Key,
  ChevronRight,
  Check,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("profile");

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Users },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-text-secondary rotate-180" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Settings</h1>
                <p className="text-sm text-text-muted">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeSection === "profile" && (
              <>
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    Profile Information
                  </h2>
                  <div className="flex items-center gap-6 mb-8">
                    <Avatar
                      name={user?.user_metadata?.full_name || user?.email || "User"}
                      size="lg"
                    />
                    <div>
                      <p className="font-medium text-text-primary">
                        {user?.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-sm text-text-muted">{user?.email}</p>
                      <Button variant="secondary" size="sm" className="mt-2">
                        Change Photo
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        defaultValue={user?.user_metadata?.full_name || ""}
                        placeholder="Your full name"
                      />
                      <Input
                        label="Email"
                        type="email"
                        defaultValue={user?.email || ""}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Phone"
                        type="tel"
                        placeholder="(208) 555-0100"
                      />
                      <Input
                        label="Company"
                        placeholder="Your company name"
                      />
                    </div>
                    <Input
                      label="Bio"
                      placeholder="Tell us a bit about yourself..."
                    />
                    <div className="flex justify-end pt-4">
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-text-primary mb-6">
                    Subscription Plan
                  </h2>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-text-primary">Pro Plan</p>
                          <Badge variant="success" size="sm">Active</Badge>
                        </div>
                        <p className="text-sm text-text-secondary mt-0.5">
                          Unlimited leads, AI analysis, premium support
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary">Manage Plan</Button>
                  </div>
                </Card>
              </>
            )}

            {activeSection === "notifications" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    { label: "New lead assignments", description: "Get notified when new leads are assigned to you", enabled: true },
                    { label: "Lead follow-up reminders", description: "Reminders for scheduled follow-ups", enabled: true },
                    { label: "Commission updates", description: "Notifications when commissions are processed", enabled: true },
                    { label: "Appointment reminders", description: "Reminders for upcoming appointments", enabled: true },
                    { label: "Email notifications", description: "Receive notifications via email", enabled: false },
                    { label: "SMS notifications", description: "Receive notifications via SMS", enabled: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-text-primary">{item.label}</p>
                        <p className="text-sm text-text-muted">{item.description}</p>
                      </div>
                      <button
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          item.enabled ? "bg-emerald-500" : "bg-surface"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            item.enabled ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === "security" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Security Settings
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Key className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Password</p>
                        <p className="text-sm text-text-muted">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <Button variant="secondary">Change Password</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Two-Factor Authentication</p>
                        <p className="text-sm text-text-muted">Add an extra layer of security</p>
                      </div>
                    </div>
                    <Badge variant="warning">Not Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">Active Sessions</p>
                        <p className="text-sm text-text-muted">2 devices currently logged in</p>
                      </div>
                    </div>
                    <Button variant="secondary">Manage Sessions</Button>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === "integrations" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Connected Integrations
                </h2>
                <div className="space-y-4">
                  {[
                    { name: "Twilio", description: "AI call transcription and analysis", connected: true, icon: "📞" },
                    { name: "Google Calendar", description: "Sync appointments with Google Calendar", connected: true, icon: "📅" },
                    { name: "Stripe", description: "Payment processing for subscriptions", connected: true, icon: "💳" },
                    { name: "Slack", description: "Receive notifications in Slack", connected: false, icon: "💬" },
                  ].map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-surface">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-xl">
                          {integration.icon}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{integration.name}</p>
                          <p className="text-sm text-text-muted">{integration.description}</p>
                        </div>
                      </div>
                      {integration.connected ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-emerald-400">Connected</span>
                        </div>
                      ) : (
                        <Button variant="secondary" size="sm">Connect</Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === "appearance" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Appearance Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="font-medium text-text-primary mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-4">
                      {["Dark", "Light", "System"].map((theme) => (
                        <button
                          key={theme}
                          className={`p-4 rounded-lg border-2 transition-colors ${
                            theme === "Dark"
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-border hover:border-border-hover"
                          }`}
                        >
                          <p className="text-sm font-medium text-text-primary">{theme}</p>
                          <p className="text-xs text-text-muted mt-1">Default</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-3">Accent Color</p>
                    <div className="flex gap-3">
                      {["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"].map((color) => (
                        <button
                          key={color}
                          className={`w-10 h-10 rounded-full transition-transform hover:scale-110 ${
                            color === "#10B981" ? "ring-2 ring-offset-2 ring-offset-background ring-emerald-500" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {activeSection === "billing" && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-6">
                  Billing & Subscription
                </h2>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-surface">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-text-primary">Current Plan</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">Pro</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <p className="text-sm text-text-muted">
                      Your next billing date is August 15, 2024
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary mb-3">Billing History</p>
                    <div className="space-y-2">
                      {[
                        { date: "July 15, 2024", amount: "$49.00", status: "Paid" },
                        { date: "June 15, 2024", amount: "$49.00", status: "Paid" },
                        { date: "May 15, 2024", amount: "$49.00", status: "Paid" },
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-surface">
                          <span className="text-sm text-text-secondary">{invoice.date}</span>
                          <span className="font-medium text-text-primary">{invoice.amount}</span>
                          <Badge variant="success" size="sm">{invoice.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary">Download Invoices</Button>
                    <Button variant="secondary">Update Payment Method</Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
