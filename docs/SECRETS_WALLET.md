# WidgeTDC Secrets Wallet

Status: operator runbook  
Scope: env-name-only secret rotation and destination checks  
Claim impact: no claim promotion

## Model

Use 1Password as the human-friendly wallet and keep provider dashboards as the revocation authority.

- `WidgeTDC-Recovery`: recovery material and admin/break-glass credentials.
- `WidgeTDC-Prod-Secrets`: production runtime provider keys.
- `WidgeTDC-CI-Secrets`: GitHub Actions, deployment, and smoke-test credentials.
- `WidgeTDC-Dev-Secrets`: local and non-production credentials.

The committed manifest is `config/secrets.manifest.json`. It contains only env names, destination metadata, rotation cadence, and verification expectations. It must never contain secret values.

## Rotation Loop

1. Create or rotate the new key in the provider dashboard or provider API.
2. Update the 1Password item.
3. Update runtime destinations by env name only.
4. Run the relevant metadata checks:

   ```powershell
   ./scripts/secrets-wallet.ps1 -Mode Check -CheckLocalEnv -CheckGitHub
   ```

5. Run the service smoke or runtime readback required by the manifest.
6. Revoke/delete the old provider key.
7. Record provider metadata only in Linear: provider, project/target, key id or last4 if available, actor, timestamp, and verification run id.

## Boundaries

- Do not paste raw keys in prompts, PRs, commits, Linear comments, terminal output, or graph evidence.
- GitHub secret metadata and Railway env-name readback prove destination configuration only; they do not prove provider-side revocation.
- Runtime smoke can prove service operation after rotation, but old-key revocation still needs provider-dashboard or provider-admin evidence.
- Claim levels do not change from this wallet workflow.

## LIN-1391 Specific

`LIN-1391` is blocked until `${OPENAI_ADMIN_KEY}` is available to an authorized operator or provider-dashboard evidence proves deletion/revocation of the old OpenAI project key. The expected official evidence shape is metadata only:

- OpenAI project target.
- Old key id or non-secret identifier.
- Deletion/revocation response metadata such as `deleted: true`.
- Timestamp and actor.

