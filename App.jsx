import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { money, exportToCSV } from "./data";
import { supabase } from "./supabaseClient";
import AuthPage from "./AuthPage";

export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState("landing");
  const [darkMode, setDarkMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [projectForm, setProjectForm] = useState({ name: "", client: "", status: "Pending", progress: 0, budget: "", deadline: "", priority: "Medium" });
  const [clientForm, setClientForm] = useState({ name: "", email: "", company: "" });
  const [taskForm, setTaskForm] = useState({ title: "", project: "", priority: "Medium" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { setView("dashboard"); loadCloudData(); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { setView("dashboard"); loadCloudData(); }
      else setView("landing");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadCloudData() {
    const [p, c, t] = await Promise.all([
      supabase.from("projects").select("*").order("id", { ascending: false }),
      supabase.from("clients").select("*").order("id", { ascending: false }),
      supabase.from("tasks").select("*").order("id", { ascending: false })
    ]);
    if (p.data) setProjects(p.data);
    if (c.data) setClients(c.data);
    if (t.data) setTasks(t.data);
  }

  async function saveProject(e) {
    e.preventDefault();
    if (!projectForm.name.trim() || !projectForm.client.trim()) return alert("Enter project & client name.");
    const progress = Math.min(100, Math.max(0, Number(projectForm.progress) || 0));
    const status = progress === 100 ? "Completed" : projectForm.status;
    const payload = { ...projectForm, progress, status, budget: Number(projectForm.budget) || 0, user_id: session.user.id };

    if (editingId) {
      await supabase.from("projects").update(payload).eq("id", editingId);
    } else {
      await supabase.from("projects").insert([payload]);
    }
    setShowModal(false);
    loadCloudData();
  }

  async function toggleTask(task) {
    await supabase.from("tasks").update({ done: !task.done }).eq("id", task.id);
    loadCloudData();
  }

  if (view === "auth" && !session) return <AuthPage onBack={() => setView("landing")} />;

  if (view === "landing") {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar bg-white border-bottom py-3 px-4">
          <div className="container d-flex justify-content-between">
            <span className="fs-4 fw-bold">Nexa<span style={{ color: "#6366f1" }}>Flow</span></span>
            <button className="btn text-white fw-semibold" style={{ background: "#6366f1" }} onClick={() => setView(session ? "dashboard" : "auth")}>
              {session ? "Open Cloud Workspace" : "Sign In / Sign Up"}
            </button>
          </div>
        </nav>
        <div className="text-center text-white py-5 px-3" style={{ background: "linear-gradient(135deg, #17172b 0%, #262645 100%)" }}>
          <div className="container py-5" style={{ maxWidth: 700 }}>
            <span className="badge bg-primary bg-opacity-25 text-info px-3 py-2 rounded-pill mb-3">Full-Stack Cloud Workspace</span>
            <h1 className="display-4 fw-bold mb-3">Manage Projects, Clients & Tasks in the Cloud</h1>
            <p className="lead text-white-50 mb-4">Real-time PostgreSQL database sync, secure user authentication, and instant CSV exports.</p>
            <button className="btn btn-lg text-white fw-semibold px-4" style={{ background: "#6366f1" }} onClick={() => setView(session ? "dashboard" : "auth")}>
              Launch Full-Stack App →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
  const completedCount = projects.filter(p => p.status === "Completed").length;
  const filteredProjects = projects.filter(p => [p.name, p.client, p.status].join(" ").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`min-vh-100 d-flex ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      <aside className="p-3 text-white d-flex flex-column justify-content-between" style={{ width: 245, background: "#17172b" }}>
        <div>
          <div className="fs-4 fw-bold px-2 mb-4">Nexa<span style={{ color: "#a78bfa" }}>Flow</span></div>
          {["Dashboard", "Projects", "Clients", "Tasks", "Calendar", "Analytics", "Settings"].map(item => (
            <button key={item} onClick={() => setActivePage(item)} className={`btn w-100 text-start mb-1 ${activePage === item ? "text-white fw-semibold" : "text-white-50"}`} style={{ background: activePage === item ? "#6366f1" : "transparent" }}>
              {item}
            </button>
          ))}
        </div>
        <div className="border-top border-secondary pt-3">
          <div className="small text-white-50 px-2 mb-2 text-truncate">{session?.user?.email}</div>
          <button className="btn btn-sm btn-outline-danger w-100" onClick={() => supabase.auth.signOut()}>Logout</button>
        </div>
      </aside>

      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h4 className="fw-bold mb-0">{activePage}</h4>
          <div className="d-flex gap-2">
            <input className="form-control form-control-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-sm btn-outline-secondary" onClick={() => exportToCSV(projects)}>Export CSV</button>
            <button className="btn btn-sm text-white fw-semibold" style={{ background: "#6366f1" }} onClick={() => { setEditingId(null); setProjectForm({ name: "", client: "", status: "Pending", progress: 0, budget: "", deadline: "", priority: "Medium" }); setShowModal(true); }}>+ New Project</button>
          </div>
        </div>

        {(activePage === "Dashboard" || activePage === "Projects") && (
          <>
            {activePage === "Dashboard" && (
              <div className="row g-3 mb-4">
                <div className="col-md-4"><div className="p-3 rounded-4 border bg-white text-dark"><small className="text-muted">Cloud Total Budget</small><h4 className="fw-bold mb-0">{money(totalBudget)}</h4></div></div>
                <div className="col-md-4"><div className="p-3 rounded-4 border bg-white text-dark"><small className="text-muted">Active Projects</small><h4 className="fw-bold mb-0">{projects.length}</h4></div></div>
                <div className="col-md-4"><div className="p-3 rounded-4 border bg-white text-dark"><small className="text-muted">Completed</small><h4 className="fw-bold mb-0">{completedCount}</h4></div></div>
              </div>
            )}
            <div className="p-3 rounded-4 border bg-white text-dark table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Project</th><th>Client</th><th>Progress</th><th>Status</th><th>Budget</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProjects.map(p => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.name}</td><td>{p.client}</td>
                      <td style={{ minWidth: 120 }}><div className="progress" style={{ height: 6 }}><div className="progress-bar bg-primary" style={{ width: `${p.progress}%` }}></div></div></td>
                      <td><span className="badge bg-primary-subtle text-primary">{p.status}</span></td><td>{money(p.budget)}</td>
                      <td>
                        <button className="btn btn-sm btn-light border me-1" onClick={() => { setEditingId(p.id); setProjectForm(p); setShowModal(true); }}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={async () => { await supabase.from("projects").delete().eq("id", p.id); loadCloudData(); }}>Del</button>
                      </td>
                    </tr>
                  ))}
                  {filteredProjects.length === 0 && <tr><td colSpan="6" className="text-center text-muted py-4">No projects yet. Click "+ New Project" to save to cloud!</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "Clients" && (
          <div className="row g-3">
            <div className="col-md-4">
              <form className="p-3 rounded-4 border bg-white text-dark" onSubmit={async e => { e.preventDefault(); if (!clientForm.name) return; await supabase.from("clients").insert([{ ...clientForm, user_id: session.user.id }]); setClientForm({ name: "", email: "", company: "" }); loadCloudData(); }}>
                <h6 className="fw-bold mb-3">Add Cloud Client</h6>
                <input className="form-control mb-2" placeholder="Name" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} />
                <input className="form-control mb-2" placeholder="Email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} />
                <input className="form-control mb-3" placeholder="Company" value={clientForm.company} onChange={e => setClientForm({ ...clientForm, company: e.target.value })} />
                <button className="btn text-white w-100" style={{ background: "#6366f1" }}>Save to Cloud</button>
              </form>
            </div>
            <div className="col-md-8 row g-2">
              {clients.map(c => (
                <div className="col-md-6" key={c.id}>
                  <div className="p-3 rounded-4 border bg-white text-dark d-flex justify-content-between">
                    <div><h6 className="fw-bold mb-0">{c.name}</h6><small className="text-muted d-block">{c.company}</small><small className="text-primary">{c.email}</small></div>
                    <button className="btn btn-sm btn-outline-danger h-50" onClick={async () => { await supabase.from("clients").delete().eq("id", c.id); loadCloudData(); }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === "Tasks" && (
          <div className="row g-3">
            <div className="col-md-4">
              <form className="p-3 rounded-4 border bg-white text-dark" onSubmit={async e => { e.preventDefault(); if (!taskForm.title) return; await supabase.from("tasks").insert([{ ...taskForm, done: false, user_id: session.user.id }]); setTaskForm({ title: "", project: "", priority: "Medium" }); loadCloudData(); }}>
                <h6 className="fw-bold mb-3">Add Cloud Task</h6>
                <input className="form-control mb-2" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                <input className="form-control mb-3" placeholder="Project name" value={taskForm.project} onChange={e => setTaskForm({ ...taskForm, project: e.target.value })} />
                <button className="btn text-white w-100" style={{ background: "#6366f1" }}>Save Task</button>
              </form>
            </div>
            <div className="col-md-8">
              <div className="p-3 rounded-4 border bg-white text-dark">
                {tasks.map(t => (
                  <div key={t.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div><input type="checkbox" className="form-check-input me-2" checked={t.done} onChange={() => toggleTask(t)} /><span className={t.done ? "text-decoration-line-through text-muted" : ""}>{t.title}</span></div>
                    <button className="btn btn-sm btn-outline-danger" onClick={async () => { await supabase.from("tasks").delete().eq("id", t.id); loadCloudData(); }}>Del</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activePage === "Calendar" || activePage === "Analytics") && (
          <div className="p-4 rounded-4 border bg-white text-dark">
            <h6 className="fw-bold mb-3">{activePage} Overview</h6>
            {projects.map(p => (
              <div className="mb-3" key={p.id}>
                <div className="d-flex justify-content-between small fw-semibold mb-1"><span>{p.name} (Due: {p.deadline || "N/A"})</span><span>{p.progress}% — {money(p.budget)}</span></div>
                <div className="progress" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${p.progress}%`, background: "#6366f1" }}></div></div>
              </div>
            ))}
          </div>
        )}

        {activePage === "Settings" && (
          <div className="p-4 rounded-4 border bg-white text-dark" style={{ maxWidth: 420 }}>
            <h6 className="fw-bold mb-3">Theme Settings</h6>
            <button className="btn btn-dark" onClick={() => setDarkMode(!darkMode)}>Toggle {darkMode ? "Light" : "Dark"} Mode</button>
          </div>
        )}
      </main>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: "rgba(0,0,0,0.5)", zIndex: 2000 }}>
          <div className="bg-white text-dark rounded-4 p-4 w-100" style={{ maxWidth: 440 }}>
            <h5 className="fw-bold mb-3">{editingId ? "Edit Project" : "New Cloud Project"}</h5>
            <form onSubmit={saveProject}>
              <input className="form-control mb-2" placeholder="Project Name" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
              <input className="form-control mb-2" placeholder="Client Name" value={projectForm.client} onChange={e => setProjectForm({ ...projectForm, client: e.target.value })} />
              <input type="number" className="form-control mb-2" placeholder="Budget ($)" value={projectForm.budget} onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })} />
              <input type="date" className="form-control mb-2" value={projectForm.deadline} onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })} />
              <input type="number" min="0" max="100" className="form-control mb-3" placeholder="Progress %" value={projectForm.progress} onChange={e => setProjectForm({ ...projectForm, progress: e.target.value })} />
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn text-white" style={{ background: "#6366f1" }}>Save to Cloud</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
