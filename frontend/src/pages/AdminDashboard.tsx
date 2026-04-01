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

// ─── Constants ───────────────────────────────────────────────
const PLACE_TYPES = ["Beach", "Hill", "City", "Forest", "Heritage", "Other"];
const PIE_COLORS = ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#6b7280"];
const NAV_ITEMS = [
  { id: "overview",  label: "Overview",       icon: "📊" },
  { id: "addPlace",  label: "Add Place",       icon: "➕" },
  { id: "places",    label: "Manage Places",   icon: "🗺️" },
  { id: "users",     label: "Users",           icon: "👥" },
  { id: "trips",     label: "Trips",           icon: "✈️" },
  { id: "analytics", label: "Analytics",       icon: "📈" },
];

// ─── Shared helpers ───────────────────────────────────────────
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

// Toast
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium text-sm animate-bounce ${type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
      {type === "success" ? "✅ " : "❌ "}{msg}
    </div>
  );
}

// ─── SECTION: Overview ────────────────────────────────────────
function Overview({ analytics }: { analytics: any }) {
  if (!analytics) return <p className="text-gray-400">Loading...</p>;
  const cards = [
    { label: "Total Users", value: analytics.totalUsers, icon: "👥", color: "from-violet-500 to-purple-600" },
    { label: "Total Trips", value: analytics.totalTrips, icon: "✈️", color: "from-cyan-500 to-blue-600" },
    { label: "Total Places", value: analytics.totalPlaces, icon: "🗺️", color: "from-emerald-500 to-green-600" },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-6 shadow-lg`}>
            <div className="text-4xl mb-2">{c.icon}</div>
            <div className="text-3xl font-bold">{c.value ?? "—"}</div>
            <div className="text-white/80 text-sm mt-1">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SECTION: Add Place ───────────────────────────────────────
function AddPlace({ onSuccess, showToast }: { onSuccess: () => void; showToast: (m: string, t?: "success" | "error") => void }) {
  const empty = { name: "", image: "", description: "", price: "", location: "", type: "Other", rating: "", state: "", district: "", entryFee: "", transportCost: "", latitude: "", longitude: "" };
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
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, field, type = "text", placeholder = "" }: any) => (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} placeholder={placeholder} value={(form as any)[field]}
        onChange={e => set(field, e.target.value)} className={inputCls} />
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Place</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Place Name *" field="name" placeholder="e.g. Mysore Palace" />
          <Field label="Location" field="location" placeholder="e.g. Mysore, Karnataka" />
          <div className="sm:col-span-2">
            <label className={labelCls}>Image URL</label>
            <input type="url" placeholder="https://..." value={form.image} onChange={e => set("image", e.target.value)} className={inputCls} />
          </div>
          {form.image && (
            <div className="sm:col-span-2">
              <img src={form.image} alt="preview" className="w-full h-40 object-cover rounded-xl" onError={e => (e.currentTarget.style.display = "none")} />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea rows={3} placeholder="Brief description..." value={form.description}
              onChange={e => set("description", e.target.value)}
              className={inputCls + " resize-none"} />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
              {PLACE_TYPES.map(t => <option key={t}>{t}</option>)}
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
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
          {loading ? "Adding..." : "Add Place"}
        </button>
      </div>
    </div>
  );
}

// ─── SECTION: Manage Places ───────────────────────────────────
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

  if (loading) return <p className="text-gray-400">Loading places...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Places <span className="text-base font-normal text-gray-400">({places.length})</span></h2>
      {places.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No places added yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {places.map(p => (
                editId === p._id ? (
                  /* Inline edit row */
                  <tr key={p._id} className="bg-indigo-50">
                    <td className="px-4 py-2" colSpan={7}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {(["name","location","type","price","rating","entryFee","transportCost","image","description"] as const).map(field => (
                          <div key={field}>
                            <label className="text-xs text-gray-500 capitalize">{field}</label>
                            {field === "type" ? (
                              <select value={(editForm as any)[field] || ""} onChange={e => setEditForm(f => ({...f, [field]: e.target.value}))} className={inputCls}>
                                {PLACE_TYPES.map(t => <option key={t}>{t}</option>)}
                              </select>
                            ) : (
                              <input value={(editForm as any)[field] || ""} onChange={e => setEditForm(f => ({...f, [field]: e.target.value}))} className={inputCls} />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-600">Save</button>
                        <button onClick={cancelEdit} className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-300">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {p.image ? <img src={p.image} alt={p.name} className="w-12 h-10 object-cover rounded-lg" onError={e => (e.currentTarget.style.display="none")} /> : <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">🗺️</div>}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3"><span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{p.type}</span></td>
                    <td className="px-4 py-3 text-gray-500">{p.location || `${p.district}, ${p.state}`}</td>
                    <td className="px-4 py-3">₹{p.price || p.entryFee || "—"}</td>
                    <td className="px-4 py-3 text-yellow-500">{"★".repeat(Math.round(p.rating || 0))}<span className="text-gray-400 text-xs ml-1">{p.rating || 0}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-200">Edit</button>
                        <button onClick={() => handleDelete(p._id)} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── SECTION: Users ───────────────────────────────────────────
function Users({ showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/users")
      .then(r => setUsers(r.data))
      .catch(() => showToast("Error loading users", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Loading users...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Users <span className="text-base font-normal text-gray-400">({users.length})</span></h2>
      <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((u, i) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {u.name?.[0]?.toUpperCase() || "?"}
                  </span>
                  {u.name}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── SECTION: Trips ───────────────────────────────────────────
function Trips({ showToast: _showToast }: { showToast: (m: string, t?: "success" | "error") => void }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/trips")
      .then(r => setTrips(r.data))
      .catch(() => setError("Failed to load trips. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => {
    if (s === "upcoming") return "bg-blue-100 text-blue-700";
    if (s === "ongoing") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Trips</h2>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">All Trips</h2>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600 text-center">
        {error}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        All Trips <span className="text-base font-normal text-gray-400">({trips.length})</span>
      </h2>

      {trips.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">✈️</p>
          <p className="font-medium">No trips booked yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Places</th>
                <th className="px-4 py-3 text-left">Days</th>
                <th className="px-4 py-3 text-left">Persons</th>
                <th className="px-4 py-3 text-left">Transport</th>
                <th className="px-4 py-3 text-left">Cost Breakdown</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {trips.map(t => {
                // ✅ Guard against null/undefined places (old documents)
                const places = Array.isArray(t.places) ? t.places : [];
                return (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.userId?.name || "—"}</div>
                      <div className="text-xs text-gray-400">{t.userId?.email || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      {places.length === 0 ? (
                        <span className="text-gray-400 text-xs italic">No places</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {places.slice(0, 2).map((p: any, i: number) => (
                            <span key={i} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">
                              {p?.name || "Unknown"}
                            </span>
                          ))}
                          {places.length > 2 && (
                            <span className="text-xs text-gray-400">+{places.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{t.days ?? "—"}</td>
                    <td className="px-4 py-3">{t.persons ?? "—"}</td>
                    <td className="px-4 py-3">
                      {t.transport ? (
                        <div className="space-y-0.5">
                          <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                            {t.transport === "Car" ? "🚗" : t.transport === "Bus" ? "🚌" : "🚂"} {t.transport}
                          </span>
                          {(t.distance || 0) > 0 && (
                            <div className="text-xs text-gray-400">{t.distance} km</div>
                          )}
                          {t.fromLocation && (
                            <div className="text-xs text-gray-500">📌 {t.fromLocation}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 text-xs text-gray-600">
                        {(t.placeCost || 0) > 0 && <div>🎟 Places: <b>₹{t.placeCost?.toLocaleString()}</b></div>}
                        {(t.transportCost || 0) > 0 && <div>🚌 Transport: <b>₹{t.transportCost?.toLocaleString()}</b></div>}
                        {(t.foodCost || 0) > 0 && <div>🍽 Food: <b>₹{t.foodCost?.toLocaleString()}</b></div>}
                        <div className="font-bold text-gray-800 border-t pt-1">
                          Total: ₹{t.totalCost?.toLocaleString() || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(t.status || "")}`}>
                        {t.status || "—"}
                      </span>
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

// ─── SECTION: Analytics ───────────────────────────────────────
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
      .then(([p, t, u]) => {
        setPlaceStats(p.data);
        setTripStats(t.data);
        setUserStats(u.data);
      })
      .catch(() => showToast("Error loading analytics", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Loading analytics...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart — Places by Type */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Places by Type</h3>
          {placeStats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No place data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={placeStats} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} paddingAngle={3} label={(props: any) => `${props.type} ${((props.percent ?? 0) * 100).toFixed(0)}%`}>
                  {placeStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} places`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart — Trips per Day */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Trips (Last 7 Days)</h3>
          {tripStats.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No trip data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={tripStats} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={d => `Date: ${d}`} formatter={(v: any) => [`${v} trips`]} />
                <Bar dataKey="count" name="Trips" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User Summary */}
        {userStats && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-700 mb-4">User Summary</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Regular Users", value: userStats.totalUsers, color: "bg-green-100 text-green-700" },
                { label: "Admins", value: userStats.totalAdmins, color: "bg-purple-100 text-purple-700" },
                { label: "Total Accounts", value: userStats.total, color: "bg-indigo-100 text-indigo-700" },
              ].map(c => (
                <div key={c.label} className={`${c.color} rounded-xl px-6 py-4 text-center min-w-[120px]`}>
                  <div className="text-2xl font-bold">{c.value}</div>
                  <div className="text-xs font-medium mt-1">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
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
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    // Guard: redirect if not admin
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
    <div className="flex min-h-screen bg-gray-50 font-sans">

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* ── SIDEBAR ────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-full bg-gradient-to-b from-indigo-900 to-indigo-800 text-white z-30 transition-all duration-300 flex flex-col ${sidebarOpen ? "w-60" : "w-16"}`}>

        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-indigo-700/50">
          <span className="text-2xl">🌍</span>
          {sidebarOpen && <span className="font-bold text-lg tracking-wide">Wanderlust</span>}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                activeSection === item.id
                  ? "bg-white/20 text-white border-r-4 border-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-indigo-700/50">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition">
            <span className="text-lg flex-shrink-0">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-60" : "ml-16"}`}>

        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(s => !s)}
              className="text-gray-500 hover:text-indigo-600 transition text-xl">
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <h1 className="text-lg font-semibold text-gray-700">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label || "Admin Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">Admin</span>
            <button onClick={handleLogout}
              className="text-xs text-red-500 hover:underline">
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
