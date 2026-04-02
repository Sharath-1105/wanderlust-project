import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────
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

// ─── Constants ──────────────────────────────────────────────
const PLACE_TYPES = ["Beach", "Hill", "City", "Forest", "Heritage", "Other"];
const PIE_COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6b7280"];
const NAV_ITEMS = [
  { id: "overview",   label: "Overview",      icon: "📊" },
  { id: "addPlace",   label: "Add Place",      icon: "➕" },
  { id: "places",     label: "Manage Places",  icon: "🗺️" },
  { id: "users",      label: "Users",          icon: "👥" },
  { id: "trips",      label: "Trips",          icon: "✈️" },
  { id: "analytics",  label: "Analytics",      icon: "📈" },
];

const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white transition";
const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

// Toast
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium text-sm animate-fade-in ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅ " : "❌ "}{msg}
    </div>
  );
}

// ─── Overview ───────────────────────────────────────────────
function Overview({ analytics }: { analytics: any }) {
  if (!analytics) return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[1,2,3].map((i) => <div key={i} className="h-36 rounded-2xl skeleton" />)}
    </div>
  );
  const cards = [
    { label: "Total Users",   value: analytics.totalUsers,   icon: "👥", gradient: "from-violet-500 to-purple-600",  bg: "from-violet-500/10 to-purple-500/10" },
    { label: "Total Trips",   value: analytics.totalTrips,   icon: "✈️", gradient: "from-cyan-500 to-blue-600",      bg: "from-cyan-500/10 to-blue-500/10" },
    { label: "Total Places",  value: analytics.totalPlaces,  icon: "🗺️", gradient: "from-emerald-500 to-green-600",  bg: "from-emerald-500/10 to-green-500/10" },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.gradient} text-white rounded-2xl p-6 shadow-lg animate-fade-in`} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{c.icon}</div>
              <div className="bg-white/20 rounded-xl px-3 py-1 text-xs font-semibold opacity-80">Total</div>
            </div>
            <div className="text-4xl font-extrabold mb-1">{c.value ?? "—"}</div>
            <div className="text-white/75 text-sm">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Add Place ───────────────────────────────────────────────
function AddPlace({ onSuccess, showToast }: { onSuccess: () => void; showToast: (m: string, t?: "success" | "error") => void }) {
  const empty = { name: "", image: "", description: "", price: "", location: "", type: "Other", rating: "", state: "", district: "", entryFee: "", transportCost: "", latitude: "", longitude: "" };
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const set = (field: string, val: string) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return showToast("Place name is required", "error");
    setLoading(true);
    try {
      await API.post("/admin/place", {
        ...form,
        price: Number(form.price) || 0,
        rating: Number(form.rating) || 0,
        entryFee: Number(form.entryFee) || 0,
        transportCost: Number(form.transportCost) || 0,
        latitude: form.latitude !== "" ? Number(form.latitude) : null,
        longitude: form.longitude !== "" ? Number(form.longitude) : null,
      });
      showToast("Place added successfully!");
      setForm(empty);
      onSuccess();
    } catch (err: any) {
      showToast(err.response?.data?.msg || "Error adding place", "error");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder = "" }: any) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} placeholder={placeholder} value={(form as any)[field]}
        onChange={(e) => set(field, e.target.value)} className={inputCls} />
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add Place</h2>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Place Name *" field="name" placeholder="e.g. Mysore Palace" />
          <Field label="Location" field="location" placeholder="e.g. Mysore, Karnataka" />
          <div className="sm:col-span-2">
            <label className={labelCls}>Image URL</label>
            <input type="url" placeholder="https://..." value={form.image}
              onChange={(e) => set("image", e.target.value)} className={inputCls} />
          </div>
          {form.image && (
            <div className="sm:col-span-2">
              <img src={form.image} alt="preview" className="w-full h-44 object-cover rounded-xl"
                onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea rows={3} placeholder="Brief description..." value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputCls + " resize-none"} />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
              {PLACE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
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
        <button onClick={handleSubmit} disabled={loading}
          className="mt-6 w-full bg-gradient-to-r from-brand-500 to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 hover:scale-[1.01]">
          {loading ? "Adding..." : "Add Place"}
        </button>
      </div>
    </div>
  );
}

// ─── Manage Places ───────────────────────────────────────────
function ManagePlaces({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Place>>({});

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/places");
      setPlaces(res.data);
    } catch { showToast("Error loading places", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this place?")) return;
    try {
      await API.delete(`/admin/place/${id}`);
      showToast("Place deleted");
      fetch();
    } catch { showToast("Error deleting", "error"); }
  };

  const startEdit = (p: Place) => { setEditId(p._id); setEditForm(p); };
  const cancelEdit = () => { setEditId(null); setEditForm({}); };
  const saveEdit = async () => {
    try {
      await API.put(`/admin/place/${editId}`, editForm);
      showToast("Place updated!");
      setEditId(null);
      fetch();
    } catch { showToast("Error updating", "error"); }
  };

  if (loading) return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Places</h2>
      <div className="space-y-3">
        {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Manage Places <span className="text-base font-normal text-slate-400">({places.length})</span>
      </h2>
      {places.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-medium">No places added yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                {["Image", "Name", "Type", "Location", "Price", "Rating", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {places.map((p) =>
                editId === p._id ? (
                  <tr key={p._id} className="bg-brand-50">
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {(["name","location","type","price","rating","entryFee","transportCost","image","description"] as const).map((field) => (
                          <div key={field}>
                            <label className="text-xs text-slate-500 capitalize">{field}</label>
                            {field === "type" ? (
                              <select value={(editForm as any)[field] || ""} onChange={(e) => setEditForm((f) => ({...f, [field]: e.target.value}))} className={inputCls}>
                                {PLACE_TYPES.map((t) => <option key={t}>{t}</option>)}
                              </select>
                            ) : (
                              <input value={(editForm as any)[field] || ""} onChange={(e) => setEditForm((f) => ({...f, [field]: e.target.value}))} className={inputCls} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-sm hover:bg-emerald-600 transition">Save</button>
                        <button onClick={cancelEdit} className="bg-slate-100 text-slate-700 px-4 py-1.5 rounded-xl text-sm hover:bg-slate-200 transition">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={p._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-12 h-10 object-cover rounded-xl" onError={(e) => (e.currentTarget.style.display="none")} />
                        : <div className="w-12 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg">🗺️</div>
                      }
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-brand-100 text-brand-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">{p.type}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.location || `${p.district}, ${p.state}`}</td>
                    <td className="px-4 py-3 font-semibold">₹{p.price || p.entryFee || "—"}</td>
                    <td className="px-4 py-3 text-amber-400">{"★".repeat(Math.round(p.rating || 0))}<span className="text-slate-400 text-xs ml-1">{p.rating || 0}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition font-medium">Edit</button>
                        <button onClick={() => handleDelete(p._id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-100 transition font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Users ───────────────────────────────────────────────────
function Users({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/users")
      .then((r) => setUsers(r.data))
      .catch(() => showToast("Error loading users", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Users</h2>
      <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        Users <span className="text-base font-normal text-slate-400">({users.length})</span>
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
            <tr>
              {["#", "Name", "Email", "Role"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((u, i) => (
              <tr key={u._id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                <td className="px-4 py-3 font-medium flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </span>
                  {u.name}
                </td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    u.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"
                  }`}>{u.role}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Trips ───────────────────────────────────────────────────
function Trips({ showToast: _showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/trips")
      .then((r) => setTrips(r.data))
      .catch(() => setError("Failed to load trips."))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => {
    if (s === "upcoming") return "bg-brand-100 text-brand-700";
    if (s === "ongoing") return "bg-emerald-100 text-emerald-700";
    return "bg-slate-100 text-slate-600";
  };

  if (loading) return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">All Trips</h2>
      <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
    </div>
  );

  if (error) return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">All Trips</h2>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-center">{error}</div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">
        All Trips <span className="text-base font-normal text-slate-400">({trips.length})</span>
      </h2>

      {trips.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <p className="text-4xl mb-3">✈️</p>
          <p className="font-medium">No trips booked yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                {["User", "Places", "Days", "Persons", "Transport", "Cost Breakdown", "Start Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {trips.map((t) => {
                const places = Array.isArray(t.places) ? t.places : [];
                return (
                  <tr key={t._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{t.userId?.name || "—"}</div>
                      <div className="text-xs text-slate-400">{t.userId?.email || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      {places.length === 0 ? (
                        <span className="text-slate-400 text-xs italic">No places</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {places.slice(0, 2).map((p: any, i: number) => (
                            <span key={i} className="bg-brand-50 text-brand-600 text-xs px-2 py-0.5 rounded-full">{p?.name || "Unknown"}</span>
                          ))}
                          {places.length > 2 && <span className="text-xs text-slate-400">+{places.length - 2}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{t.days ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">{t.persons ?? "—"}</td>
                    <td className="px-4 py-3">
                      {t.transport ? (
                        <div className="space-y-0.5">
                          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                            {t.transport === "Car" ? "🚗" : t.transport === "Bus" ? "🚌" : "🚂"} {t.transport}
                          </span>
                          {(t.distance || 0) > 0 && <div className="text-xs text-slate-400">{t.distance} km</div>}
                          {t.fromLocation && <div className="text-xs text-slate-500">📌 {t.fromLocation}</div>}
                        </div>
                      ) : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-xs text-slate-600">
                        {(t.placeCost || 0) > 0 && <div>🎟 ₹{t.placeCost?.toLocaleString()}</div>}
                        {(t.transportCost || 0) > 0 && <div>🚌 ₹{t.transportCost?.toLocaleString()}</div>}
                        {(t.foodCost || 0) > 0 && <div>🍽 ₹{t.foodCost?.toLocaleString()}</div>}
                        <div className="font-bold text-slate-800 border-t border-slate-100 pt-1">
                          ₹{t.totalCost?.toLocaleString() || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusColor(t.status || "")}`}>{t.status || "—"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Analytics ───────────────────────────────────────────────
function Analytics({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [placeStats, setPlaceStats] = useState<any[]>([]);
  const [tripStats, setTripStats] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
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

  if (loading) return <p className="text-slate-400">Loading analytics...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-4">Places by Type</h3>
          {placeStats.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No place data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={placeStats} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} paddingAngle={3}
                  label={(props: any) => `${props.type} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                  {placeStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} places`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-4">Trips (Last 7 Days)</h3>
          {tripStats.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No trip data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tripStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(d) => `Date: ${d}`} formatter={(v: any) => [`${v} trips`]} />
                <Bar dataKey="count" name="Trips" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {userStats && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 lg:col-span-2">
            <h3 className="text-base font-semibold text-slate-700 mb-4">User Summary</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Regular Users", value: userStats.totalUsers, color: "bg-emerald-100 text-emerald-800" },
                { label: "Admins", value: userStats.totalAdmins, color: "bg-violet-100 text-violet-800" },
                { label: "Total Accounts", value: userStats.total, color: "bg-brand-100 text-brand-800" },
              ].map((c) => (
                <div key={c.label} className={`${c.color} rounded-2xl px-8 py-5 text-center min-w-[140px]`}>
                  <div className="text-3xl font-extrabold">{c.value}</div>
                  <div className="text-xs font-semibold mt-1 opacity-75">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await API.get("/admin/analytics");
      setAnalytics(res.data);
    } catch {}
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── SIDEBAR ──────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-full bg-brand-900 z-30 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-60" : "w-16"}`}>

        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${!sidebarOpen && "justify-center"}`}>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">🌍</div>
          {sidebarOpen && <span className="font-bold text-white text-lg tracking-tight">Wanderlust</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-white/15 text-white border-r-4 border-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              } ${!sidebarOpen && "justify-center"}`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 transition ${!sidebarOpen && "justify-center"}`}>
            <span className="text-lg flex-shrink-0">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-16"}`}>

        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="text-slate-500 hover:text-brand-600 transition text-xl font-bold"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <h1 className="text-lg font-bold text-slate-700">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label || "Admin Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-semibold">Admin</span>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium">
              Logout
            </button>
          </div>
        </header>

        {/* Section content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
