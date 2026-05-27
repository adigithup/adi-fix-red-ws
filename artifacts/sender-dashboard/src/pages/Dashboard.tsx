import { useGetStats, useGetActivity, useGetChartData } from "@workspace/api-client-react";
import { Activity, CheckCircle, XCircle, Users, Mail, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: activity, isLoading: activityLoading } = useGetActivity();
  const { data: chartData, isLoading: chartLoading } = useGetChartData();

  const statCards = [
    { title: "Total Senders", value: stats?.totalSenders || 0, icon: Mail, color: "text-blue-500", border: "border-blue-500/30", glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]" },
    { title: "Active Senders", value: stats?.activeSenders || 0, icon: CheckCircle, color: "text-green-500", border: "border-green-500/30", glow: "shadow-[0_0_15px_rgba(34,197,94,0.15)]", pulse: true },
    { title: "Error Senders", value: stats?.errorSenders || 0, icon: AlertTriangle, color: "text-red-500", border: "border-red-500/30", glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]" },
    { title: "Success Ratio", value: `${(stats?.successRatio || 0).toFixed(1)}%`, icon: Activity, color: "text-primary", border: "border-primary/30", glow: "shadow-[0_0_15px_rgba(255,0,51,0.2)]" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight neon-text text-white">Dashboard Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-card overflow-hidden relative border ${stat.border} ${stat.glow}`}>
                {stat.pulse && (
                  <span className="absolute top-4 right-4 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${stat.color === 'text-primary' ? 'neon-text text-primary' : 'text-foreground'}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 glass-card neon-border">
          <CardHeader>
            <CardTitle className="text-lg">Last 7 Days Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF0033" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF0033" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#333333" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#333333" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.8)', borderColor: 'rgba(255, 0, 51, 0.3)', backdropFilter: 'blur(10px)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="success" stroke="#FF0033" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" />
                    <Area type="monotone" dataKey="failed" stroke="#555" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card neon-border flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Activity
              <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[300px] pr-2">
            {activityLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {activity?.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm border-b border-border/50 pb-3 last:border-0">
                    <div className={`mt-0.5 rounded-full p-1.5 ${
                      item.type === 'success' ? 'bg-primary/20 text-primary' :
                      item.type === 'failed' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {item.type === 'success' ? <CheckCircle className="h-3 w-3" /> :
                       item.type === 'failed' ? <XCircle className="h-3 w-3" /> :
                       <Activity className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-foreground">{item.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {!activity?.length && (
                  <div className="text-center text-muted-foreground py-8">No recent activity</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
