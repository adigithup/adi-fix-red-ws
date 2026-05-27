import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We will contact you soon.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight neon-text text-white text-center mb-8">Contact Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <a href="https://wa.me/" target="_blank" rel="noreferrer" className="block">
          <Card className="glass-card hover:bg-white/5 transition-all cursor-pointer border-green-500/30 hover:border-green-500 text-center group">
            <CardContent className="pt-6">
              <MessageSquare className="w-10 h-10 mx-auto text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">Fastest response</p>
            </CardContent>
          </Card>
        </a>
        
        <a href="https://t.me/" target="_blank" rel="noreferrer" className="block">
          <Card className="glass-card hover:bg-white/5 transition-all cursor-pointer border-blue-500/30 hover:border-blue-500 text-center group">
            <CardContent className="pt-6">
              <Send className="w-10 h-10 mx-auto text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg">Telegram</h3>
              <p className="text-sm text-muted-foreground">Community & Support</p>
            </CardContent>
          </Card>
        </a>

        <Card className="glass-card border-primary/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <CardContent className="pt-6">
            <div className="w-10 h-10 mx-auto bg-primary rounded-full flex items-center justify-center mb-3 neon-border shadow-[0_0_15px_rgba(255,0,51,0.5)]">
              <span className="font-bold text-white">AD</span>
            </div>
            <h3 className="font-bold text-lg neon-text text-primary">Channel</h3>
            <p className="text-sm text-muted-foreground">Official Updates</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle>Send a Message</CardTitle>
          <CardDescription>Directly reach out to our admin team</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input required placeholder="Your name" className="bg-black/30 border-primary/20" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email / Contact</label>
                <Input required placeholder="How to reach you" className="bg-black/30 border-primary/20" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea required placeholder="Describe your issue or request..." className="min-h-[120px] bg-black/30 border-primary/20" />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white neon-border shadow-[0_0_15px_rgba(255,0,51,0.3)]">
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
