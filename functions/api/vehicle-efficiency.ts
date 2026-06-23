import { unavailable, json } from "../_shared/responses";
import { readText } from "../_shared/validation";

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const brand = readText(url, "brand");
  const model = readText(url, "model");

  if (!brand || !model) {
    return json(
      { available: false, error: "Informe marca e modelo." },
      { status: 400, cacheControl: "no-store" },
    );
  }

  return unavailable(
    "Inmetro/PBE Veicular",
    `Ainda não há eficiência normalizada para ${brand} ${model}. Informe o consumo manualmente.`,
  );
};
