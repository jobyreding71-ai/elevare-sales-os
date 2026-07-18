"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout";
import { Card, Button, Badge, Avatar, Modal, Input, Skeleton } from "@/components/ui";
import { useAppointments } from "@/lib/hooks";
import { useAuth } from "@/lib/hooks";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  MapPin,
  Users,
  Filter,
} from "lucide-react";

// Helper to format time only
function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { appointments, isLoading } = useAppointments({ userId: user?.id });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Group appointments by status
  const upcomingAppointments = appointments?.filter(
    (apt: any) => apt.status === "scheduled" && new Date(apt.start_time) >= new Date()
  ) || [];

  const pastAppointments = appointments?.filter(
    (apt: any) => apt.status === "completed" || new Date(apt.start_time) < new Date()
  ) || [];

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "in_person":
        return <MapPin className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="info" size="sm">Scheduled</Badge>;
      case "completed":
        return <Badge variant="success" size="sm">Completed</Badge>;
      case "cancelled":
        return <Badge variant="error" size="sm">Cancelled</Badge>;
      case "no_show":
        return <Badge variant="warning" size="sm">No Show</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const getAppointmentsForDay = (day: number) => {
    return appointments?.filter((apt: any) => {
      const aptDate = new Date(apt.start_time);
      return (
        aptDate.getDate() === day &&
        aptDate.getMonth() === selectedDate.getMonth() &&
        aptDate.getFullYear() === selectedDate.getFullYear()
      );
    }) || [];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Appointments</h1>
            <p className="text-text-secondary mt-1">
              Manage your meetings and follow-ups
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Upcoming</p>
                <p className="text-2xl font-bold text-text-primary">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : upcomingAppointments.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Completed</p>
                <p className="text-2xl font-bold text-text-primary">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : pastAppointments.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">This Week</p>
                <p className="text-2xl font-bold text-text-primary">
                  {isLoading ? <Skeleton className="h-8 w-12" /> :
                    appointments?.filter((apt: any) => {
                      const aptDate = new Date(apt.start_time);
                      const now = new Date();
                      const weekEnd = new Date(now);
                      weekEnd.setDate(weekEnd.getDate() + 7);
                      return aptDate >= now && aptDate <= weekEnd && apt.status === "scheduled";
                    }).length || 0
                  }
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">This Month</p>
                <p className="text-2xl font-bold text-text-primary">
                  {isLoading ? <Skeleton className="h-8 w-12" /> :
                    appointments?.filter((apt: any) => {
                      const aptDate = new Date(apt.start_time);
                      const now = new Date();
                      return aptDate.getMonth() === now.getMonth() &&
                             aptDate.getFullYear() === now.getFullYear();
                    }).length || 0
                  }
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-text-secondary hover:bg-surface"
              }`}
            >
              Calendar View
            </button>
          </div>
          <Button variant="secondary" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {viewMode === "list" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Appointments */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Upcoming Appointments
              </h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-lg bg-surface">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 5).map((apt: any) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-lg bg-surface hover:bg-card-hover transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={apt.lead_name || "Lead"}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-text-primary">
                              {apt.lead_name || "Lead Appointment"}
                            </p>
                            <p className="text-sm text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(apt.start_time)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          {getAppointmentTypeIcon(apt.type)}
                          {apt.type?.replace("_", " ") || "Meeting"}
                        </span>
                        {apt.duration && <span>{apt.duration} min</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-text-secondary">No upcoming appointments</p>
                  <p className="text-sm text-text-muted mt-1">
                    Schedule your first appointment
                  </p>
                </div>
              )}
            </Card>

            {/* Past Appointments */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Past Appointments
              </h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-lg bg-surface">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              ) : pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments.slice(0, 5).map((apt: any) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-lg bg-surface/50 opacity-75"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={apt.lead_name || "Lead"}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-text-primary">
                              {apt.lead_name || "Lead Appointment"}
                            </p>
                            <p className="text-sm text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(apt.start_time)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Clock className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-text-secondary">No past appointments</p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Calendar View */
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth("prev")}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-text-secondary" />
                </button>
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth("next")}
                  className="p-2 hover:bg-surface rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="bg-surface p-3 text-center text-sm font-medium text-text-secondary"
                >
                  {day}
                </div>
              ))}
              {getDaysInMonth().map((day, index) => {
                const dayAppointments = day ? getAppointmentsForDay(day) : [];
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 bg-card ${
                      day === null ? "bg-surface/30" : ""
                    }`}
                  >
                    {day !== null && (
                      <>
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                            isToday(day)
                              ? "bg-emerald-500 text-white"
                              : "text-text-primary"
                          }`}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayAppointments.slice(0, 2).map((apt: any) => (
                            <div
                              key={apt.id}
                              className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded truncate"
                            >
                              {formatTime(apt.start_time)}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <p className="text-xs text-text-muted">
                              +{dayAppointments.length - 2} more
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule New Appointment"
        size="lg"
      >
        <form className="space-y-4">
          <Input
            label="Title"
            placeholder="Appointment with..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
            />
            <Input
              label="Time"
              type="time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Appointment Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "video", label: "Video Call", icon: Video },
                { id: "phone", label: "Phone Call", icon: Phone },
                { id: "in_person", label: "In Person", icon: MapPin },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className="p-3 rounded-lg border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-colors flex flex-col items-center gap-2"
                >
                  <type.icon className="w-5 h-5 text-text-secondary" />
                  <span className="text-sm text-text-secondary">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Duration"
            type="select"
            placeholder="Select duration"
          />
          <Input
            label="Notes"
            placeholder="Add any notes for this appointment..."
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
