import { useState } from "react";
import { useListHistory, useDeleteHistory, getListHistoryQueryKey } from "@workspace/api-client-react";
import { Search, Trash2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "success" | "failed">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: historyData, isLoading } = useListHistory({
    search: search || undefined,
    status: status,
    limit,
    offset: (page - 1) * limit
  });

  const deleteHistory = useDeleteHistory();

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this log entry?")) {
      deleteHistory.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListHistoryQueryKey() });
            toast.success("Log entry deleted");
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight neon-text text-white">System Logs</h2>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search user or email..."
              className="pl-8 w-full sm:w-[250px] bg-background border-primary/20"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={status} onValueChange={(val: any) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-[130px] bg-background border-primary/20">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="glass-card neon-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-card/50">
              <TableRow className="border-border">
                <TableHead>Time</TableHead>
                <TableHead>User Identifier</TableHead>
                <TableHead>Sender Email</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-[140px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[40px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : historyData?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No log entries found.
                  </TableCell>
                </TableRow>
              ) : (
                historyData?.items.map((entry) => (
                  <TableRow key={entry.id} className="border-border/50 hover:bg-white/5 transition-colors">
                    <TableCell className="text-muted-foreground text-sm font-mono whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-primary/90">{entry.userIdentifier}</TableCell>
                    <TableCell>{entry.senderEmail}</TableCell>
                    <TableCell className="font-mono text-sm">{entry.targetNumber || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        entry.status === 'success' 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {entry.status}
                      </span>
                      {entry.errorMessage && (
                        <p className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={entry.errorMessage}>
                          {entry.errorMessage}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total records: {historyData?.total || 0}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="border-primary/20 hover:bg-primary/10"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!historyData || historyData.items.length < limit}
                onClick={() => setPage(p => p + 1)}
                className="border-primary/20 hover:bg-primary/10"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
