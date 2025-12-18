"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DealCard } from "./deal-card";
import type { Deal, DealStatus } from "@shared/schema";

interface KanbanColumnProps {
  status: DealStatus;
  title: string;
  deals: Deal[];
  onAddDeal: (status: DealStatus) => void;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (deal: Deal) => void;
  onDragStart: (e: React.DragEvent, deal: Deal) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: DealStatus) => void;
  isDragTarget?: boolean;
}

const statusColors: Record<DealStatus, string> = {
  lead: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  negotiation: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  signed: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  content_delivered: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  paid: "bg-green-500/10 text-green-600 dark:text-green-400",
};

export function KanbanColumn({
  status,
  title,
  deals,
  onAddDeal,
  onEditDeal,
  onDeleteDeal,
  onDragStart,
  onDragOver,
  onDrop,
  isDragTarget,
}: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, deal) => {
    const value = typeof deal.dealValue === "string" ? parseFloat(deal.dealValue) : deal.dealValue;
    return sum + value;
  }, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      className={`flex-shrink-0 w-72 lg:w-80 flex flex-col h-full transition-colors duration-200 ${
        isDragTarget ? "bg-accent/50 rounded-lg" : ""
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
      data-testid={`column-${status}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {deals.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onAddDeal(status)}
          data-testid={`button-add-${status}`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mb-3 px-1 font-mono">
        {formatCurrency(totalValue)}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto min-h-[200px] pb-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            draggable
            onDragStart={(e) => onDragStart(e, deal)}
            className="cursor-grab active:cursor-grabbing"
          >
            <DealCard
              deal={deal}
              onEdit={onEditDeal}
              onDelete={onDeleteDeal}
            />
          </div>
        ))}
        {deals.length === 0 && (
          <div className="h-32 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Drop deals here</p>
          </div>
        )}
      </div>
    </div>
  );
}
