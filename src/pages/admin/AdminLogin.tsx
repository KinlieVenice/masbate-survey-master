import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registerUser, signIn } from "@/lib/adminStore";
import logo from "@/assets/ranola-logo.jpg";
import topo from "@/assets/topo-map.jpg";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(100),
});
const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Name required").max(80),
});

const AdminLogin = () => {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const v = signupSchema.parse(form);
        registerUser({ email: v.email, password: v.password, name: v.name });
        signIn(v.email, v.password);
        toast.success("Account created. Welcome!");
      } else {
        const v = loginSchema.parse({ email: form.email, password: form.password });
        signIn(v.email, v.password);
        toast.success("Welcome back");
      }
      nav("/ranola-admin/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : err instanceof Error ? err.message : "Failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block bg-gradient-forest overflow-hidden">
        <img src={topo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/60" />
        <div className="relative h-full flex flex-col justify-between p-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-sm overflow-hidden bg-primary-foreground/10">
              <img src={logo} alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-serif text-lg">Rañola</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-primary-foreground/70">Admin Console</div>
            </div>
          </div>
          <div>
            <h1 className="font-serif text-4xl xl:text-5xl leading-tight mb-4 text-balance">
              Manage your sales,<br />expenses, and clients<br />
              <span className="italic font-light">in one quiet place.</span>
            </h1>
            <p className="text-primary-foreground/70 max-w-md">
              The internal tool for Rañola Surveying Services. Sign in to continue.
            </p>
          </div>
          <div className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Rañola Surveying Services
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-11 w-11 rounded-sm overflow-hidden bg-primary">
              <img src={logo} alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-serif text-lg text-foreground">Rañola</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Admin</div>
            </div>
          </div>
          <h2 className="font-serif text-3xl text-foreground mb-2">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {mode === "login"
              ? "Enter your credentials to access the admin."
              : "Set up your admin account to get started."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "login" ? (
              <>
                No account yet?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
