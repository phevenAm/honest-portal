import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  //! todo, validate matching passwords if account already exists, etc. right now it just errors with "User already registered" even if the only issue is mismatched passwords. Not ideal UX. Would be better to validate client-side first and only call signUp if basic validation passes, then handle any server errors separately.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, { firstName, lastName });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 13px",
    border: "1.5px solid var(--border)",
    borderRadius: 12,
    background: "var(--bg-muted)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    position: "relative",
  };

  if (done)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 500,
              marginBottom: 10,
            }}
          >
            Check your email
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            We've sent a confirmation link to <strong>{email}</strong>. Click it
            to activate your account, then come back to sign in.
          </p>
          <Link
            to="/login"
            style={{ color: "var(--accent)", fontWeight: 500, fontSize: 14 }}
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-8%",
          right: "-6%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--lavender-light), transparent 70%)",
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-6%",
          left: "-4%",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--sage-light), transparent 70%)",
          opacity: 0.8,
        }}
      />

      <div style={{ width: "100%", maxWidth: 380, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--sage-light), var(--lavender-light))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 14px",
            }}
          >
            🌿
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              fontWeight: 500,
              margin: "0 0 5px",
            }}
          >
            MindfulSpace
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Create your account
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 24,
            padding: 32,
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 18,
              fontWeight: 500,
              margin: "0 0 22px",
            }}
          >
            Get started
          </h2>

          {error && (
            <div
              role="alert"
              style={{
                background: "var(--blush-light)",
                color: "var(--danger)",
                border: "1px solid var(--blush)",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {[
              {
                id: "firstName",
                label: "First name",
                type: "text",
                val: firstName,
                set: setFirstName,
                ph: "",
              },
              {
                id: "lastName",
                label: "Last name",
                type: "text",
                val: lastName,
                set: setLastName,
                ph: "",
              },
              {
                id: "email",
                label: "Email address",
                type: "email",
                val: email,
                set: setEmail,
                ph: "you@example.com",
              },{
                id: "dob",
                label: "Date of birth",
                type: "date",
                val: dob,
                set: setDob,
                ph: "YYYY-MM-DD",
              },
              {
                id: "password",
                label: "Password",
                type: "password",
                val: password,
                set: setPassword,
                ph: "••••••••",
              },
              {
                id: "confirm",
                label: "Confirm password",
                type: "password",
                val: confirm,
                set: setConfirm,
                ph: "••••••••",
              },
            ].map((f) => {

				function getMinAgeDate(age = 15) {
  const today = new Date();
  const date = new Date(today.getFullYear() - age, today.getMonth(), today.getDate());
  return date.toISOString().split('T')[0];
}

				return      <div key={f.id} style={{ marginBottom: 16 }}>
                <label
                  htmlFor={f.id}
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 500,
                    marginBottom: 5,
                    color: "var(--text-secondary)",
                  }}
                >
                  {f.label}
                </label>
                <input
                  id={f.id}
                  type={f.type}
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
				  {...f.type === 'date' && { max: getMinAgeDate(11) }} // ENFORCED SERVER SIDE TOO.
                  required
                  autoComplete={
                    f.id === "email"
                      ? "email"
                      : f.id === "password"
                        ? "new-password"
                        : "new-password"
                  }
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--border-focus)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
			})}

            <button
              type="submit"
              disabled={loading || !email || !password || !confirm}
              style={{
                width: "100%",
                padding: "11px",
                marginTop: 8,
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 500,
                cursor:
                  loading || !email || !password || !confirm
                    ? "not-allowed"
                    : "pointer",
                opacity: loading || !email || !password || !confirm ? 0.6 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: 20,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent)", fontWeight: 500 }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
