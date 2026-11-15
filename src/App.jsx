import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { initialProjects, initialClients, initialTasks, money, readStorage, exportToCSV } from "./data";
import AuthPage from "./AuthPage";

export default function App() {
  const [user, setUser] = useState(() => readStorage("nexa_user", null));
  const [view, setView] = useState(() => (readStorage("nexa_user", null) ? "dashboard" : "landing"));
  const [darkMode, setDarkMode] = useState(false);

  const [projects, setProjects] = useState(() => readStorage("nexa_projects", initialProjects));
  const [clients, setClients] = useState(() => readStorage("nexa_clients", initialClients));
  const [tasks, setTasks] = useState(() => readStorage("nexa_tasks", initialTasks));
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [projectForm, setProjectForm] = useState({ name: "", client: "", status: "Pending", progress: 0, budget: "", deadline: "", priority: "Medium" });
  const [clientForm, setClientForm] = useState({ name: "", email: "", company: "" });
  const [taskForm, setTaskForm] = useState({ title: "", project: "", priority: "Medium" });

  useEffect(() => { localStorage.setItem("nexa_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("nexa_clients", JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem("nexa_tasks", JSON.stringify(tasks)); }, [tasks]);

  // Auto-calculate project progress when tasks toggle
  function toggleTask(id) {
    const updatedTasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(updatedTasks);

    const target = updatedTasks.find(t => t.id === id);
    if (target?.project) {
      const projTasks = updatedTasks.filter(t => t.project.toLowerCase() === target.project.toLowerCase());
      if (projTasks.length > 0) {
        const autoProgress = Math.round((projTasks.filter(t => t.done).length / projTasks.length) * 100);
        setProjects(prev => prev.map(p =>
          p.name.toLowerCase() === target.project.toLowerCase()
            ? { ...p, progress: autoProgress, status: autoProgress === 100 ? "Completed" : autoProgress > 0 ? "In Progress" : "Pending" }
            : p
        ));
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem("nexa_user");
    setUser(null);
    setView("landing");
  }

  function saveProject(e) {
    e.preventDefault();
    if (!projectForm.name.trim() || !projectForm.client.trim()) return alert("Enter project & client name.");
    const progress = Math.min(100, Math.max(0, Number(projectForm.progress) || 0));
    const status = progress === 100 ? "Completed" : projectForm.status;
    if (editingId) {
      setProjects(prev => prev.map(p => (p.id === editingId ? { ...p, ...projectForm, progress, status, budget: Number(projectForm.budget) || 0 } : p)));
    } else {
      setProjects(prev => [...prev, { ...projectForm, id: Date.now(), progress, status, budget: Number(projectForm.budget) || 0 }]);
    }
    setShowModal(false);
  }

  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budget || 0), 0);
  const completedCount = projects.filter(p => p.status === "Completed").length;
  const pendingTasks = tasks.filter(t => !t.done).length;
  const filteredProjects = projects.filter(p => [p.name, p.client, p.status].join(" ").toLowerCase().includes(search.toLowerCase()));

  if (view === "auth") {
    return <AuthPage onLoginSuccess={(u) => { setUser(u); setView("dashboard"); }} onBack={() => setView("landing")} />;
  }

  if (view === "landing") {
    return (
      <div className="min-vh-100 bg-light">
        <nav className="navbar bg-white border-bottom py-3 px-4">
          <div className="container d-flex justify-content-between align-items-center">
            <span className="fs-4 fw-bold">Nexa<span style={{ color: "#6366f1" }}>Flow</span></span>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-dark" onClick={() => setView("auth")}>Sign In</button>
              <button className="btn text-white fw-semibold" style={{ background: "#6366f1" }} onClick={() => setView(user ? "dashboard" : "auth")}>
                {user ? "Go to Dashboard" : "Get Started Free"}
              </button>
            </div>
          </div>
        </nav>

        <div className="text-center text-white py-5 px-3" style={{ background: "linear-gradient(135deg, #17172b 0%, #262645 100%)" }}>
          <div className="container py-5" style={{ maxWidth: 720 }}>
            <span className="badge bg-primary bg-opacity-25 text-info px-3 py-2 rounded-pill mb-3">Automated Agency & Freelancer Suite</span>
            <h1 className="display-4 fw-bold mb-3">Manage Projects, Clients & Tasks Automatically</h1>
            <p className="lead text-white-50 mb-4">Auto-tracking project progress, instant CSV reports, client directory, and deadline calendar in one workspace.</p>
            <button className="btn btn-lg text-white fw-semibold px-4" style={{ background: "#6366f1" }} onClick={() => setView(user ? "dashboard" : "auth")}>
              Launch Live Workspace →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 d-flex ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`}>
      {/* Sidebar */}
      <aside className="p-3 text-white d-flex flex-column justify-content-between" style={{ width: 250, background: "#17172b" }}>
        <div>
          <div className="fs-4 fw-bold px-2 mb-4">Nexa<span style={{ color: "#a78bfa" }}>Flow</span></div>
          {["Dashboard", "Projects", "Clients", "Tasks", "Calendar", "Analytics", "Settings"].map(item => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`btn w-100 text-start mb-1 fw-medium ${activePage === item ? "text-white" : "text-white-50"}`}
              style={{ background: activePage === item ? "#6366f1" : "transparent", borderRadius: 10 }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="border-top border-secondary pt-3">
          <div className="small text-white-50 px-2 mb-2">Signed in as <strong className="text-white">{user?.name || "User"}</strong></div>
          <button className="btn btn-sm btn-outline-info w-100 mb-2" onClick={() => setView("landing")}>Public Website</button>
          <button className="btn btn-sm btn-outline-danger w-100" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h4 className="fw-bold mb-0">{activePage}</h4>
          <div className="d-flex gap-2">
            <input className="form-control form-control-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="btn btn-sm btn-outline-secondary" onClick={() => exportToCSV(projects)}>Export CSV</button>
            <button className="btn btn-sm text-white fw-semibold" style={{ background: "#6366f1" }} onClick={() => { setEditingId(null); setProjectForm({ name: "", client: "", status: "Pending", progress: 0, budget: "", deadline: "", priority: "Medium" }); setShowModal(true); }}>
              + New Project
            </button>
          </div>
        </div>

        {(activePage === "Dashboard" || activePage === "Projects") && (
          <>
            {activePage === "Dashboard" && (
              <div className="row g-3 mb-4">
                <div className="col-md-3"><div className={`p-3 rounded-4 border ${darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-white"}`}><small className="opacity-75">Total Budget</small><h4 className="fw-bold mb-0">{money(totalBudget)}</h4></div></div>
                <div className="col-md-3"><div className={`p-3 rounded-4 border ${darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-white"}`}><small className="opacity-75">Total Projects</small><h4 className="fw-bold mb-0">{projects.length}</h4></div></div>
                <div className="col-md-3"><div className={`p-3 rounded-4 border ${darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-white"}`}><small className="opacity-75">Completed</small><h4 className="fw-bold mb-0">{completedCount}</h4></div></div>
                <div className="col-md-3"><div className={`p-3 rounded-4 border ${darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-white"}`}><small className="opacity-75">Pending Tasks</small><h4 className="fw-bold mb-0">{pendingTasks}</h4></div></div>
              </div>
            )}

            <div className={`p-3 rounded-4 border table-responsive ${darkMode ? "bg-secondary bg-opacity-10 border-secondary" : "bg-white"}`}>
              <table className={`table align-middle mb-0 ${darkMode ? "table-dark" : ""}`}>
                <thead><tr><th>Project</th><th>Client</th><th>Auto Progress</th><th>Status</th><th>Budget</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProjects.map(p => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.name}</td>
                      <td>{p.client}</td>
                      <td style={{ minWidth: 140 }}>
                        <div className="progress" style={{ height: 7 }}><div className="progress-bar bg-primary" style={{ width: `${p.progress}%` }}></div></div>
                        <small>{p.progress}%</small>
                      </td>
                      <td><span className="badge bg-primary-subtle text-primary">{p.status}</span></td>
                      <td><span className="badge bg-primary-subtle text-primary">{p.status}</span></td>
                      <td className="fw-semibold">{money(p.budget)}</td>
                      <td>
                        <button className="btn btn-sm btn-light border me-1" onClick={() => { setEditingId(p.id); setProjectForm(p); setShowModal(true); }}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setProjects(prev => prev.filter(x => x.id !== p.id))}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "Clients" && (
          <div className="row g-3">
            <div className="col-md-4">
              <form className="p-3 rounded-4 border bg-white text-dark" onSubmit={e => { e.preventDefault(); if (!clientForm.name) return; setClients([...clients, { ...clientForm, id: Date.now() }]); setClientForm({ name: "", email: "", company: "" }); }}>
                <h6 className="fw-bold mb-3">Add Client</h6>
                <input className="form-control mb-2" placeholder="Name" value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} />
                <input className="form-control mb-2" placeholder="Email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} />
                <input className="form-control mb-3" placeholder="Company" value={clientForm.company} onChange={e => setClientForm({ ...clientForm, company: e.target.value })} />
                <button className="btn text-white w-100" style={{ background: "#6366f1" }}>Add Client</button>
              </form>
            </div>
            <div className="col-md-8 row g-2">
              {clients.map(c => (
                <div className="col-md-6" key={c.id}>
                  <div className="p-3 rounded-4 border bg-white text-dark d-flex justify-content-between">
                    <div><h6 className="fw-bold mb-0">{c.name}</h6><small className="text-muted d-block">{c.company}</small><small className="text-primary">{c.email}</small></div>
                    <button className="btn btn-sm btn-outline-danger h-50" onClick={() => setClients(clients.filter(x => x.id !== c.id))}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === "Tasks" && (
          <div className="row g-3">
            <div className="col-md-4">
              <form className="p-3 rounded-4 border bg-white text-dark" onSubmit={e => { e.preventDefault(); if (!taskForm.title) return; setTasks([...tasks, { ...taskForm, id: Date.now(), done: false }]); setTaskForm({ title: "", project: "", priority: "Medium" }); }}>
                <h6 className="fw-bold mb-3">Add Task (Auto-Updates Project %)</h6>
                <input className="form-control mb-2" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                <select className="form-select mb-2" value={taskForm.project} onChange={e => setTaskForm({ ...taskForm, project: e.target.value })}>
                  <option value="">Select Project (Optional)</option>
                  {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
                <button className="btn text-white w-100" style={{ background: "#6366f1" }}>Add Task</button>
              </form>
            </div>
            <div className="col-md-8">
              <div className="p-3 rounded-4 border bg-white text-dark">
                {tasks.map(t => (
                  <div key={t.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <input type="checkbox" className="form-check-input me-2" checked={t.done} onChange={() => toggleTask(t.id)} />
                      <span className={t.done ? "text-decoration-line-through text-muted" : "fw-medium"}>{t.title}</span>
                      {t.project && <span className="badge bg-light text-dark border ms-2">{t.project}</span>}
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setTasks(tasks.filter(x => x.id !== t.id))}>Del</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activePage === "Calendar" && (
          <div className="row g-3">
            {projects.map(p => (
              <div className="col-md-4" key={p.id}>
                <div className="p-3 rounded-4 border bg-white text-dark">
                  <span className="badge bg-primary-subtle text-primary mb-2">Due: {p.deadline || "No Date"}</span>
                  <h6 className="fw-bold mb-1">{p.name}</h6>
                  <small className="text-muted">Client: {p.client}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        {activePage === "Analytics" && (
          <div className="p-4 rounded-4 border bg-white text-dark">
            <h6 className="fw-bold mb-3">Project Completion & Budget Breakdown</h6>
            {projects.map(p => (
              <div className="mb-3" key={p.id}>
                <div className="d-flex justify-content-between small fw-semibold mb-1"><span>{p.name}</span><span>{p.progress}% ({money(p.budget)})</span></div>
                <div className="progress" style={{ height: 10 }}><div className="progress-bar" style={{ width: `${p.progress}%`, background: "#6366f1" }}></div></div>
              </div>
            ))}
          </div>
        )}

        {activePage === "Settings" && (
          <div className="p-4 rounded-4 border bg-white text-dark" style={{ maxWidth: 480 }}>
            <h6 className="fw-bold mb-3">Workspace Appearance & Data</h6>
            <button className="btn btn-dark me-2" onClick={() => setDarkMode(!darkMode)}>Toggle {darkMode ? "Light" : "Dark"} Mode</button>
            <button className="btn btn-outline-danger" onClick={() => { setProjects(initialProjects); setClients(initialClients); setTasks(initialTasks); }}>Reset Demo Data</button>
          </div>
        )}
      </main>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: "rgba(0,0,0,0.5)", zIndex: 2000 }}>
          <div className="bg-white text-dark rounded-4 p-4 w-100" style={{ maxWidth: 450 }}>
            <h5 className="fw-bold mb-3">{editingId ? "Edit Project" : "New Project"}</h5>
            <form onSubmit={saveProject}>
              <input className="form-control mb-2" placeholder="Project Name" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} />
              <input className="form-control mb-2" placeholder="Client Name" value={projectForm.client} onChange={e => setProjectForm({ ...projectForm, client: e.target.value })} />
              <input type="number" className="form-control mb-2" placeholder="Budget ($)" value={projectForm.budget} onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })} />
              <input type="date" className="form-control mb-2" value={projectForm.deadline} onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })} />
              <input type="number" min="0" max="100" className="form-control mb-3" placeholder="Progress %" value={projectForm.progress} onChange={e => setProjectForm({ ...projectForm, progress: e.target.value })} />
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn text-white" style={{ background: "#6366f1" }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
