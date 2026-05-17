#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const jsonOutput = process.argv.includes('--json');
const requiredAliases = ['/wonder', '@wonder'];
const requiredProviders = ['claude', 'gemini', 'deepseek', 'qwen'];
const requiredProviderFiles = ['CLAUDE.md', 'GEMINI.md', 'DEEPSEEK.md', 'QWEN.md'];
const findings = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function ok(condition, code) {
  if (!condition) findings.push(code);
}

let cfg = null;
try {
  cfg = JSON.parse(read('config/wonder_gateway.json'));
} catch (err) {
  findings.push(`config_parse_failed:${err.message}`);
}

const agents = fs.existsSync(path.join(root, 'AGENTS.md')) ? read('AGENTS.md') : '';
ok(agents.includes('Wonder Gateway Activation Contract'), 'agents_missing_wonder_contract');
ok(agents.includes('WIDGETDC_BEARER_TOKEN'), 'agents_missing_bearer_env_name');

if (cfg) {
  ok(cfg.schema_version === '2026-05-17.v1', 'schema_version_mismatch');
  ok(cfg.agent_builder_profile_ref?.endsWith('config/agentbuilder/wonder-agent-profile.json'), 'missing_agent_builder_profile_ref');
  for (const alias of requiredAliases) ok(cfg.invocation?.aliases?.includes(alias), `missing_alias:${alias}`);
  ok(cfg.mcp?.bearer_env === 'WIDGETDC_BEARER_TOKEN', 'missing_widgetdc_bearer_env');
  ok(cfg.a2a?.required_skill === 'wonder-gateway', 'missing_wonder_gateway_a2a_skill');
  const providerIds = new Set((cfg.providers ?? []).map((p) => p.id));
  for (const provider of requiredProviders) ok(providerIds.has(provider), `missing_provider:${provider}`);
  ok(cfg.governance?.default_risk === 'read_only', 'default_risk_not_read_only');
}

for (const rel of requiredProviderFiles) {
  if (!fs.existsSync(path.join(root, rel))) {
    findings.push(`missing_provider_file:${rel}`);
    continue;
  }
  const content = read(rel);
  ok(content.includes('Wonder Gateway Invocation'), `provider_file_missing_invocation:${rel}`);
}

const payload = {
  repo: cfg?.repo_id ?? path.basename(root),
  status: findings.length === 0 ? 'PASS' : 'FAIL',
  aliases: cfg?.invocation?.aliases ?? [],
  providers: (cfg?.providers ?? []).map((p) => p.id),
  mcp_bearer_env: cfg?.mcp?.bearer_env ?? null,
  a2a_required_skill: cfg?.a2a?.required_skill ?? null,
  findings,
};

if (jsonOutput) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(`Wonder gateway verify: ${payload.repo} ${payload.status}`);
  if (findings.length) for (const finding of findings) console.log(`- ${finding}`);
}
process.exit(findings.length === 0 ? 0 : 1);
