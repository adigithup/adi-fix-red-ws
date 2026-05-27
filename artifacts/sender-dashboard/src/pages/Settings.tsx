import { useState, useEffect } from "react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const [siteName, setSiteName] = useState("");
  const [neonMode, setNeonMode] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName);
      setNeonMode(settings.neonMode);
      setDarkMode(settings.darkMode);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(
      { data: { siteName, neonMode, darkMode } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
          toast.success("Settings saved successfully");
          
          if (!darkMode) {
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
          }
          
          if (!neonMode) {
            document.documentElement.style.setProperty('--primary', '0 0% 50%');
          } else {
            document.documentElement.style.setProperty('--primary', '348 100% 50%');
          }
        },
        onError: () => {
          toast.error("Failed to save settings");
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight neon-text text-white">System Settings</h2>

      <Card className="glass-card neon-border">
        <CardHeader>
          <CardTitle>General Configurations</CardTitle>
          <CardDescription>Manage your application settings and appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)} 
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary/50 max-w-md"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-black/20">
                <div className="space-y-0.5">
                  <Label className="text-base">Neon Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable glowing red effects across the UI</p>
                </div>
                <Switch checked={neonMode} onCheckedChange={setNeonMode} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-black/20">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Force dark background theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={updateSettings.isPending}
                  className="bg-primary hover:bg-primary/90 text-white neon-border shadow-[0_0_15px_rgba(255,0,51,0.3)]"
                >
                  {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
