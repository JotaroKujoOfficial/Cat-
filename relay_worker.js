// Кики: личный ретранслятор ИИ-запросов для Cloudflare Workers.
// Пропускает только адреса известных ИИ-сервисов. Ключ и вопросы идут напрямую к сервису.
const ALLOWED = [
  "api.anthropic.com", "api.openai.com", "api.deepseek.com",
  "generativelanguage.googleapis.com", "api.groq.com", "openrouter.ai",
  "api.x.ai", "api.mistral.ai", "api.together.xyz", "api.perplexity.ai",
  "api.moonshot.ai", "dashscope-intl.aliyuncs.com"
];

export default {
  async fetch(request) {
    const u = new URL(request.url);
    let target = decodeURIComponent(u.pathname.slice(1)) + u.search;
    target = target.replace(/^(https?):\/(?!\/)/, (m, a) => a + "://");
    let t;
    try { t = new URL(target); } catch (e) { return new Response("Неверный адрес", { status: 400 }); }
    if (t.protocol !== "https:" || ALLOWED.indexOf(t.hostname) < 0) {
      return new Response("Этот сервис не разрешён", { status: 403 });
    }
    const headers = new Headers(request.headers);
    headers.delete("host");
    const init = { method: request.method, headers: headers };
    if (request.method !== "GET" && request.method !== "HEAD") init.body = request.body;
    const resp = await fetch(t.toString(), init);
    return new Response(resp.body, { status: resp.status, headers: resp.headers });
  }
};
