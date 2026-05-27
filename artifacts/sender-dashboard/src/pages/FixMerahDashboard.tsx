import { useGetFixMerahStats, useListFixMerahHistory, useListSenders } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send, CheckCircle, XCircle, Zap, Users,
  TrendingUp, Clock, AlertTriangle
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-green-500",
    failed: "bg-red-500",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${map[status] ?? "bg-gray-500"}`} />
  );
}

export default function FixMerahDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetFixMerahStats();
  const { data: history, isLoading: histLoading } = useListFixMerahHistory({ limit: 15 });
  const { data: senders, isLoading: sendersLoading } = useListSenders();

  const activeSenders = senders?.filter((s) => s.status === "active") ?? [];
  const errorSenders = senders?.filter((s) => s.status === "error") ?? [];

  const statCards = [
    {
      title: "Total Kirim Hari Ini",
      value: stats?.totalSentToday ?? 0,
      icon: Send,
      color: "text-primary",
      border: "border-primary/30",
      glow: "shadow-[0_0_15px_rgba(255,0,51,0.15)]",
      pulse: true,
    },
    {
      title: "Sukses Hari Ini",
      value: stats?.successToday ?? 0,
      icon: CheckCircle,
      color: "text-green-400",
      border: "border-green-500/30",
      glow: "shadow-[0_0_15px_rgba(34,197,94,0.1)]",
    },
    {
      title: "Gagal Hari Ini",
      value: stats?.failedToday ?? 0,
      icon: XCircle,
      color: "text-red-400",
      border: "border-red-500/30",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]",
    },
    {
      title: "Success Rate",
      value: `${stats?.successRate ?? 0}%`,
      icon: TrendingUp,
      color: "text-yellow-400",
      border: "border-yellow-500/30",
      glow: "shadow-[0_0_15px_rgba(234,179,8,0.1)]",
    },
    {
      title: "Total Semua Waktu",
      value: stats?.totalSentAllTime ?? 0,
      icon: Zap,
      color: "text-blue-400",
      border: "border-blue-500/30",
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    },
    {
      title: "Sender Tersedia",
      value: stats?.availableSenders ?? 0,
      icon: Users,
      color: "text-purple-400",
      border: "border-purple-500/30",
      glow: "shadow-[0_0_15px_rgba(168,85,247,0.1)]",
    },
  ];

  // Build mini chart from history
  const chartData = (() => {
    if (!history?.items) return [];
    const map: Record<string, { date: string; success: number; failed: number }> = {};
    history.items.forEach((h) => {
      const d = h.createdAt.slice(0, 10);
      if (!map[d]) map[d] = { date: d, success: 0, failed: 0 };
      if (h.status === "success") map[d].success++;
      else map[d].failed++;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  })();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="neon-text text-primary">Dashboard Fix Merah</span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Statistik khusus pengiriman laporan ke WhatsApp Support
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/30 px-3 py-1 text-sm font-bold neon-border">
          <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse inline-block" />
          LIVE
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statsLoading
          ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          : statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className={`glass-card border ${card.border} ${card.glow} overflow-hidden`}>
                  {card.pulse && (
                    <span className="absolute top-3 right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                  )}
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
                    <card.icon className={`w-4 h-4 ${card.color} mt-1 opacity-60`} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 glass-card neon-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Aktivitas Fix Merah (Terbaru)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {histLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data. Kirim Fix Merah pertamamu!
              </div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fmSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF0033" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FF0033" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fmFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10,10,10,0.9)",
                        borderColor: "rgba(255,0,51,0.3)",
                        backdropFilter: "blur(10px)",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area type="monotone" dataKey="success" name="Sukses" stroke="#FF0033" strokeWidth={2} fill="url(#fmSuccess)" />
                    <Area type="monotone" dataKey="failed" name="Gagal" stroke="#555" strokeWidth={2} fill="url(#fmFailed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sender Health */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Status Sender
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sendersLoading ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
            ) : (senders ?? []).length === 0 ? (
              <div className="text-center py-4">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Belum ada sender. Tambahkan di menu Senders.</p>
              </div>
            ) : (
              (senders ?? []).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      s.status === "active" ? "bg-green-500 animate-pulse" :
                      s.status === "error" ? "bg-red-500" : "bg-gray-500"
                    }`} />
                    <span className="text-xs font-mono text-foreground truncate max-w-[130px]">{s.email}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-medium ${
                      s.status === "active" ? "text-green-400" :
                      s.status === "error" ? "text-red-400" : "text-muted-foreground"
                    }`}>{s.status}</span>
                    <div className="text-xs text-muted-foreground">
                      {s.dailyLimit ? `${s.totalUsed}/${s.dailyLimit}` : `${s.totalUsed}`}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30">
              <span className="flex items-center gap-1 text-green-400"><span className="w-2 h-2 bg-green-500 rounded-full" />{activeSenders.length} aktif</span>
              <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 bg-red-500 rounded-full" />{errorSenders.length} error</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Fix Merah History */}
      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Riwayat Fix Merah Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {histLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !history?.items?.length ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Belum ada riwayat Fix Merah. Mulai kirim dari halaman{" "}
              <a href="/fix-merah" className="text-primary hover:underline">Fix Merah</a>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Pengguna</th>
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Nomor Target</th>
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Sender</th>
                    <th className="text-left py-2 px-3 text-xs text-muted-foreground font-medium">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((h) => (
                    <tr key={h.id} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${
                          h.status === "success" ? "text-green-400" : "text-red-400"
                        }`}>
                          <StatusDot status={h.status} />
                          {h.status === "success" ? "Sukses" : "Gagal"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-foreground font-mono">{h.userIdentifier}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs font-mono text-primary">{h.targetNumber ?? "-"}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-muted-foreground font-mono truncate block max-w-[150px]">
                          {h.senderEmail}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs text-muted-foreground">
                          {new Date(h.createdAt).toLocaleString("id-ID", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
