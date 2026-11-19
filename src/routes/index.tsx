import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { GraduationCap, ShieldCheck, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSessionUser, login } from "@/lib/repository";
import { ROLE_LABELS } from "@/lib/types";
import { PrototypeNotice } from "@/components/app/PrototypeNotice";

export const Route = createFileRoute("/")({
  head: () => pageHead("Sign in", "Sign in with labelled offline academic demo accounts."),
  component: Landing,
});

const STAFF = [
  ["admin@demo.edu", "admin123", "sysadmin"], ["faculty@demo.edu", "faculty123", "faculty_admin"],
  ["dept@demo.edu", "dept123", "dept_admin"], ["affairs@demo.edu", "affairs123", "student_affairs"],
  ["lecturer@demo.edu", "lecturer123", "lecturer"],
] as const;
const STUDENTS = [["student@demo.edu", "student123", "CSC, 400 Level"], ["fatima@demo.edu", "student123", "English, 200 Level"]] as const;

function Landing() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  useEffect(() => { if (getSessionUser()) nav({ to: "/app" }); }, [nav]);
  const doLogin = (e = email, p = pw) => {
    try { const u = login(e, p); toast.success(`Welcome, ${u.name}`); nav({ to: "/app" }); }
    catch (x) { setErr((x as Error).message); }
  };
  const Cred = ({ e, p, label }: { e: string; p: string; label: string }) => (
    <Button type="button" variant="outline" onClick={() => doLogin(e, p)} className="flex h-auto w-full items-center justify-between gap-3 whitespace-normal px-3 py-2 text-left text-sm">
      <span><span className="block font-medium">{label}</span><span className="text-xs text-muted-foreground">{e} / {p}</span></span>
      <span className="text-xs font-medium text-primary">Sign in →</span>
    </Button>
  );
  return (
    <div className="min-h-screen bg-background">
      <PrototypeNotice />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2 lg:py-16">
        <section className="flex flex-col justify-center">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Megaphone /></div>
          <h1 className="text-4xl font-bold leading-tight text-foreground">University Notice &amp; Announcement Management System</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">One place for official notices — examinations, registration, hostel, scholarships and emergencies — targeted to the right faculty, department or level.</p>
          <ul className="mt-6 grid gap-2 text-sm text-foreground">
            <li>• Role-based publishing for administrators and offices</li>
            <li>• Personalised student notice feed with search and filters</li>
            <li>• In-app notifications and a full activity log</li>
          </ul>
        </section>
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold">Sign in</h2>
          <form className="mt-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); doLogin(); }}>
            <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="grid gap-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
            {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
            <Button type="submit">Sign in</Button>
          </form>
          <Tabs defaultValue="student" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student"><GraduationCap className="mr-1 h-4 w-4" />Student demo</TabsTrigger>
              <TabsTrigger value="staff"><ShieldCheck className="mr-1 h-4 w-4" />Admin demo</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="grid gap-2">{STUDENTS.map(([e, p, l]) => <Cred key={e} e={e} p={p} label={`Student · ${l}`} />)}</TabsContent>
            <TabsContent value="staff" className="grid gap-2">{STAFF.map(([e, p, r]) => <Cred key={e} e={e} p={p} label={ROLE_LABELS[r]} />)}</TabsContent>
          </Tabs>
          <p className="mt-4 text-xs text-muted-foreground">Demo accounts only. Data is stored in this browser (localStorage).</p>
        </section>
      </div>
    </div>
  );
}