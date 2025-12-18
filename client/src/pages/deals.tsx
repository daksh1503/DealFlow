import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Kanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "@/components/kanban-column";
import { DealForm } from "@/components/deal-form";
import { LoadingKanban } from "@/components/loading-state";
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
import { apiRequest, queryClient as qc } from "@/lib/queryClient";
import type { Deal, DealStatus } from "@shared/schema";

const columns: { status: DealStatus; title: string }[] = [
  { status: "lead", title: "Lead" },
  { status: "negotiation", title: "Negotiation" },
  { status: "signed", title: "Signed" },
  { status: "content_delivered", title: "Content Delivered" },
  { status: "paid", title: "Paid" },
];

export default function Deals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showDealForm, setShowDealForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<DealStatus>("lead");
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragTarget, setDragTarget] = useState<DealStatus | null>(null);

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/deals", {
        ...data,
        deadline: data.deadline?.toISOString() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setShowDealForm(false);
      toast({ title: "Deal created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create deal", variant: "destructive" });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const payload: any = { ...data };
      if (data.deadline !== undefined) {
        payload.deadline = data.deadline?.toISOString() || null;
      }
      return apiRequest("PATCH", `/api/deals/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setEditingDeal(null);
      toast({ title: "Deal updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update deal", variant: "destructive" });
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/deals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setDeletingDeal(null);
      toast({ title: "Deal deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete deal", variant: "destructive" });
    },
  });

  const handleAddDeal = (status: DealStatus) => {
    setDefaultStatus(status);
    setEditingDeal(null);
    setShowDealForm(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setShowDealForm(true);
  };

  const handleDeleteDeal = (deal: Deal) => {
    setDeletingDeal(deal);
  };

  const handleDragStart = useCallback((e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, status: DealStatus) => {
      e.preventDefault();
      setDragTarget(null);

      if (draggedDeal && draggedDeal.status !== status) {
        updateDealMutation.mutate({
          id: draggedDeal.id,
          data: { status },
        });
      }
      setDraggedDeal(null);
    },
    [draggedDeal, updateDealMutation]
  );

  const handleSubmit = (data: any) => {
    if (editingDeal) {
      updateDealMutation.mutate({ id: editingDeal.id, data });
    } else {
      createDealMutation.mutate(data);
    }
  };

  const getDealsByStatus = (status: DealStatus) => {
    return deals.filter((deal) => deal.status === status);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Manage your brand deals across different stages.
          </p>
        </div>
        <LoadingKanban />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Deal Pipeline</h1>
            <p className="text-sm text-muted-foreground">
              Manage your brand deals across different stages.
            </p>
          </div>
          <Button onClick={() => handleAddDeal("lead")} data-testid="button-add-deal">
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-6 pb-6">
        {deals.length === 0 ? (
          <EmptyState
            icon={Kanban}
            title="No deals yet"
            description="Start by adding your first brand deal. Track it through your pipeline from lead to payment."
            actionLabel="Add Your First Deal"
            onAction={() => handleAddDeal("lead")}
            testId="empty-deals"
          />
        ) : (
          <div className="flex gap-4 min-h-[500px]">
            {columns.map((column) => (
              <KanbanColumn
                key={column.status}
                status={column.status}
                title={column.title}
                deals={getDealsByStatus(column.status)}
                onAddDeal={handleAddDeal}
                onEditDeal={handleEditDeal}
                onDeleteDeal={handleDeleteDeal}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isDragTarget={dragTarget === column.status}
              />
            ))}
          </div>
        )}
      </div>

      <DealForm
        open={showDealForm}
        onOpenChange={setShowDealForm}
        onSubmit={handleSubmit}
        deal={editingDeal}
        defaultStatus={defaultStatus}
        isSubmitting={createDealMutation.isPending || updateDealMutation.isPending}
      />

      <AlertDialog open={!!deletingDeal} onOpenChange={() => setDeletingDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the deal with{" "}
              <strong>{deletingDeal?.brandName}</strong>? This will also delete
              all associated payments and contracts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDeal && deleteDealMutation.mutate(deletingDeal.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
