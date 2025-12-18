"use client";

import { format } from "date-fns";
import { Calendar, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { SiInstagram, SiYoutube, SiTiktok, SiLinkedin } from "react-icons/si";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Deal } from "@shared/schema";

interface DealCardProps {
  deal: Deal;
  onEdit?: (deal: Deal) => void;
  onDelete?: (deal: Deal) => void;
  isDragging?: boolean;
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  youtube: SiYoutube,
  tiktok: SiTiktok,
  linkedin: SiLinkedin,
  twitter: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

const platformColors: Record<string, string> = {
  instagram: "text-pink-500",
  youtube: "text-red-500",
  tiktok: "text-foreground",
  twitter: "text-foreground",
  linkedin: "text-blue-600",
  other: "text-muted-foreground",
};

export function DealCard({ deal, onEdit, onDelete, isDragging }: DealCardProps) {
  const PlatformIcon = platformIcons[deal.platform] || null;
  const platformColor = platformColors[deal.platform] || platformColors.other;

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isOverdue = deal.deadline && new Date(deal.deadline) < new Date() && deal.status !== "paid";

  return (
    <Card
      className={`group transition-all duration-200 ${isDragging ? "opacity-50 rotate-2 shadow-lg" : "hover-elevate"}`}
      data-testid={`card-deal-${deal.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" data-testid={`text-brand-${deal.id}`}>
                  {deal.brandName}
                </h4>
                <p className="text-lg font-bold font-mono mt-1" data-testid={`text-value-${deal.id}`}>
                  {formatCurrency(deal.dealValue)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-deal-menu-${deal.id}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(deal)} data-testid={`menu-edit-${deal.id}`}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(deal)}
                    className="text-destructive focus:text-destructive"
                    data-testid={`menu-delete-${deal.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {PlatformIcon && (
                <Badge variant="secondary" className="gap-1.5">
                  <PlatformIcon className={`w-3 h-3 ${platformColor}`} />
                  <span className="capitalize">{deal.platform}</span>
                </Badge>
              )}
              {deal.deadline && (
                <Badge
                  variant={isOverdue ? "destructive" : "outline"}
                  className="gap-1"
                >
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(deal.deadline), "MMM d")}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
