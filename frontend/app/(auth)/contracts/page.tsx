"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isPast, differenceInDays } from "date-fns";
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Calendar,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractUpload } from "@/components/contract-upload";
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
import { supabase } from "@/lib/supabase";
import type { Contract, Deal } from "@shared/schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Contracts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showUpload, setShowUpload] = useState(false);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: [`${API_URL}/api/v1/contracts`],
  });

  const { data: deals = [], isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: [`${API_URL}/api/v1/deals`],
  });

  const isLoading = contractsLoading || dealsLoading;

  const uploadContractMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("dealId", data.dealId.toString());
      if (data.usageEndDate) {
        formData.append("usageEndDate", data.usageEndDate.toISOString());
      }
      if (data.exclusivityEndDate) {
        formData.append("exclusivityEndDate", data.exclusivityEndDate.toISOString());
      }

      const response = await fetch(`${API_URL}/api/v1/contracts`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/v1/contracts`] });
      setShowUpload(false);
      toast({ title: "Contract uploaded successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to upload contract", variant: "destructive" });
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/v1/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${API_URL}/api/v1/contracts`] });
      setDeletingContract(null);
      toast({ title: "Contract deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete contract", variant: "destructive" });
    },
  });

  const getDealName = (dealId: number) => {
    const deal = deals.find((d) => d.id === dealId);
    return deal?.brandName || "Unknown Deal";
  };

  const getDateStatus = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    if (isPast(d)) {
      return { status: "expired", label: "Expired", variant: "destructive" as const };
    }
    const daysLeft = differenceInDays(d, new Date());
    if (daysLeft <= 30) {
      return { status: "expiring", label: `${daysLeft}d left`, variant: "secondary" as const };
    }
    return { status: "active", label: format(d, "MMM d, yyyy"), variant: "outline" as const };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Contract Vault</h1>
          <p className="text-sm text-muted-foreground">
            Store and manage all your brand contracts.
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
          <h1 className="text-2xl font-semibold">Contract Vault</h1>
          <p className="text-sm text-muted-foreground">
            Store and manage all your brand contracts.
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)} data-testid="button-upload-contract">
          <Upload className="w-4 h-4 mr-2" />
          Upload Contract
        </Button>
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No contracts yet"
          description="Upload your first contract to keep track of usage rights and exclusivity dates."
          actionLabel="Upload Contract"
          onAction={() => setShowUpload(true)}
          testId="empty-contracts"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts.map((contract) => {
            const usageStatus = getDateStatus(contract.usageEndDate);
            const exclusivityStatus = getDateStatus(contract.exclusivityEndDate);
            const hasWarning =
              usageStatus?.status === "expired" ||
              usageStatus?.status === "expiring" ||
              exclusivityStatus?.status === "expired" ||
              exclusivityStatus?.status === "expiring";

            return (
              <Card
                key={contract.id}
                className={hasWarning ? "border-yellow-500/50" : ""}
                data-testid={`card-contract-${contract.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium truncate">
                            {getDealName(contract.dealId)}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {contract.fileName || "Contract.pdf"}
                          </p>
                        </div>
                        {hasWarning && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        {contract.usageEndDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Usage:</span>
                            <Badge variant={usageStatus?.variant} className="text-xs">
                              {usageStatus?.label}
                            </Badge>
                          </div>
                        )}
                        {contract.exclusivityEndDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Exclusivity:</span>
                            <Badge variant={exclusivityStatus?.variant} className="text-xs">
                              {exclusivityStatus?.label}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          data-testid={`button-download-${contract.id}`}
                        >
                          <a href={contract.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingContract(contract)}
                          data-testid={`button-delete-${contract.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ContractUpload
        open={showUpload}
        onOpenChange={setShowUpload}
        onSubmit={(data) => uploadContractMutation.mutate(data)}
        deals={deals}
        isSubmitting={uploadContractMutation.isPending}
      />

      <AlertDialog open={!!deletingContract} onOpenChange={() => setDeletingContract(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingContract && deleteContractMutation.mutate(deletingContract.id)
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

