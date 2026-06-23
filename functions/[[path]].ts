const APP_ROUTES = new Set([
  "/",
  "/calculadora-custo-carro",
  "/calculadora-morar-sozinho",
  "/calculadora-conta-de-luz",
  "/calculadora-assinaturas",
  "/calculadora-custo-mudanca",
  "/calculadora-custo-pet",
  "/sobre",
  "/metodologia",
  "/privacidade",
  "/termos",
  "/contato",
]);

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const response = await context.next();

  if (
    context.request.method !== "GET" ||
    APP_ROUTES.has(url.pathname) ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes(".")
  ) {
    return response;
  }

  return new Response(response.body, {
    status: 404,
    headers: response.headers,
  });
};
