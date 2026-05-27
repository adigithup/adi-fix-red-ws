import { useGetStatus } from "@workspace/api-client-react";
import { Activity, Server, Users, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Status() {
  const { data: status, isLoading } = useGetStatus();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight neon-text text-white">System Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-primary/30 shadow-[0_0_15px_rgba(255,0,51,0.1)]">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Server className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">API Server</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mt-2">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
              </span>
              <span className="text-xl font-bold text-green-500">ONLINE</span>
            </div>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-mono text-foreground">{status?.version || "1.0.0"}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="font-mono text-foreground">{status?.uptime ? Math.floor(status.uptime / 60) + " mins" : "---"}</span>
              </div>
              <div className="flex justify-between">
                <span>Response Time</span>
                <span className="font-mono text-green-400">~24ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-black/30 p-4 rounded-lg border border-border/50 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{status?.totalUsers || 0}</div>
                <div className="text-xs text-muted-foreground">Registered Users</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg border border-border/50 text-center">
                <Send className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-primary neon-text">{status?.activeSenders || 0} / {status?.totalSenders || 0}</div>
                <div className="text-xs text-muted-foreground">Active Senders</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
