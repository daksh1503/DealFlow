"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { reminderTypes, type Reminder, type Deal, type ReminderType } from "@shared/schema";

const reminderFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  type: z.enum(reminderTypes),
  dealId: z.number().optional().nullable(),
  remindAt: z.date({ required_error: "Please select a date and time" }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Enter a valid time"),
});

type ReminderFormData = z.infer<typeof reminderFormSchema>;

interface ReminderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<ReminderFormData, "time"> & { remindAt: Date }) => void;
  reminder?: Reminder | null;
  deals: Deal[];
  isSubmitting?: boolean;
}

const typeLabels: Record<ReminderType, string> = {
  follow_up: "Follow-up",
  content_delivery: "Content Delivery",
  payment: "Payment",
};

const typeDescriptions: Record<ReminderType, string> = {
  follow_up: "Remind to follow up with the brand",
  content_delivery: "Content delivery deadline",
  payment: "Payment due reminder",
};

export function ReminderForm({
  open,
  onOpenChange,
  onSubmit,
  reminder,
  deals,
  isSubmitting,
}: ReminderFormProps) {
  const isEditing = !!reminder;

  const getDefaultTime = () => {
    if (reminder?.remindAt) {
      const date = new Date(reminder.remindAt);
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
    return "09:00";
  };

  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: reminder?.title || "",
      type: (reminder?.type as ReminderType) || "follow_up",
      dealId: reminder?.dealId || null,
      remindAt: reminder?.remindAt ? new Date(reminder.remindAt) : undefined,
      time: getDefaultTime(),
    },
  });

  const handleSubmit = (data: ReminderFormData) => {
    const [hours, minutes] = data.time.split(":").map(Number);
    const remindAt = new Date(data.remindAt);
    remindAt.setHours(hours, minutes, 0, 0);
    
    onSubmit({
      title: data.title,
      type: data.type,
      dealId: data.dealId,
      remindAt,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Reminder" : "Create Reminder"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the reminder details."
              : "Set a reminder for an upcoming task or deadline."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Follow up on Nike deal"
                      {...field}
                      data-testid="input-reminder-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-reminder-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reminderTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {typeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dealId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Deal (Optional)</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val ? parseInt(val) : null)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-reminder-deal">
                          <SelectValue placeholder="Select a deal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No deal</SelectItem>
                        {deals.map((deal) => (
                          <SelectItem key={deal.id} value={deal.id.toString()}>
                            {deal.brandName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="remindAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-reminder-date"
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          className="pl-9"
                          {...field}
                          data-testid="input-reminder-time"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit-reminder">
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
