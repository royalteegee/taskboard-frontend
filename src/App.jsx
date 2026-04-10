import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

const PRIORITIES = ["high", "medium", "low"];
const CATEGORIES = ["setup", "config", "devops", "general"];

const PRIORITY_COLOR = {
  high: "#f85149",
  medium: "#d29922",
  low: "#3fb950",
};

const CATEGORY_BADGE = {
  setup: { bg: "#1d2d3e", color: "#58a6ff" },
  config: { bg: "#2d1f3d", color: "#bc8cff" },
  devops: { bg: "#1a2f23", color: "#3fb950" },
  general: { bg: "#2a2118", color: "#d29922" },
};

function StatCard({ label, value, accent }) {
  return (
    <div style={s.statCard}>
      <span style={{ ...s.statValue, color: accent }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(task.id);
  };

  const badge = CATEGORY_BADGE[task.category] || CATEGORY_BADGE.general;

  return (
    <div style={{ ...s.taskRow, opacity: deleting ? 0.4 : 1, transition: "opacity 0.2s" }}>
      <button
        onClick={() => onToggle(task)}
        style={{ ...s.checkbox, borderColor: task.done ? "#3fb950" : "#30363d", background: task.done ? "#3fb950" : "transparent" }}
        title={task.done ? "Mark pending" : "Mark done"}
      >
        {task.done && <span style={{ color: "#080c10", fontSize: 13, fontWeight: 700 }}>✓</span>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ ...s.taskTitle, textDecoration: task.done ? "line-through" : "none", color: task.done ? "#7d8590" : "#e6edf3" }}>
          {task.title}
        </span>
      </div>

      <span style={{ ...s.badge, background: badge.bg, color: badge.color }}>{task.category}</span>

      <span style={{ ...s.dot, background: PRIORITY_COLOR[task.priority] }} title={task.priority + " priority"} />

      <button onClick={handleDelete} style={s.deleteBtn} title="Delete task">✕</button>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newCategory, setNewCategory] = useState("general");
  const [adding, setAdding] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [taskRes, statsRes, healthRes] = await Promise.all([
        fetch(`${API}/api/tasks`),
        fetch(`${API}/api/stats`),
        fetch(`${API}/api/health`),
      ]);
      if (!taskRes.ok) throw new Error("Backend returned an error");
      setTasks(await taskRes.json());
      setStats(await statsRes.json());
      setHealth(await healthRes.json());
    } catch (e) {
      setError("Cannot reach backend. Is it running on " + API + "?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, priority: newPriority, category: newCategory }),
      });
      const task = await res.json();
      setTasks((prev) => [...prev, task]);
      setNewTitle("");
      fetchAll();
    } catch {
      setError("Failed to add task");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (task) => {
    try {
      const res = await fetch(`${API}/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
      });
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      fetchAll();
    } catch {
      setError("Failed to update task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      fetchAll();
    } catch {
      setError("Failed to delete task");
    }
  };

  const visible = tasks.filter((t) => {
    const statusOk = filter === "all" || (filter === "done" ? t.done : !t.done);
    const catOk = categoryFilter === "all" || t.category === categoryFilter;
    return statusOk && catOk;
  });

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerTop}>
          <div>
            <div style={s.logo}>
              <span style={s.logoIcon}>⬡</span>
              <span>DevOps Taskboard</span>
            </div>
            <p style={s.subtitle}>Full-stack · React + Express · REST API</p>
          </div>
          <div style={s.healthPill}>
            <span style={{ ...s.healthDot, background: health ? "#3fb950" : error ? "#f85149" : "#d29922" }} />
            <span style={s.healthText}>
              {health ? `Backend ↑ ${health.uptime}` : error ? "Backend unreachable" : "Connecting..."}
            </span>
          </div>
        </div>

        {stats && (
          <div style={s.statsRow}>
            <StatCard label="Total" value={stats.total} accent="#58a6ff" />
            <StatCard label="Done" value={stats.done} accent="#3fb950" />
            <StatCard label="Pending" value={stats.pending} accent="#d29922" />
            <StatCard label="High priority" value={stats.byPriority.high} accent="#f85149" />
          </div>
        )}
      </header>

      <main style={s.main}>
        {error && (
          <div style={s.errorBanner}>
            <span style={{ fontSize: 16 }}>⚠</span>
            <span>{error}</span>
            <button onClick={fetchAll} style={s.retryBtn}>Retry</button>
          </div>
        )}

        <form onSubmit={handleAdd} style={s.form}>
          <input
            style={s.input}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a new task..."
            disabled={adding}
          />
          <select style={s.select} value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select style={s.select} value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" style={s.addBtn} disabled={adding || !newTitle.trim()}>
            {adding ? "Adding..." : "+ Add"}
          </button>
        </form>

        <div style={s.filters}>
          {["all", "pending", "done"].map((f) => (
            <button key={f} style={{ ...s.filterBtn, ...(filter === f ? s.filterBtnActive : {}) }} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <div style={{ width: 1, background: "#21262d", alignSelf: "stretch" }} />
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} style={{ ...s.filterBtn, ...(categoryFilter === c ? s.filterBtnActive : {}) }} onClick={() => setCategoryFilter(c)}>
              {c}
            </button>
          ))}
        </div>

        <div style={s.taskList}>
          {loading ? (
            <p style={s.emptyMsg}>Loading tasks from API...</p>
          ) : visible.length === 0 ? (
            <p style={s.emptyMsg}>No tasks match this filter.</p>
          ) : (
            visible.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} />
            ))
          )}
        </div>

        <div style={s.apiLog}>
          <span style={s.apiLogLabel}>API endpoint</span>
          <code style={s.apiUrl}>{API}/api/tasks</code>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", flexDirection: "column" },
  header: { borderBottom: "1px solid #21262d", padding: "1.5rem 2rem", background: "#0d1117" },
  headerTop: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" },
  logo: { display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 800, color: "#e6edf3", letterSpacing: "-0.5px" },
  logoIcon: { color: "#58a6ff", fontSize: 20 },
  subtitle: { marginTop: 4, fontSize: 12, color: "#7d8590", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.03em" },
  healthPill: { display: "flex", alignItems: "center", gap: 7, background: "#161b22", border: "1px solid #21262d", borderRadius: 20, padding: "6px 14px" },
  healthDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  healthText: { fontSize: 12, color: "#7d8590", fontFamily: "'JetBrains Mono', monospace" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 },
  statCard: { background: "#161b22", border: "1px solid #21262d", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 },
  statValue: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 11, color: "#7d8590", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace" },
  main: { flex: 1, padding: "1.5rem 2rem", maxWidth: 860, width: "100%", margin: "0 auto" },
  errorBanner: { display: "flex", alignItems: "center", gap: 10, background: "#2d1f1f", border: "1px solid #6e2a2a", borderRadius: 8, padding: "12px 16px", marginBottom: "1.25rem", color: "#f85149", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" },
  retryBtn: { marginLeft: "auto", background: "transparent", border: "1px solid #f85149", color: "#f85149", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer" },
  form: { display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" },
  input: { flex: 1, minWidth: 200, background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "10px 14px", color: "#e6edf3", fontSize: 14, outline: "none" },
  select: { background: "#161b22", border: "1px solid #30363d", borderRadius: 8, padding: "10px 12px", color: "#e6edf3", fontSize: 13, outline: "none" },
  addBtn: { background: "#1f6feb", border: "none", borderRadius: 8, padding: "10px 18px", color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "'Syne', sans-serif", transition: "opacity 0.15s" },
  filters: { display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" },
  filterBtn: { background: "transparent", border: "1px solid #21262d", borderRadius: 6, padding: "5px 12px", color: "#7d8590", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s" },
  filterBtnActive: { background: "#161b22", border: "1px solid #58a6ff", color: "#58a6ff" },
  taskList: { display: "flex", flexDirection: "column", gap: 6 },
  taskRow: { display: "flex", alignItems: "center", gap: 12, background: "#0d1117", border: "1px solid #21262d", borderRadius: 10, padding: "12px 16px", transition: "border-color 0.15s" },
  checkbox: { width: 22, height: 22, borderRadius: 6, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s", background: "transparent" },
  taskTitle: { fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" },
  badge: { flexShrink: 0, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", padding: "3px 8px", borderRadius: 5, fontWeight: 500 },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
  deleteBtn: { background: "transparent", border: "none", color: "#7d8590", fontSize: 14, padding: "2px 6px", borderRadius: 4, transition: "color 0.15s", flexShrink: 0 },
  emptyMsg: { color: "#7d8590", fontSize: 14, fontFamily: "'JetBrains Mono', monospace", padding: "2rem", textAlign: "center" },
  apiLog: { marginTop: "1.5rem", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0d1117", border: "1px solid #21262d", borderRadius: 8 },
  apiLogLabel: { fontSize: 11, color: "#7d8590", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0 },
  apiUrl: { fontSize: 12, color: "#58a6ff", fontFamily: "'JetBrains Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};