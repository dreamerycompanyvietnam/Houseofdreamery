const RECIPIENT = "dreamerycompanyvietnam@gmail.com";
const ALLOWED_SERVICES= new Set([
  "Premium Haircut", "Skin Fade / Undercut", "Korean Side Part Styling",
  "Classic Gentleman Cuts", "Traditional Razor Shave", "Hair Wash & Scalp Care",
  "Hair Styling", "Beard Grooming", "Student Haircut", "Fast Haircut",
  "Beard Trim", "Tẩy tóc", "Uốn tóc", "Nhuộm Highlight", "Colors",
  "Classic Hair Curl", "Premium Curl", "Ruffled Hair", "Dreadlock"
]);
const recentRequests = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
function sendJson(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}
function allowRequest(ip) {
  const now = Date.now();
  const history = (recentRequests.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (history.length >= MAX_REQUESTS) return false;
  history.push(now);
  recentRequests.set(ip, history);
  return true;
}
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { ok: false });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  if (clean(body.company_website, 200)) return sendJson(res, 200, { ok: true });
  const name = clean(body.customer_name, 100);
  const phone = clean(body.phone, 24);
  const email = clean(body.email, 254);
  const service = clean(body.service, 100);
  const date = clean(body.date, 10);
  const time = clean(body.time, 5);
  const barber = clean(body.barber, 80);
  const notes = clean(body.notes, 1000) || "Không có";
  const phonePattern = /^[0-9+\-\s()]{8,16}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (
    name.length < 2 || !phonePattern.test(phone) ||
    (email && email !== "Không cung cấp" && !emailPattern.test(email)) ||
    !ALLOWED_SERVICES.has(service) || !validDate(date) ||
    !/^\d{2}:\d{2}$/.test(time) || time < "08:30" || time > "19:00" ||
    !barber || !process.env.RESEND_API_KEY
  ) return sendJson(res, 400, { ok: false });
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = (typeof forwardedFor === "string" ? forwardedFor.split(",")[0] : "unknown").trim();
  if (!allowRequest(ip)) return sendJson(res, 429, { ok: false });
  const safe = (value) => value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const from = process.env.RESEND_FROM || "House of Dreamery <onboarding@resend.dev>";
  const html = [
    "<h2>Yêu cầu đặt lịch mới — House of Dreamery</h2>",
    "<p><strong>Họ tên:</strong> " + safe(name) + "</p>",
    "<p><strong>Số điện thoại:</strong> " + safe(phone) + "</p>",
    "<p><strong>Email:</strong> " + safe(email || "Không cung cấp") + "</p>",
    "<p><strong>Dịch vụ:</strong> " + safe(service) + "</p>",
    "<p><strong>Ngày:</strong> " + safe(date) + "</p>",
    "<p><strong>Giờ:</strong> " + safe(time) + "</p>",
    "<p><strong>Barber:</strong> " + safe(barber) + "</p>",
    "<p><strong>Ghi chú:</strong> " + safe(notes) + "</p>"
  ].join("");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [RECIPIENT],
        subject: "Đặt lịch mới: " + name + " — " + date + " " + time,
        html
      })
    });
    if (!response.ok) return sendJson(res, 502, { ok: false });
    return sendJson(res, 200, { ok: true });
  } catch {
    return sendJson(res, 502, { ok: false });
  }
};
