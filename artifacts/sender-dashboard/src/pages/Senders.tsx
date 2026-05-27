import { useState } from "react";
import { useListSenders, useCreateSender, useUpdateSender, useDeleteSender, useToggleSender, useResetSender, getListSendersQueryKey } from "@workspace/api-client-react";
import { Plus, Search, Edit2, Trash2, RefreshCw, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

const senderSchema = z.object({
  email: z.string().email("Valid email required"),
  appPassword: z.string().min(1, "App password required"),
  dailyLimit: z.coerce.number().optional().nullable(),
  autoRotate: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});

type SenderFormValues = z.infer<typeof senderSchema>;

export default function Senders() {
  const queryClient = useQueryClient();
  const { data: senders, isLoading } = useListSenders();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSender, setEditingSender] = useState<number | null>(null);

  const createSender = useCreateSender();
  const updateSender = useUpdateSender();
  const deleteSender = useDeleteSender();
  const toggleSender = useToggleSender();
  const resetSender = useResetSender();

  const form = useForm<SenderFormValues>({
    resolver: zodResolver(senderSchema),
    defaultValues: { email: "", appPassword: "", dailyLimit: null, autoRotate: true, notes: "" },
  });

  const onSubmit = (data: SenderFormValues) => {
    if (editingSender) {
      updateSender.mutate(
        { id: editingSender, data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListSendersQueryKey() });
            toast.success("Sender updated");
            setIsAddOpen(false);
            setEditingSender(null);
            form.reset();
          },
          onError: () => toast.error("Failed to update sender")
        }
      );
    } else {
      createSender.mutate(
        { data },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListSendersQueryKey() });
            toast.success("Sender added");
            setIsAddOpen(false);
            form.reset();
          },
          onError: () => toast.error("Failed to add sender")
        }
      );
    }
  };

  const handleEdit = (sender: any) => {
    setEditingSender(sender.id);
    form.reset({
      email: sender.email,
      appPassword: sender.appPassword || "",
      dailyLimit: sender.dailyLimit,
      autoRotate: sender.autoRotate,
      notes: sender.notes,
    });
    setIsAddOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this sender?")) {
      deleteSender.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListSendersQueryKey() });
            toast.success("Sender deleted");
          }
        }
      );
    }
  };

  const handleToggle = (id: number, enabled: boolean) => {
    toggleSender.mutate(
      { id, data: { enabled } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSendersQueryKey() });
          toast.success(`Sender ${enabled ? 'enabled' : 'disabled'}`);
        }
      }
    );
  };

  const handleReset = (id: number) => {
    resetSender.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSendersQueryKey() });
          toast.success("Usage count reset");
        }
      }
    );
  };

  const filteredSenders = senders?.filter(s => s.email.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight neon-text text-white">Sender Management</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search senders..."
              className="pl-8 w-full sm:w-[250px] bg-background border-primary/20 focus-visible:ring-primary/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) { setEditingSender(null); form.reset(); }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 neon-border shadow-[0_0_10px_rgba(255,0,51,0.3)]">
                <Plus className="mr-2 h-4 w-4" /> Add Sender
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-primary/30">
              <DialogHeader>
                <DialogTitle className="neon-text text-primary">{editingSender ? "Edit Sender" : "Add New Sender"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input {...field} className="bg-background/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="appPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>App Password</FormLabel>
                      <FormControl><Input type="password" {...field} className="bg-background/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dailyLimit" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Limit (Optional)</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value || ""} className="bg-background/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} className="bg-background/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="autoRotate" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-primary/20 p-3 bg-background/30">
                      <div className="space-y-0.5">
                        <FormLabel>Auto Rotate</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Save</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass-card neon-border">
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-card/50">
                <TableRow className="border-border">
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[100px] ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-[150px] ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredSenders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No senders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSenders.map((sender) => (
                    <TableRow key={sender.id} className="border-border/50 hover:bg-primary/5 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{sender.email}</span>
                          {sender.notes && <span className="text-xs text-muted-foreground">{sender.notes}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            {sender.status === 'active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                              sender.status === 'active' ? 'bg-green-500' : 
                              sender.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></span>
                          </span>
                          <span className="capitalize text-sm">{sender.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono">{sender.totalUsed} {sender.dailyLimit ? `/ ${sender.dailyLimit}` : ''}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {sender.lastActive ? new Date(sender.lastActive).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggle(sender.id, sender.status !== 'active')}
                            className={sender.status === 'active' ? 'text-green-500 hover:text-green-400 hover:bg-green-500/10' : 'text-muted-foreground hover:text-white'}
                            title={sender.status === 'active' ? 'Disable' : 'Enable'}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleReset(sender.id)} title="Reset Usage" className="hover:text-blue-400">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(sender)} className="hover:text-primary">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(sender.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
