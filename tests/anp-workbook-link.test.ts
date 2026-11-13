import { describe, expect, it } from "vitest";
import { findLatestWorkbookHref } from "../src/server/adapters/anp";

/**
 * ANP renamed the weekly workbook from the week of 2026-10-11 on, from
 * `resumo_semanal_lpc_2026-10-04_2026-10-10.xlsx` to
 * `resumo_semanal_lpc_2026_11_01-2026_11_07.xlsx`. The old pattern matched only
 * the first form, so production kept serving the week ending 2026-10-10 into
 * November while ANP had published four newer ones.
 *
 * The links below are copied from the ANP page as it read on 2026-11-13: one in
 * each naming, plus the "revendas" workbook that sits beside every summary.
 */
const BASE =
  "https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/arquivos-lpc";

const NEW_NAMING = `${BASE}/2026/resumo_semanal_lpc_2026_11_01-2026_11_07.xlsx`;
const NEW_NAMING_OLDER_WEEK = `${BASE}/2026/resumo_semanal_lpc_2026_10_25-2026_10_31.xlsx`;
const PREVIOUS_NAMING = `${BASE}/2026/resumo_semanal_lpc_2026-10-04_2026-10-10.xlsx`;
const HYPHEN_NAMING = `${BASE}/2022/resumo-semanal-lpc-2022-08-07-2022-08-13.xlsx`;
const RETAILERS = `${BASE}/2026/revendas_lpc_2026_11_01-2026_11_07.xlsx`;

function page(...hrefs: string[]): string {
  return hrefs.map((href) => `<a href="${href}">Preços médios semanais</a>`).join("\n");
}

describe("findLatestWorkbookHref", () => {
  it("picks the newest week when the page mixes the new and the previous naming", () => {
    expect(
      findLatestWorkbookHref(
        page(PREVIOUS_NAMING, NEW_NAMING_OLDER_WEEK, NEW_NAMING, HYPHEN_NAMING),
      ),
    ).toBe(NEW_NAMING);
  });

  it("still reads a page that only links the previous naming", () => {
    expect(findLatestWorkbookHref(page(HYPHEN_NAMING, PREVIOUS_NAMING))).toBe(PREVIOUS_NAMING);
  });

  it("never picks the per-retailer workbook", () => {
    expect(findLatestWorkbookHref(page(RETAILERS))).toBeUndefined();
  });
});
