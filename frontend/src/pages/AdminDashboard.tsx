import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Place {
  _id: string; name: string; image: string; description: string;
  price: number; location: string; type: string; rating: number;
  state: string; district: string; entryFee: number; transportCost: number;
  latitude?: number | null; longitude?: number | null;
}
interface User { _id: string; name: string; email: string; role: string; }
interface Trip {
  _id: string; userId: { name: string; email: string } | null;
  days: number; persons: number; totalCost: number;
  status: string; startDate: string; places: any[];
  fromLocation?: string; transport?: string; distance?: number;
  placeCost?: number; transportCost?: number; foodCost?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PLACE_TYPES = ["Beach", "Hill", "City", "Forest", "Heritage", "Other"];
const PIE_COLORS  = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6b7280"];

const NAV_ITEMS = [
  { id: "overview",  label: "Overview",     icon: "⚡" },
  { id: "addPlace",  label: "Add Place",    icon: "➕" },
  { id: "places",    label: "Places",       icon: "🗺️" },
  { id: "users",     label: "Users",        icon: "👥" },
  { id: "trips",     label: "Trips",        icon: "✈️" },
  { id: "analytics", label: "Analytics",    icon: "📊" },
];

// ─── Design tokens (inline styles for glass fx) ───────────────────────────────
const glass = {
  card: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px",
  } as React.CSSProperties,
  cardLight: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "14px",
  } as React.CSSProperties,
  input: {
    background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "10px",
    color: "white",
  } as React.CSSProperties,
  sidebar: {
    background: "linear-gradient(180deg, #0F172A 0%, #1E293B 100%)",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  } as React.CSSProperties,
  topbar: {
    background: "rgba(15,23,42,0.85)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  } as React.CSSProperties,
  page: {
    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2040 100%)",
    minHeight: "100vh",
  } as React.CSSProperties,
};

// ─── Shared form class (dark glass) ──────────────────────────────────────────
const inputCls = [
  "w-full px-4 py-2.5 text-sm rounded-xl transition",
  "bg-white/8 border border-white/15 text-white placeholder-white/30",
  "focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60",
].join(" ");
const labelCls = "block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider";

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div style={{ zIndex: 9999 }}
      className={`fixed top-5 right-5 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-fade-in
        ${type === "success"
          ? "bg-gradient-to-r from-emerald-500 to-green-600"
          : "bg-gradient-to-r from-red-500 to-rose-600"}`}>
      <span className="text-base">{type === "success" ? "✅" : "❌"}</span>
      {msg}
    </div>
  );
}

// ─── Glass Card wrapper ───────────────────────────────────────────────────────
function GlassCard({ children, className = "", glow = false, style = {} }: {
  children: React.ReactNode; className?: string; glow?: boolean; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`transition-all duration-300 hover:scale-[1.005] ${className}`}
      style={{
        ...glass.card,
        ...(glow ? { boxShadow: "0 0 40px rgba(99,102,241,0.15), 0 4px 24px rgba(0,0,0,0.3)" } : { boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }),
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = "h-12" }: { h?: string }) {
  return <div className={`${h} rounded-xl animate-pulse`} style={{ background: "rgba(255,255,255,0.06)" }} />;
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHeading({ title, sub, icon }: { title: string; sub?: string; icon?: string }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-3 mb-1">
        {icon && <span className="text-2xl">{icon}</span>}
        <h2 className="text-2xl font-extrabold text-white tracking-tight">{title}</h2>
      </div>
      {sub && <p className="text-white/40 text-sm ml-9">{sub}</p>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, gradient, delay = 0 }: {
  icon: string; label: string; value: any; gradient: string; delay?: number;
}) {
  return (
    <GlassCard glow className="p-6 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-5">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-xl shadow-lg`}>
          {icon}
        </div>
        <span className="text-white/25 text-xs font-semibold uppercase tracking-widest">Total</span>
      </div>
      <div className="text-4xl font-extrabold text-white mb-1">{value ?? "—"}</div>
      <div className="text-white/45 text-sm font-medium">{label}</div>
      {/* Glow accent */}
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl pointer-events-none`} />
    </GlassCard>
  );
}

// ─── Glass Table ──────────────────────────────────────────────────────────────
function GlassTable({ headers, children, empty }: {
  headers: string[]; children: React.ReactNode; empty?: boolean;
}) {
  if (empty) return (
    <GlassCard className="text-center py-16">
      <p className="text-4xl mb-3">🌐</p>
      <p className="text-white/40 font-medium">Nothing here yet</p>
    </GlassCard>
  );
  return (
    <div className="overflow-x-auto rounded-2xl" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(99,102,241,0.15)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {headers.map((h) => (
              <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-white/50 uppercase tracking-widest">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ background: "rgba(255,255,255,0.03)" }}>
          {children}
        </tbody>
      </table>
    </div>
  );
}

function GlassTR({ children }: { children: React.ReactNode }) {
  return (
    <tr className="transition-colors cursor-default"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
      {children}
    </tr>
  );
}

function GlassTD({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3.5 text-white/75 ${className}`}>{children}</td>;
}

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, color = "indigo" }: { children: React.ReactNode; color?: "indigo"|"emerald"|"amber"|"red"|"slate" }) {
  const map = {
    indigo:  "bg-indigo-500/20 text-indigo-300  border-indigo-500/25",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/25",
    amber:   "bg-amber-500/20  text-amber-300   border-amber-500/25",
    red:     "bg-red-500/20    text-red-300     border-red-500/25",
    slate:   "bg-white/8       text-white/50    border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[color]}`}>
      {children}
    </span>
  );
}

// ─── Glassmorphism input/button styles ────────────────────────────────────────
function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full px-4 py-2.5 text-sm rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
      style={glass.input}
    />
  );
}

function GlassTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className="w-full px-4 py-2.5 text-sm rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition resize-none"
      style={glass.input}
    />
  );
}

function GlassSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props}
      className="w-full px-4 py-2.5 text-sm rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition"
      style={{ ...glass.input, colorScheme: "dark" }}
    />
  );
}

function PrimaryBtn({ onClick, disabled, children, className = "" }: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95 ${className}`}
      style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Overview
// ═══════════════════════════════════════════════════════════════════════════════
function Overview({ analytics }: { analytics: any }) {
  if (!analytics) return (
    <div>
      <SectionHeading title="Overview" icon="⚡" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[1,2,3].map(i => <Skeleton key={i} h="h-36" />)}
      </div>
    </div>
  );

  const stats = [
    { icon: "👥", label: "Registered Users",  value: analytics.totalUsers,  gradient: "from-violet-500 to-purple-700",   delay: 0   },
    { icon: "✈️", label: "Total Trips Booked", value: analytics.totalTrips,  gradient: "from-cyan-500 to-blue-600",       delay: 80  },
    { icon: "🗺️", label: "Places in Database", value: analytics.totalPlaces, gradient: "from-emerald-500 to-teal-600",    delay: 160 },
  ];

  return (
    <div>
      <SectionHeading title="Overview" sub="Platform performance at a glance" icon="⚡" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="relative overflow-hidden">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Quick activity strip */}
      <GlassCard className="p-5">
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-4">Quick Stats</p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Avg trips/user", value: analytics.totalUsers > 0 ? (analytics.totalTrips / analytics.totalUsers).toFixed(1) : "0", color: "text-indigo-300" },
            { label: "Places per trip", value: "≤ 3/day", color: "text-cyan-300" },
            { label: "Transport rates", value: "₹5–₹10/km", color: "text-emerald-300" },
            { label: "Food estimate",   value: "₹450/day",  color: "text-amber-300" },
          ].map(q => (
            <div key={q.label} className="flex flex-col">
              <span className={`text-lg font-extrabold ${q.color}`}>{q.value}</span>
              <span className="text-white/35 text-xs">{q.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Add Place
// ═══════════════════════════════════════════════════════════════════════════════
function AddPlace({ onSuccess, showToast }: {
  onSuccess: () => void;
  showToast: (m: string, t?: "success" | "error") => void;
}) {
  const empty = {
    name: "", image: "", description: "", price: "", location: "", type: "Other",
    rating: "", state: "", district: "", entryFee: "", transportCost: "", latitude: "", longitude: "",
  };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return showToast("Place name is required", "error");
    setLoading(true);
    try {
      await API.post("/admin/place", {
        ...form,
        price:         Number(form.price) || 0,
        rating:        Number(form.rating) || 0,
        entryFee:      Number(form.entryFee) || 0,
        transportCost: Number(form.transportCost) || 0,
        latitude:      form.latitude  !== "" ? Number(form.latitude)  : null,
        longitude:     form.longitude !== "" ? Number(form.longitude) : null,
      });
      showToast("Place added successfully!");
      setForm(empty);
      onSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.msg || "Error adding place", "error");
    } finally { setLoading(false); }
  };

  const Field = ({ label, field, type = "text", placeholder = "" }: any) => (
    <div>
      <label className={labelCls}>{label}</label>
      <GlassInput type={type} placeholder={placeholder} value={(form as any)[field]}
        onChange={e => set(field, e.target.value)} />
    </div>
  );

  return (
    <div>
      <SectionHeading title="Add Place" sub="Add a new destination to the database" icon="➕" />
      <GlassCard className="p-7 max-w-2xl" glow>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Place Name *" field="name" placeholder="e.g. Mysore Palace" />
          <Field label="Location" field="location" placeholder="e.g. Mysore, Karnataka" />
          <div className="sm:col-span-2">
            <label className={labelCls}>Image URL</label>
            <GlassInput type="url" placeholder="https://..." value={form.image} onChange={e => set("image", e.target.value)} />
          </div>
          {form.image && (
            <div className="sm:col-span-2">
              <img src={form.image} alt="preview" className="w-full h-44 object-cover rounded-xl opacity-90"
                onError={e => (e.currentTarget.style.display = "none")} />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <GlassTextarea rows={3} placeholder="Brief description..." value={form.description}
              onChange={e => set("description", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <GlassSelect value={form.type} onChange={e => set("type", e.target.value)}>
              {PLACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </GlassSelect>
          </div>
          <Field label="State" field="state" placeholder="Karnataka" />
          <Field label="District" field="district" placeholder="Mysore" />
          <Field label="Price (₹)" field="price" type="number" placeholder="2000" />
          <Field label="Entry Fee (₹)" field="entryFee" type="number" placeholder="50" />
          <Field label="Transport Cost (₹)" field="transportCost" type="number" placeholder="100" />
          <Field label="Rating (0–5)" field="rating" type="number" placeholder="4.2" />
          <Field label="Latitude (optional)" field="latitude" type="number" placeholder="12.9716" />
          <Field label="Longitude (optional)" field="longitude" type="number" placeholder="77.5946" />
        </div>
        <div className="mt-6">
          <PrimaryBtn onClick={handleSubmit} disabled={loading} className="w-full py-3 text-base">
            {loading ? "⏳ Adding..." : "✨ Add Place"}
          </PrimaryBtn>
        </div>
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Manage Places
// ═══════════════════════════════════════════════════════════════════════════════
function ManagePlaces({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Place>>({});

  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try { const res = await API.get("/places"); setPlaces(res.data); }
    catch { showToast("Error loading places", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this place?")) return;
    try { await API.delete(`/admin/place/${id}`); showToast("Place deleted"); fetchPlaces(); }
    catch { showToast("Error deleting", "error"); }
  };

  const startEdit = (p: Place) => { setEditId(p._id); setEditForm(p); };
  const cancelEdit = () => { setEditId(null); setEditForm({}); };
  const saveEdit = async () => {
    try {
      await API.put(`/admin/place/${editId}`, editForm);
      showToast("Place updated!"); setEditId(null); fetchPlaces();
    } catch { showToast("Error updating", "error"); }
  };

  const typeColors: Record<string, "indigo"|"emerald"|"amber"|"red"|"slate"> = {
    Beach: "indigo", Hill: "emerald", City: "amber", Forest: "emerald", Heritage: "amber", Other: "slate",
  };

  if (loading) return (
    <div>
      <SectionHeading title="Places" icon="🗺️" />
      <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} />)}</div>
    </div>
  );

  return (
    <div>
      <SectionHeading title="Places" sub={`${places.length} destinations in database`} icon="🗺️" />
      {places.length === 0
        ? <GlassCard className="text-center py-20"><p className="text-5xl mb-3">🗺️</p><p className="text-white/40">No places yet</p></GlassCard>
        : (
          <GlassTable headers={["Image", "Name", "Type", "Location", "Price", "Rating", "Actions"]} empty={false}>
            {places.map(p => editId === p._id ? (
              <tr key={p._id} style={{ background: "rgba(99,102,241,0.12)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td colSpan={7} className="px-5 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {(["name","location","type","price","rating","entryFee","transportCost","image","description"] as const).map(field => (
                      <div key={field}>
                        <label className={labelCls}>{field}</label>
                        {field === "type" ? (
                          <GlassSelect value={(editForm as any)[field] || ""} onChange={e => setEditForm(f => ({...f, [field]: e.target.value}))}>
                            {PLACE_TYPES.map(t => <option key={t}>{t}</option>)}
                          </GlassSelect>
                        ) : (
                          <GlassInput value={(editForm as any)[field] || ""} onChange={e => setEditForm(f => ({...f, [field]: e.target.value}))} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <PrimaryBtn onClick={saveEdit}>✓ Save</PrimaryBtn>
                    <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white transition"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <GlassTR key={p._id}>
                <GlassTD>
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-12 h-10 object-cover rounded-lg"
                        onError={e => (e.currentTarget.style.display = "none")} />
                    : <div className="w-12 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ background: "rgba(255,255,255,0.06)" }}>🗺️</div>
                  }
                </GlassTD>
                <GlassTD className="font-bold text-white">{p.name}</GlassTD>
                <GlassTD><Badge color={typeColors[p.type] || "slate"}>{p.type}</Badge></GlassTD>
                <GlassTD className="text-white/50 text-xs">{p.location || `${p.district}, ${p.state}`}</GlassTD>
                <GlassTD className="font-semibold text-emerald-300">₹{p.price || p.entryFee || "—"}</GlassTD>
                <GlassTD>
                  <span className="text-amber-400">{"★".repeat(Math.round(p.rating || 0))}</span>
                  <span className="text-white/30 text-xs ml-1">{p.rating || 0}</span>
                </GlassTD>
                <GlassTD>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold text-indigo-300 hover:text-white transition"
                      style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold text-red-300 hover:text-white transition"
                      style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
                      Delete
                    </button>
                  </div>
                </GlassTD>
              </GlassTR>
            ))}
          </GlassTable>
        )
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Users
// ═══════════════════════════════════════════════════════════════════════════════
function Users({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/users")
      .then(r => setUsers(r.data))
      .catch(() => showToast("Error loading users", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <SectionHeading title="Users" icon="👥" />
      <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} />)}</div>
    </div>
  );

  return (
    <div>
      <SectionHeading title="Users" sub={`${users.length} registered accounts`} icon="👥" />
      <GlassTable headers={["#", "User", "Email", "Role"]}  empty={users.length === 0}>
        {users.map((u, i) => (
          <GlassTR key={u._id}>
            <GlassTD className="text-white/25 text-xs w-12">{i + 1}</GlassTD>
            <GlassTD>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
                  {u.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="font-semibold text-white">{u.name}</span>
              </div>
            </GlassTD>
            <GlassTD className="text-white/50">{u.email}</GlassTD>
            <GlassTD>
              <Badge color={u.role === "admin" ? "indigo" : "emerald"}>{u.role}</Badge>
            </GlassTD>
          </GlassTR>
        ))}
      </GlassTable>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Trips
// ═══════════════════════════════════════════════════════════════════════════════
function Trips({ showToast: _st }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/trips")
      .then(r => setTrips(r.data))
      .catch(() => setError("Failed to load trips."))
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, "indigo"|"emerald"|"slate"> = {
    upcoming: "indigo", ongoing: "emerald", completed: "slate",
  };

  const transportIcon = (t: string) => t === "Car" ? "🚗" : t === "Bus" ? "🚌" : "🚂";

  if (loading) return (
    <div>
      <SectionHeading title="Trips" icon="✈️" />
      <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} />)}</div>
    </div>
  );

  if (error) return (
    <div>
      <SectionHeading title="Trips" icon="✈️" />
      <GlassCard className="p-8 text-center">
        <p className="text-3xl mb-3">⚠️</p>
        <p className="text-white/50">{error}</p>
      </GlassCard>
    </div>
  );

  return (
    <div>
      <SectionHeading title="Trips" sub={`${trips.length} bookings total`} icon="✈️" />
      {trips.length === 0 ? (
        <GlassCard className="text-center py-20"><p className="text-5xl mb-3">✈️</p><p className="text-white/40">No trips yet</p></GlassCard>
      ) : (
        <GlassTable headers={["User", "Places", "Days", "Persons", "Transport", "Cost Breakdown", "Date", "Status"]} empty={false}>
          {trips.map(t => {
            const places = Array.isArray(t.places) ? t.places : [];
            return (
              <GlassTR key={t._id}>
                <GlassTD>
                  <div className="font-semibold text-white text-sm">{t.userId?.name || "—"}</div>
                  <div className="text-white/35 text-xs">{t.userId?.email || ""}</div>
                </GlassTD>
                <GlassTD>
                  {places.length === 0
                    ? <span className="text-white/25 italic text-xs">—</span>
                    : (
                      <div className="flex flex-wrap gap-1">
                        {places.slice(0,2).map((p:any, i:number) => (
                          <Badge key={i} color="indigo">{p?.name || "?"}</Badge>
                        ))}
                        {places.length > 2 && <span className="text-white/30 text-xs">+{places.length-2}</span>}
                      </div>
                    )
                  }
                </GlassTD>
                <GlassTD className="font-semibold text-white">{t.days ?? "—"}</GlassTD>
                <GlassTD className="font-semibold text-white">{t.persons ?? "—"}</GlassTD>
                <GlassTD>
                  {t.transport ? (
                    <div className="space-y-0.5">
                      <Badge color="indigo">{transportIcon(t.transport)} {t.transport}</Badge>
                      {(t.distance||0)>0&&<div className="text-white/35 text-xs">{t.distance} km</div>}
                      {t.fromLocation&&<div className="text-white/35 text-xs">📌 {t.fromLocation}</div>}
                    </div>
                  ) : <span className="text-white/25">—</span>}
                </GlassTD>
                <GlassTD>
                  <div className="space-y-0.5 text-xs">
                    {(t.placeCost||0)>0&&<div className="text-indigo-300">🎟 ₹{t.placeCost?.toLocaleString()}</div>}
                    {(t.transportCost||0)>0&&<div className="text-cyan-300">🚌 ₹{t.transportCost?.toLocaleString()}</div>}
                    {(t.foodCost||0)>0&&<div className="text-amber-300">🍽 ₹{t.foodCost?.toLocaleString()}</div>}
                    <div className="font-extrabold text-emerald-300 pt-0.5 border-t border-white/10">
                      ₹{t.totalCost?.toLocaleString() || 0}
                    </div>
                  </div>
                </GlassTD>
                <GlassTD className="text-white/45 text-xs whitespace-nowrap">
                  {t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"}
                </GlassTD>
                <GlassTD>
                  <Badge color={statusColors[t.status || ""] || "slate"}>{t.status || "—"}</Badge>
                </GlassTD>
              </GlassTR>
            );
          })}
        </GlassTable>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION: Analytics
// ═══════════════════════════════════════════════════════════════════════════════
const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "12px",
  },
  labelStyle: { color: "rgba(255,255,255,0.5)" },
};

function Analytics({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [placeStats, setPlaceStats] = useState<any[]>([]);
  const [tripStats,  setTripStats]  = useState<any[]>([]);
  const [userStats,  setUserStats]  = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/admin/analytics/places"),
      API.get("/admin/analytics/trips"),
      API.get("/admin/analytics/users"),
    ])
      .then(([p, t, u]) => { setPlaceStats(p.data); setTripStats(t.data); setUserStats(u.data); })
      .catch(() => showToast("Error loading analytics", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <SectionHeading title="Analytics" icon="📊" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[1,2].map(i => <Skeleton key={i} h="h-80" />)}
      </div>
    </div>
  );

  // Build a line-ish chart from trip stats for user growth mock
  const growthData = tripStats.map((d, i) => ({ ...d, cumulative: tripStats.slice(0, i+1).reduce((s:number,x:any)=>s+x.count,0) }));

  return (
    <div>
      <SectionHeading title="Analytics" sub="Visualise your platform data" icon="📊" />

      {/* User summary stat row */}
      {userStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Regular Users", value: userStats.totalUsers, gradient: "from-emerald-500 to-teal-600"   },
            { label: "Admins",        value: userStats.totalAdmins, gradient: "from-violet-500 to-purple-700" },
            { label: "Total Accounts",value: userStats.total,      gradient: "from-indigo-500 to-blue-600"   },
          ].map(c => (
            <GlassCard key={c.label} className="p-5 text-center" glow>
              <div className="text-3xl font-extrabold text-white mb-1">
                <span className={`bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>{c.value}</span>
              </div>
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wide">{c.label}</div>
            </GlassCard>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Pie chart */}
        <GlassCard className="p-6" glow>
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-indigo-500 inline-flex" /> Places by Type
          </h3>
          {placeStats.length === 0
            ? <p className="text-white/30 text-center py-10">No place data yet</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={placeStats} dataKey="count" nameKey="type" cx="50%" cy="50%"
                    outerRadius={90} paddingAngle={4} strokeWidth={0}>
                    {placeStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v:any) => [`${v} places`]} />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </GlassCard>

        {/* Bar chart */}
        <GlassCard className="p-6" glow>
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-cyan-500 inline-flex" /> Trips (Last 7 Days)
          </h3>
          {tripStats.length === 0
            ? <p className="text-white/30 text-center py-10">No trip data yet</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={tripStats} margin={{ top:5, right:10, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize:11, fill:"rgba(255,255,255,0.4)" }}
                    tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11, fill:"rgba(255,255,255,0.4)" }}
                    axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v:any) => [`${v} trips`]} />
                  <Bar dataKey="count" name="Trips" fill="url(#barGrad)" radius={[6,6,0,0]}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </GlassCard>
      </div>

      {/* Line / Area chart — cumulative trips */}
      {growthData.length > 0 && (
        <GlassCard className="p-6" glow>
          <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-emerald-500 inline-flex" /> Cumulative Booking Growth
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData} margin={{ top:5, right:10, left:0, bottom:5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:"rgba(255,255,255,0.35)" }}
                tickFormatter={d => d.slice(5)} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize:11, fill:"rgba(255,255,255,0.35)" }}
                axisLine={false} tickLine={false} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v:any) => [`${v} total bookings`]} />
              <Area type="monotone" dataKey="cumulative" name="Bookings" stroke="#6366f1"
                strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill:"#6366f1", strokeWidth:0, r:4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((msg: string, type: "success"|"error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try { const res = await API.get("/admin/analytics"); setAnalytics(res.data); } catch {}
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") { navigate("/dashboard"); return; }
    fetchAnalytics();
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":   return <Overview analytics={analytics} />;
      case "addPlace":   return <AddPlace onSuccess={fetchAnalytics} showToast={showToast} />;
      case "places":     return <ManagePlaces showToast={showToast} />;
      case "users":      return <Users showToast={showToast} />;
      case "trips":      return <Trips showToast={showToast} />;
      case "analytics":  return <Analytics showToast={showToast} />;
      default:           return null;
    }
  };

  const activeItem = NAV_ITEMS.find(n => n.id === activeSection);

  return (
    <div className="flex min-h-screen font-sans" style={glass.page}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ${sidebarOpen ? "w-60" : "w-16"}`}
        style={glass.sidebar}>

        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 ${!sidebarOpen && "justify-center"}`}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
            🌍
          </div>
          {sidebarOpen && <span className="font-extrabold text-white text-lg tracking-tight">Wanderlust</span>}
        </div>

        {/* Admin pill */}
        {sidebarOpen && (
          <div className="mx-4 mt-4 mb-1">
            <div className="rounded-xl px-3 py-2.5 flex items-center gap-3"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>A</div>
              <div>
                <p className="text-white text-xs font-bold">Admin</p>
                <p className="text-white/35 text-xs">Dashboard</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive ? "text-white" : "text-white/45 hover:text-white/80"
                } ${!sidebarOpen && "justify-center"}`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(99,102,241,0.2))",
                  border: "1px solid rgba(99,102,241,0.4)",
                  boxShadow: "0 0 20px rgba(99,102,241,0.15)",
                } : {
                  background: "transparent",
                  border: "1px solid transparent",
                }}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 transition-all duration-200 ${!sidebarOpen && "justify-center"}`}
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <span className="text-base flex-shrink-0">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-16"}`}>

        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4" style={glass.topbar}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(s => !s)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white transition text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base">{activeItem?.icon}</span>
              <h1 className="text-base font-bold text-white">{activeItem?.label || "Dashboard"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            <button onClick={() => navigate("/dashboard")}
              className="text-xs text-white/40 hover:text-white transition font-medium hidden sm:block">
              ← Back to Site
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow:"0 0 12px rgba(99,102,241,0.5)" }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
