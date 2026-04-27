// ============================================================
// ADMIN DASHBOARD — overview stats and quick links
// ============================================================

import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllUsers, fetchAllUsers } from "../../store/slices/userDirectorySlice";
import { selectAllQuestionnaires } from "../../store/slices/questionnairesSlice";
import { selectAllResources } from "../../store/slices/resourcesSlice";
import Card from "../../components/shared/Card";
import Avatar from "../../components/shared/Avatar";
import Button from "../../components/shared/Button";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { AppDispatch } from "../../store/index";


function MetricCard({ label, value, icon, color, to }) {
  const content = (
    <Card style={{ padding: "22px" }}>
      <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: `var(--${color}-light)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>
        {icon}
      </div>
      <p style={{ fontSize: "1.9rem", fontFamily: "var(--font-serif)", fontWeight: 500, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{label}</p>
    </Card>
  );
  return to ? <Link to={to} style={{ textDecoration: "none", display: "block" }}>{content}</Link> : content;
}

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const allClients = useSelector(selectAllUsers);
  const questionnaires = useSelector(selectAllQuestionnaires);
  const resources = useSelector(selectAllResources);

  useEffect(() => {
    dispatch(fetchAllUsers()).unwrap().catch((err) => {
      console.error("Failed to fetch users:", err);
    });
  }, [dispatch]);

  const publishedResources = resources.filter((r) => r.isPublished).length;
  const activeQs = questionnaires.filter((q) => q.isActive).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "1.9rem", fontWeight: 500, marginBottom: 6 }}>
            Welcome back, {userProfile?.first_name} 👋
          </h1>
          <p style={{ color: "var(--text-muted)" }}>Here's a summary of your practice portal</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
          <MetricCard label="Active clients"      value={allClients.length}     icon="👥" color="sage"     to="/admin/clients" />
          <MetricCard label="Questionnaires"      value={questionnaires.length} icon="📋" color="lavender" to="/admin/questionnaires" />
          <MetricCard label="Active check-ins"    value={activeQs}              icon="✅" color="sky"      to="/admin/questionnaires" />
          <MetricCard label="Published resources" value={publishedResources}    icon="📚" color="peach"    to="/admin/resources" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <Card style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: "1rem" }}>Your clients</h3>
              <Link to="/admin/clients" style={{ textDecoration: "none" }}>
                <Button variant="ghost" size="sm">Manage →</Button>
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {allClients.slice(0, 4).map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--r-md)", background: "var(--bg-muted)" }}>
                  <Avatar initials={u.avatar} color={u.color} size={36} />
                  <div>
                    <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>{u.first_name} {u.last_name}</p>
                    <small style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Joined {u.joinedAt}</small>
                  </div>
                </div>
              ))}
              {allClients.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No clients yet. Add one to get started.</p>}
            </div>
          </Card>

          <Card style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: 20 }}>Quick actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { to: "/admin/questionnaires", label: "＋  New questionnaire", color: "lavender" },
                { to: "/admin/resources",      label: "＋  Write an article",  color: "sage" },
                { to: "/admin/clients",        label: "＋  Add a client",      color: "blush" },
              ].map((action) => (
                <Link key={action.to} to={action.to} style={{ textDecoration: "none" }}>
                  <div style={{ padding: "13px 16px", background: `var(--${action.color}-light)`, borderRadius: "var(--r-md)", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer" }}>
                    {action.label}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}