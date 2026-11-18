import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function AuthPage({ onBack }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || form.password.length < 6) {
      return setError("Valid email aur kam az kam 6 huroof ka password likhein.");
    }
    setLoading(true);
    const { error: authErr } = isSignup
      ? await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name } } })
      : await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (authErr) setError(authErr.message);
    setLoading(false);
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: "#17172b" }}>
      <div className="bg-white rounded-4 p-4 p-md-5 shadow w-100" style={{ maxWidth: 420 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Nexa<span style={{ color: "#6366f1" }}>Flow</span></h4>
          <button className="btn btn-sm btn-light border" onClick={onBack}>← Home</button>
        </div>
        <h5 className="fw-bold mb-3">{isSignup ? "Create Cloud Account" : "Sign In to Workspace"}</h5>
        {error && <div className="alert alert-danger py-2 small">{error}</div>}
        <form onSubmit={handleSubmit}>
          {isSignup && <input className="form-control mb-2" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
          <input type="email" className="form-control mb-2" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" className="form-control mb-3" placeholder="Password (min 6 chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button disabled={loading} className="btn w-100 text-white fw-semibold" style={{ background: "#6366f1" }}>
            {loading ? "Connecting..." : isSignup ? "Sign Up Free" : "Sign In"}
          </button>
        </form>
        <div className="text-center mt-3 small">
          <button className="btn btn-link p-0 small" onClick={() => { setIsSignup(!isSignup); setError(""); }}>
            {isSignup ? "Already have an account? Sign In" : "New user? Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
