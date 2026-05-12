import { fileURLToPath } from 'node:url';

const DEFAULT_ARCH_COCKPIT_URL = 'https://arch-mcp-server-production.up.railway.app';

async function requestJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.json();
}

function findScribdSource(analysis) {
  const sources = Array.isArray(analysis?.sources) ? analysis.sources : [];
  return sources.find((source) => source?.id === 'src-scribd') ?? null;
}

function evaluateScribdSource(source) {
  if (!source) {
    return {
      status: 'FAIL',
      reason: 'src-scribd is missing from DataPulse analysis'
    };
  }

  if (source.risk === 'critical') {
    return {
      status: 'BLOCKED_RUNTIME_SOURCE_REFRESH',
      reason: `src-scribd remains critical: health=${source.healthScore}, freshness=${source.freshnessScore}, hours_stale=${source.hoursStale}`
    };
  }

  return {
    status: 'PASS',
    reason: `src-scribd risk=${source.risk}, health=${source.healthScore}, freshness=${source.freshnessScore}`
  };
}

export async function runScribdRefreshAudit({
  baseUrl = process.env.ARCH_COCKPIT_URL ?? DEFAULT_ARCH_COCKPIT_URL,
  log = console.log
} = {}) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const analysis = await requestJson(`${normalizedBaseUrl}/api/data/analysis`);

  const scribd = findScribdSource(analysis);
  const verdict = evaluateScribdSource(scribd);
  const output = {
    generated_at: new Date().toISOString(),
    status: verdict.status,
    reason: verdict.reason,
    source: scribd,
    summary: {
      datapulseCritical: analysis?.summary?.criticalCount,
      datapulseAvgHealth: analysis?.summary?.avgHealth
    },
    next_action: verdict.status === 'PASS'
      ? 'Update the evidence docket with the refresh run and rerun the Architecture Cockpit monitor.'
      : 'Run the real Scribd harvester with operator-approved runtime credentials, or keep the source explicitly blocked.'
  };

  log(JSON.stringify(output, null, 2));
  return output;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const result = await runScribdRefreshAudit();
    if (result.status !== 'PASS') {
      process.exitCode = 2;
    }
  } catch (error) {
    console.error(`[FAIL] ${error.message}`);
    process.exitCode = 1;
  }
}
