export const initialProjects = [
  { id: 1, name: "E-Commerce Website", client: "Alpha Solutions", status: "In Progress", progress: 75, budget: 1200, deadline: "2026-12-05", priority: "High" },
  { id: 2, name: "Portfolio Website", client: "John Smith", status: "Completed", progress: 100, budget: 650, deadline: "2026-11-20", priority: "Medium" },
  { id: 3, name: "Mobile App Design", client: "Tech Vision", status: "In Progress", progress: 45, budget: 1800, deadline: "2026-12-15", priority: "High" },
  { id: 4, name: "Business Dashboard", client: "Digital Hub", status: "Pending", progress: 10, budget: 950, deadline: "2026-12-25", priority: "Low" }
];

export const initialClients = [
  { id: 1, name: "Alpha Solutions", email: "alpha@example.com", company: "Alpha Group" },
  { id: 2, name: "John Smith", email: "john@example.com", company: "JS Studio" },
  { id: 3, name: "Tech Vision", email: "tech@example.com", company: "Tech Vision Ltd" },
  { id: 4, name: "Digital Hub", email: "digital@example.com", company: "Digital Hub" }
];

export const initialTasks = [
  { id: 1, title: "Design homepage", project: "E-Commerce Website", done: true, priority: "High" },
  { id: 2, title: "Create login page", project: "E-Commerce Website", done: false, priority: "High" },
  { id: 3, title: "Prepare website content", project: "Portfolio Website", done: true, priority: "Medium" },
  { id: 4, title: "Review mobile layout", project: "Mobile App Design", done: false, priority: "Low" }
];

export const money = (val) => "$" + Number(val || 0).toLocaleString("en-US");

export function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function exportToCSV(projects) {
  const headers = ["Project Name,Client,Status,Progress (%),Budget ($),Deadline,Priority"];
  const rows = projects.map(p => `"${p.name}","${p.client}","${p.status}",${p.progress},${p.budget},"${p.deadline}","${p.priority}"`);
  const blob = new Blob([headers.concat(rows).join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nexaflow-projects-report.csv";
  a.click();
}
