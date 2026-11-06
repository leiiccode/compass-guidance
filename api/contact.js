const ALLOWED_CATEGORIES = new Set([
  "Counseling & Therapy",
  "Marital & Family Therapy",
  "Trauma Support",
  "Stress Relief & Acupuncture",
  "Other",
]);

function respond(res, status, body) {
  res.status(status).json(body);
}

function field(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().length <= maxLength ? value.trim() : null;
}

module.exports = async function contactHandler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return respond(res, 405, { error: "Method not allowed." });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return respond(res, 403, { error: "Request origin is not allowed." });
  }
  if (
    !host ||
    !["http:", "https:"].includes(parsedOrigin.protocol) ||
    parsedOrigin.host.toLowerCase() !== host.toLowerCase()
  ) {
    return respond(res, 403, { error: "Request origin is not allowed." });
  }

  if (!req.headers["content-type"]?.startsWith("application/json")) {
    return respond(res, 415, { error: "JSON requests are required." });
  }
  const contentLength = Number(req.headers["content-length"]);
  if (Number.isFinite(contentLength) && contentLength > 8192) {
    return respond(res, 413, { error: "Message is too large." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return respond(res, 400, { error: "Invalid request body." });
    }
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return respond(res, 400, { error: "Invalid request body." });
  }
  if (typeof body.company === "string" && body.company.trim()) {
    return respond(res, 400, { error: "Invalid form submission." });
  }

  const name = field(body.name, 100);
  const email = field(body.email, 254);
  const category = field(body.category, 100);
  const message = field(body.message, 2000);
  if (
    !name ||
    !email ||
    !category ||
    !message ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !ALLOWED_CATEGORIES.has(category)
  ) {
    return respond(res, 400, { error: "Please check your form and try again." });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("WEB3FORMS_ACCESS_KEY is not configured.");
    return respond(res, 503, { error: "The message service is not configured." });
  }

  let upstream;
  try {
    upstream = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: parsedOrigin.origin,
        Referer: `${parsedOrigin.origin}/`,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        access_key: accessKey,
        name,
        email,
        category,
        message,
        subject: "New COMPASS contact form message",
        from_name: "COMPASS Online Clinic",
      }),
    });
  } catch (error) {
    console.error("Unable to reach Web3Forms:", error);
    return respond(res, 502, { error: "Message delivery failed. Please try again." });
  }

  const contentType = upstream.headers.get("content-type") || "unknown";
  let responseBody;
  try {
    responseBody = await upstream.text();
  } catch (error) {
    console.error("Unable to read Web3Forms response:", error, {
      status: upstream.status,
      contentType,
    });
    return respond(res, 502, { error: "Message delivery failed. Please try again." });
  }
  let result;
  try {
    result = JSON.parse(responseBody);
  } catch (error) {
    console.error("Web3Forms returned a non-JSON response.", {
      status: upstream.status,
      contentType,
    });
    return respond(res, 502, { error: "Message delivery failed. Please try again." });
  }
  if (!upstream.ok || !result || typeof result !== "object" || !result.success) {
    console.error("Web3Forms rejected a contact form submission.", {
      status: upstream.status,
      contentType,
    });
    return respond(res, 502, { error: "Message delivery failed. Please try again." });
  }

  return respond(res, 200, { success: true });
};
