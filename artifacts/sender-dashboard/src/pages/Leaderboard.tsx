import { useGetLeaderboard } from "@workspace/api-client-react";
import { Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(255,0,51,0.8)]" />
        <h2 className="text-3xl font-bold tracking-tight neon-text text-white">Top Users</h2>
      </div>

      <Card className="glass-card neon-border border-t-4 border-t-primary">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground pb-4 border-b border-border">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-5">User</div>
              <div className="col-span-2 text-right">Processed</div>
              <div className="col-span-2 text-right text-green-500">Success</div>
              <div className="col-span-2 text-right text-primary">Rate</div>
            </div>

            <div className="space-y-2 mt-4">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="grid grid-cols-12 items-center py-2">
                    <Skeleton className="col-span-1 h-6 w-6 mx-auto rounded-full" />
                    <Skeleton className="col-span-5 h-5 w-[150px]" />
                    <Skeleton className="col-span-2 h-5 w-[60px] ml-auto" />
                    <Skeleton className="col-span-2 h-5 w-[60px] ml-auto" />
                    <Skeleton className="col-span-2 h-5 w-[40px] ml-auto" />
                  </div>
                ))
              ) : leaderboard?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No data available</div>
              ) : (
                leaderboard?.map((entry) => (
                  <div key={entry.userIdentifier} className={`grid grid-cols-12 items-center py-3 px-2 rounded-lg transition-colors hover:bg-white/5 ${entry.rank <= 3 ? 'bg-primary/5' : ''}`}>
                    <div className="col-span-1 flex justify-center">
                      {entry.rank === 1 ? <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" /> :
                       entry.rank === 2 ? <Medal className="w-5 h-5 text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.5)]" /> :
                       entry.rank === 3 ? <Award className="w-5 h-5 text-amber-700 drop-shadow-[0_0_5px_rgba(180,83,9,0.5)]" /> :
                       <span className="font-mono text-muted-foreground">{entry.rank}</span>}
                    </div>
                    <div className="col-span-5 font-medium text-foreground">
                      <span className={entry.rank <= 3 ? 'text-primary neon-text' : ''}>{entry.userIdentifier}</span>
                    </div>
                    <div className="col-span-2 text-right font-mono">{entry.totalProcessed.toLocaleString()}</div>
                    <div className="col-span-2 text-right font-mono text-green-400">{entry.successCount.toLocaleString()}</div>
                    <div className="col-span-2 text-right font-mono font-bold text-primary">{(entry.successRate).toFixed(1)}%</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
