interface RefreshResult {
  source: string;
  ok: boolean;
  message: string;
}

async function refreshPublicData(): Promise<RefreshResult[]> {
  return [
    { source: "ANP", ok: true, message: "Adaptador sob demanda habilitado nas Pages Functions." },
    { source: "ANEEL", ok: true, message: "Adaptador sob demanda habilitado nas Pages Functions." },
    { source: "Inmetro", ok: false, message: "Adaptador ainda não habilitado." },
    { source: "IBGE", ok: true, message: "Fallback local de UFs disponível." },
  ];
}

export default {
  async scheduled(_controller: ScheduledController, _env: unknown, ctx: ExecutionContext) {
    ctx.waitUntil(
      refreshPublicData().then((results) => {
        console.log(JSON.stringify({ event: "public_data_refresh", results }));
      }),
    );
  },
} satisfies ExportedHandler;
