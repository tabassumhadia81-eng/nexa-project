import React, { useState } from "react";

export default function AuthPage({ onLoginSuccess, onBack }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      return setError("Please enter your email and password.");
    }
    if (isSignup && !form.name.trim()) {
      return setError("Please enter your full name.");
    }

    const userData = {
      name: isSignup ? form.name : form.email.split("@")[0],
      email: form.email
    };
    localStorage.setItem("nexa_user", JSON.stringify(userData));
    onLoginSuccess(userData);
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: "linear-gradient(135deg, #17172b 0%, #262645 100%)" }}>
      <div className="bg-white rounded-4 p-4 p-md-5 shadow-lg w-100" style={{ maxWidth: 430 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Nexa<span style={{ color: "#6366f1" }}>Flow</span></h4>
          <button className="btn btn-sm btn-light border" onClick={onBack}>← Home</button>
        </div>

        <h5 className="fw-bold mb-1">{isSignup ? "Create Free Account" : "Welcome Back"}</h5>
        <p className="text-muted small mb-4">
          {isSignup ? "Start managing your projects automatically" : "Sign in to access your workspace"}
        </p>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="mb-3">
              <label className="form-label small fw-semibold">Full Name</label>
              <input className="form-control" placeholder="e.g. Hadia Tabassum" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          )}
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email Address</label>
            <input type="email" className="form-control" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn w-100 text-white fw-semibold py-2" style={{ background: "#6366f1", borderRadius: 10 }}>
            {isSignup ? "Create Account & Enter" : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="text-center mt-4 small">
          <span className="text-muted">{isSignup ? "Already have an account?" : "Don't have an account?"}</span>{" "}
          <button className="btn btn-link p-0 small fw-semibold text-decoration-none" onClick={() => { setIsSignup(!isSignup); setError(""); }}>
            {isSignup ? "Sign In" : "Sign Up Free"}
          </button>
        </div>
      </div>
    </div>
  );
}
