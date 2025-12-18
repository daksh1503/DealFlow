"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isThisWeek, isBefore, startOfDay } from "date-fns";
import {
  Bell,
  Plus,
  Check,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
  DollarSign,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReminderForm } from "@/components/reminder-form";
import { LoadingTable } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Reminder, Deal, ReminderType } from "@shared/schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const typeIcons: Record<ReminderType, typeof Bell> = {
  follow_up: MessageSquare,
  content_delivery: FileText,
  payment: DollarSign,
};

const typeLabels: Record<ReminderType, string> = {
  follow_up: "Follow-up",
  content_delivery: "Content Delivery",
  payment: "Payment",
};

export default function Reminders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);

  const { data: reminders = [], isLoading: remindersLoading } = useQuery<Reminder[]>({
    queryKey: [`${API_URL}/api/v1/reminders`],
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: [`${API_URL}/api/v1/deals`],
  });

  const isLoading = remindersLoading || dealsLoading;

  const createReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/v1/reminders", {
        ...data,
        remindAt: data.remindAt.toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/v1/reminders`] });
      setShowForm(false);
      toast({ title: "Reminder created!" });
    },
    onError: () => {
      toast({ title: "Failed to create reminder", variant: "destructive" });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PATCH", `/api/v1/reminders/${id}`, {
        ...data,
        remindAt: data.remindAt?.toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/v1/reminders`] });
      setEditingReminder(null);
      toast({ title: "Reminder updated!" });
    },
    onError: () => {
      toast({ title: "Failed to update reminder", variant: "destructive" });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/v1/reminders/${id}`, { sent: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/v1/reminders`] });
      toast({ title: "Reminder marked as complete" });
    },
    onError: () => {
      toast({ title: "Failed to update reminder", variant: "destructive" });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/v1/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/v1/reminders`] });
      setDeletingReminder(null);
      toast({ title: "Reminder deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete reminder", variant: "destructive" });
    },
  });

  const getDealName = (dealId: number | null) => {
    if (!dealId) return null;
    const deal = deals.find((d) => d.id === dealId);
    return deal?.brandName;
  };

  const handleSubmit = (data: any) => {
    if (editingReminder) {
      updateReminderMutation.mutate({ id: editingReminder.id, data });
    } else {
      createReminderMutation.mutate(data);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const activeReminders = reminders.filter((r) => !r.sent);
  const completedReminders = reminders.filter((r) => r.sent);

  const now = new Date();
  const todayReminders = activeReminders.filter((r) => isToday(new Date(r.remindAt)));
  const thisWeekReminders = activeReminders.filter(
    (r) => !isToday(new Date(r.remindAt)) && isThisWeek(new Date(r.remindAt))
  );
  const laterReminders = activeReminders.filter(
    (r) => !isToday(new Date(r.remindAt)) && !isThisWeek(new Date(r.remindAt))
  );
  const overdueReminders = activeReminders.filter((r) =>
    isBefore(new Date(r.remindAt), startOfDay(now))
  );

  const ReminderItem = ({ reminder }: { reminder: Reminder }) => {
    const TypeIcon = typeIcons[reminder.type as ReminderType] || Bell;
    const dealName = getDealName(reminder.dealId);
    const isOverdue = isBefore(new Date(reminder.remindAt), now) && !reminder.sent;

    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-md bg-muted/30 group ${
          isOverdue ? "border border-destructive/50" : ""
        }`}
        data-testid={`reminder-${reminder.id}`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isOverdue ? "bg-destructive/10" : "bg-primary/10"
          }`}
        >
          <TypeIcon className={`w-5 h-5 ${isOverdue ? "text-destructive" : "text-primary"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{reminder.title}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{format(new Date(reminder.remindAt), "MMM d 'at' h:mm a")}</span>
            {dealName && (
              <>
                <span>-</span>
                <span>{dealName}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize text-xs">
            {typeLabels[reminder.type as ReminderType]}
          </Badge>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {!reminder.sent && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => markCompleteMutation.mutate(reminder.id)}
                data-testid={`button-complete-${reminder.id}`}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingReminder(reminder)}
              data-testid={`button-delete-${reminder.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Reminders</h1>
          <p className="text-sm text-muted-foreground">
            Stay on top of follow-ups, deadlines, and payments.
          </p>
        </div>
        <LoadingTable rows={5} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reminders</h1>
          <p className="text-sm text-muted-foreground">
            Stay on top of follow-ups, deadlines, and payments.
          </p>
        </div>
        <Button onClick={() => { setEditingReminder(null); setShowForm(true); }} data-testid="button-add-reminder">
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {activeReminders.length === 0 && completedReminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders yet"
          description="Set reminders to never miss a follow-up, deadline, or payment."
          actionLabel="Create Reminder"
          onAction={() => setShowForm(true)}
          testId="empty-reminders"
        />
      ) : (
        <div className="space-y-6">
          {overdueReminders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
                  <Calendar className="w-4 h-4" />
                  Overdue
                  <Badge variant="destructive" className="ml-2">
                    {overdueReminders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueReminders.map((reminder) => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </CardContent>
            </Card>
          )}

          {todayReminders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Today
                  <Badge variant="secondary" className="ml-2">
                    {todayReminders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayReminders.map((reminder) => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </CardContent>
            </Card>
          )}

          {thisWeekReminders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  This Week
                  <Badge variant="secondary" className="ml-2">
                    {thisWeekReminders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {thisWeekReminders.map((reminder) => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </CardContent>
            </Card>
          )}

          {laterReminders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Later
                  <Badge variant="secondary" className="ml-2">
                    {laterReminders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {laterReminders.map((reminder) => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))}
              </CardContent>
            </Card>
          )}

          {completedReminders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4" />
                  Completed
                  <Badge variant="outline" className="ml-2">
                    {completedReminders.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedReminders.slice(0, 5).map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-4 p-4 rounded-md bg-muted/20 opacity-60"
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Check className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate line-through">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(reminder.remindAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingReminder(reminder)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ReminderForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingReminder(null);
        }}
        onSubmit={handleSubmit}
        reminder={editingReminder}
        deals={deals}
        isSubmitting={createReminderMutation.isPending || updateReminderMutation.isPending}
      />

      <AlertDialog open={!!deletingReminder} onOpenChange={() => setDeletingReminder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reminder? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingReminder && deleteReminderMutation.mutate(deletingReminder.id)
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

