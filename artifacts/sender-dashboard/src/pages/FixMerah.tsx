import { useState } from "react";
import { useSendFixMerah, useListSenders } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { getGetFixMerahStatsQueryKey, getListFixMerahHistoryQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Phone, User, CheckCircle, XCircle, Zap, AlertTriangle, Info } from "lucide-react";

const IDENTIFIER_KEY = "fix_merah_user_identifier";

function getStoredIdentifier() {
  return localStorage.getItem(IDENTIFIER_KEY) || "";
}

export default function FixMerah() {
  const queryClient = useQueryClient();
  const [targetNumber, setTargetNumber] = useState("");
  const [userIdentifier, setUserIdentifier] = useState(getStoredIdentifier);
  const [customMessage, setCustomMessage] = useState("");
  const [useCustomMessage, setUseCustomMessage] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    senderUsed: string | null;
    errorDetail?: string | null;
  } | null>(null);

  const { data: senders, isLoading: sendersLoading } = useListSenders();
  const sendMutation = useSendFixMerah();

  const activeSenders = senders?.filter((s) => s.status === "active") ?? [];

  function formatNumber(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return raw;
    if (digits.startsWith("0")) return "62" + digits.slice(1);
    return digits;
  }

  async function handleSend() {
    const cleaned = formatNumber(targetNumber.trim());
    if (!cleaned || cleaned.length < 8) {
      toast.error("Masukkan nomor WhatsApp yang valid (min. 8 digit)");
      return;
    }
    if (!userIdentifier.trim()) {
      toast.error("Masukkan identifier pengguna");
      return;
    }
    if (activeSenders.length === 0) {
      toast.error("Tidak ada sender aktif. Tambahkan sender terlebih dahulu di menu Senders.");
      return;
    }

    localStorage.setItem(IDENTIFIER_KEY, userIdentifier.trim());

    sendMutation.mutate(
      {
        data: {
          userIdentifier: userIdentifier.trim(),
          targetNumber: "+" + cleaned,
          customMessage: useCustomMessage && customMessage.trim() ? customMessage.trim() : null,
        },
      },
      {
        onSuccess: (result) => {
          setLastResult(result);
          if (result.success) {
            toast.success("Berhasil dikirim ke WhatsApp Support!");
            setTargetNumber("");
          } else {
            toast.error("Gagal kirim: " + result.message);
          }
          queryClient.invalidateQueries({ queryKey: getGetFixMerahStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListFixMerahHistoryQueryKey() });
        },
        onError: (err) => {
          toast.error("Error: " + (err as Error).message);
        },
      }
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            <span className="neon-text text-primary">Fix Merah</span>
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Kirim laporan nomor WhatsApp ke support@support.whatsapp.com
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sendersLoading ? (
            <Skeleton className="h-7 w-32" />
          ) : (
            <Badge
              className={`px-3 py-1 text-sm font-medium ${
                activeSenders.length > 0
                  ? "bg-green-500/10 text-green-400 border-green-500/30"
                  : "bg-red-500/10 text-red-400 border-red-500/30"
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  activeSenders.length > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              {activeSenders.length} Sender Aktif
            </Badge>
          )}
        </div>
      </div>

      {/* Warning if no senders */}
      <AnimatePresence>
        {!sendersLoading && activeSenders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-yellow-400 font-semibold text-sm">Belum ada sender aktif</p>
              <p className="text-muted-foreground text-xs mt-1">
                Pergi ke menu <strong>Senders</strong> untuk menambahkan Gmail sender sebelum bisa mengirim Fix Merah.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Send Form */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="glass-card neon-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-primary" />
                Kirim Fix Merah
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Identifier */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Identifier Pengguna
                </label>
                <Input
                  placeholder="contoh: user_andi atau nama_kamu"
                  value={userIdentifier}
                  onChange={(e) => setUserIdentifier(e.target.value)}
                  className="bg-white/5 border-border focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Digunakan untuk tracking di history & leaderboard. Disimpan otomatis.
                </p>
              </div>

              {/* Target Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Nomor Target (WhatsApp)
                </label>
                <Input
                  placeholder="contoh: 08123456789 atau 628123456789"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  className="bg-white/5 border-border focus:border-primary/50 text-lg font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                {targetNumber && (
                  <p className="text-xs text-muted-foreground">
                    Akan dikirim sebagai:{" "}
                    <span className="text-primary font-mono">+{formatNumber(targetNumber)}</span>
                  </p>
                )}
              </div>

              {/* Custom Message Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUseCustomMessage(!useCustomMessage)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    useCustomMessage ? "bg-primary" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      useCustomMessage ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-muted-foreground">Gunakan pesan custom</span>
              </div>

              <AnimatePresence>
                {useCustomMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Textarea
                      placeholder="Tulis pesan custom ke support@support.whatsapp.com..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={5}
                      className="bg-white/5 border-border focus:border-primary/50 font-mono text-sm resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={sendMutation.isPending || activeSenders.length === 0 || !targetNumber || !userIdentifier}
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/80 text-white neon-border shadow-[0_0_20px_rgba(255,0,51,0.3)] hover:shadow-[0_0_30px_rgba(255,0,51,0.5)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sendMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Kirim Fix Merah
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Result Card */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card
                  className={`glass-card border ${
                    lastResult.success ? "border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                  }`}
                >
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-3">
                      {lastResult.success ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <p className={`font-bold ${lastResult.success ? "text-green-400" : "text-red-400"}`}>
                          {lastResult.success ? "Berhasil Dikirim" : "Gagal Dikirim"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lastResult.senderUsed ? `via ${lastResult.senderUsed}` : ""}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{lastResult.message}</p>
                    {lastResult.errorDetail && (
                      <p className="text-xs text-red-400/70 font-mono bg-red-500/5 rounded p-2">
                        {lastResult.errorDetail}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Senders List */}
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="w-4 h-4" />
                Sender Tersedia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sendersLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
              ) : activeSenders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">Belum ada sender aktif</p>
              ) : (
                activeSenders.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-foreground font-mono truncate max-w-[140px]">{s.email}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {s.dailyLimit ? `${s.totalUsed}/${s.dailyLimit}` : `${s.totalUsed} sent`}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="glass-card border-primary/20">
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cara Kerja</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">1.</span> Masukkan nomor WhatsApp target</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">2.</span> Sistem pilih sender Gmail aktif (auto-rotate)</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">3.</span> Email dikirim ke support@support.whatsapp.com</li>
                <li className="flex items-start gap-2"><span className="text-primary mt-0.5">4.</span> Hasil tersimpan di history otomatis</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
