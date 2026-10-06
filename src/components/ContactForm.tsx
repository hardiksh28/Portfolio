import { useState, type FormEvent } from "react";
import posthog from "posthog-js";

type Status = "idle" | "submitting" | "success" | "error";

/** Same API contract as before: POST /api/contact, PostHog event on success. */
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        console.error("Server responded with error:", await res.text());
        throw new Error(`Server error: ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Submission failed");
      posthog.capture("contact_form_submitted", { subject: form.subject, email: form.email });
      setStatus("success");
      setMsg(data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Form submission error:", err);
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Unable to send. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="form-done">
        <p className="form-done-kicker">That's a wrap.</p>
        <p className="form-done-msg">{msg}</p>
        <button type="button" className="btn btn--ghost" onClick={() => setStatus("idle")}>
          Send another take
        </button>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-row">
        <label className="field">
          <span>Your name</span>
          <input required type="text" autoComplete="name" value={form.name} onChange={set("name")} />
        </label>
        <label className="field">
          <span>Email</span>
          <input required type="email" autoComplete="email" value={form.email} onChange={set("email")} />
        </label>
      </div>
      <label className="field">
        <span>Subject</span>
        <input required type="text" value={form.subject} onChange={set("subject")} />
      </label>
      <label className="field">
        <span>The pitch</span>
        <textarea required rows={4} value={form.message} onChange={set("message")} />
      </label>
      {status === "error" && <p className="form-error">{msg}</p>}
      <button type="submit" className="btn btn--primary" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending…" : "Send the script →"}
      </button>
    </form>
  );
}
