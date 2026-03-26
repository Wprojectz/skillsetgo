import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Calendar, Save, FileSearch, Target, TrendingUp } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgMatch: 0, avgAts: 0 });

  useEffect(() => {
    if (!user) return;

    // Load profile
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || "");
        }
        setLoading(false);
      });

    // Load stats
    supabase
      .from("analysis_history")
      .select("match_percentage, ats_score")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setStats({
            total: data.length,
            avgMatch: Math.round(data.reduce((s, h) => s + h.match_percentage, 0) / data.length),
            avgAts: Math.round(data.reduce((s, h) => s + h.ats_score, 0) / data.length),
          });
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, avatar_url: avatarUrl })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-2xl">
        {/* Profile Header */}
        <div className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-heading text-2xl font-bold shadow-lg shadow-primary/20">
              {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">{displayName || "Set your name"}</h2>
              <p className="font-body text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
              <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5" /> Joined {new Date(user?.created_at || "").toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: FileSearch, label: "Analyses", value: stats.total, color: "text-primary", border: "border-primary/20" },
            { icon: Target, label: "Avg Match", value: `${stats.avgMatch}%`, color: "text-aqua", border: "border-aqua/20" },
            { icon: TrendingUp, label: "Avg ATS", value: `${stats.avgAts}/100`, color: "text-accent", border: "border-accent/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border ${s.border} bg-card p-4 flex items-center gap-3`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="font-body text-xs text-muted-foreground">{s.label}</p>
                <p className="font-heading text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Form */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Edit Profile
          </h3>
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="bg-secondary/50 border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-foreground">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="bg-secondary/50 border-border"
            />
          </div>
          <Button variant="signal" onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
