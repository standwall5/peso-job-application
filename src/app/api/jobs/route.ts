export async function GET() {
  const res = await fetch("http://localhost:5000/jobs");
  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch jobs" }), {
      status: 500,
    });
  }
  const jobs = await res.json();
  return new Response(JSON.stringify(jobs), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
