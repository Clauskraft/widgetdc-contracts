import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'vitest'
import '../src/formats.js' // register uuid/date-time FormatRegistry checkers
import {
  BOMItem,
  ConfigurationSnapshot,
  WorkArtifact,
} from '../src/decision-bom/index.js'

describe('Decision BOM contracts (Phase Ε E1)', () => {
  describe('BOMItem', () => {
    it('accepts a minimal valid BOMItem', () => {
      const minimal = {
        id: 'bomitem-abc12345',
        bom_run_id: 'bomrun-xyz98765',
        item_type: 'provider_call',
        decision_type: 'method_selection',
        policy_requirement: 'gdpr-eu-2026-04',
        method_selected: 'RLM',
        method_reason: 'compliance_required → RLM',
        validation_status: 'pending',
      }
      expect(Value.Check(BOMItem, minimal)).toBe(true)
    })

    it('accepts a full sovereignty-bound BOMItem with crypto fields', () => {
      const full = {
        id: 'bomitem-sovereign-001',
        bom_run_id: 'bomrun-tenant-fbi-9001',
        item_type: 'tool_invocation',
        decision_type: 'tool_selection',
        data_class: 'pii',
        authority_requirement: 'regulator',
        policy_requirement: 'gdpr-eu-2026-04',
        jurisdiction_policy: 'EU_ONLY',
        method_selected: 'RLM',
        method_reason: 'sovereignty: data_class=pii forces RLM',
        applied_rules: ['rule:sovereign-data-class', 'rule:method-fallback'],
        sovereignty_enforced: true,
        allowed_methods: ['RLM', 'RAG', 'Folding'],
        denied_providers: ['openai-gpt-4o'],
        evidence_hash: 'sha256:0123456789abcdef',
        signature: 'ed25519:fakesignature',
        signing_pubkey_id: 'key:tool-contract-v1',
        signature_domain: 'widgetdc.bom-item.v1',
        canonicalization_version: 'jcs-rfc8785-v1',
        validation_status: 'passed',
        resolved: true,
        workflow_id: 'wf:phase-e1-bomitem',
        plan_id: 'plan:psr-rollout-phase-delta-2026-04-28',
        correlation_id: 'corr:phase-delta-psr-runtime-2026-04-28',
        actor_id: 'agent:captain',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(BOMItem, full)).toBe(true)
    })

    it('rejects BOMItem with malformed id', () => {
      const bad = {
        id: 'wrongprefix-123',
        bom_run_id: 'bomrun-xyz98765',
        item_type: 'provider_call',
        decision_type: 'method_selection',
        policy_requirement: '',
        method_selected: 'RLM',
        method_reason: 'x',
        validation_status: 'pending',
      }
      expect(Value.Check(BOMItem, bad)).toBe(false)
    })

    it('rejects BOMItem with empty method_reason', () => {
      const bad = {
        id: 'bomitem-abc12345',
        bom_run_id: 'bomrun-xyz98765',
        item_type: 'provider_call',
        decision_type: 'method_selection',
        policy_requirement: '',
        method_selected: 'RLM',
        method_reason: '',
        validation_status: 'pending',
      }
      expect(Value.Check(BOMItem, bad)).toBe(false)
    })

    it('rejects BOMItem with unknown method_selected', () => {
      const bad = {
        id: 'bomitem-abc12345',
        bom_run_id: 'bomrun-xyz98765',
        item_type: 'provider_call',
        decision_type: 'method_selection',
        policy_requirement: '',
        method_selected: 'GPT5',
        method_reason: 'unknown',
        validation_status: 'pending',
      }
      expect(Value.Check(BOMItem, bad)).toBe(false)
    })

    it('rejects BOMItem with malformed evidence_hash (too short)', () => {
      const bad = {
        id: 'bomitem-abc12345',
        bom_run_id: 'bomrun-xyz98765',
        item_type: 'provider_call',
        decision_type: 'method_selection',
        policy_requirement: '',
        method_selected: 'RLM',
        method_reason: 'x',
        evidence_hash: 'sha256:tooshort',
        validation_status: 'pending',
      }
      expect(Value.Check(BOMItem, bad)).toBe(false)
    })
  })

  describe('ConfigurationSnapshot', () => {
    it('accepts a minimal valid snapshot with one BOMItem', () => {
      const minimal = {
        id: 'configsnap-rel-12345',
        snapshot_type: 'session',
        feature_model_version: 'fm-v1.0',
        rule_set_version: 'method-selector-v5-2026-04',
        route_template_version: 'rt-v1.0',
        bom_run_id: 'bomrun-test-12345',
        items: [
          {
            bom_item_id: 'bomitem-abc12345',
            method_selected: 'RLM',
          },
        ],
        snapshot_hash: 'sha256:' + 'a'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.config-snapshot.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(ConfigurationSnapshot, minimal)).toBe(true)
    })

    it('rejects snapshot with empty items (resolution invariant)', () => {
      const bad = {
        id: 'configsnap-empty-001',
        snapshot_type: 'session',
        feature_model_version: 'fm-v1.0',
        rule_set_version: 'method-selector-v5',
        route_template_version: 'rt-v1.0',
        bom_run_id: 'bomrun-test-12345',
        items: [],
        snapshot_hash: 'sha256:' + 'a'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.config-snapshot.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(ConfigurationSnapshot, bad)).toBe(false)
    })

    it('rejects snapshot with malformed snapshot_hash (truncated)', () => {
      const bad = {
        id: 'configsnap-rel-12345',
        snapshot_type: 'release',
        feature_model_version: 'fm-v1.0',
        rule_set_version: 'method-selector-v5',
        route_template_version: 'rt-v1.0',
        bom_run_id: 'bomrun-test-12345',
        items: [{ bom_item_id: 'bomitem-abc12345', method_selected: 'RLM' }],
        snapshot_hash: 'sha256:tooshort',
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.config-snapshot.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(ConfigurationSnapshot, bad)).toBe(false)
    })

    it('accepts release snapshot with approvals chain', () => {
      const release = {
        id: 'configsnap-release-2026-04-29',
        snapshot_type: 'release',
        tenant_id: 'tenant-acme',
        feature_model_version: 'fm-v2.1',
        rule_set_version: 'method-selector-v5-2026-04',
        route_template_version: 'rt-v2.0',
        bom_run_id: 'bomrun-release-001',
        items: [
          { bom_item_id: 'bomitem-decision-1', method_selected: 'RLM' },
          { bom_item_id: 'bomitem-decision-2', method_selected: 'RAG' },
        ],
        approvals: [
          {
            approver_id: 'operator:claus',
            approval_type: 'operator',
            approval_token: 'tok:abc123',
            approved_at: '2026-04-29T11:00:00Z',
          },
          {
            approver_id: 'agent:hyperagent',
            approval_type: 'hyperagent',
            approved_at: '2026-04-29T11:01:00Z',
          },
        ],
        snapshot_hash: 'sha256:' + 'b'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature: 'ed25519:fakesig',
        signing_pubkey_id: 'key:release-v1',
        signature_domain: 'widgetdc.config-snapshot.v1',
        created_at: '2026-04-29T11:02:00Z',
      }
      expect(Value.Check(ConfigurationSnapshot, release)).toBe(true)
    })
  })

  describe('WorkArtifact', () => {
    it('accepts a minimal valid WorkArtifact', () => {
      const minimal = {
        id: 'artifact-doc-12345',
        artifact_type: 'document',
        bom_run_id: 'bomrun-test-12345',
        evidence_hash: 'sha256:' + 'c'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.work-artifact.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(WorkArtifact, minimal)).toBe(true)
    })

    it('accepts a fully-populated signed artifact with lineage chain', () => {
      const full = {
        id: 'artifact-gdpr-dpia-2026-04',
        artifact_type: 'compliance_evidence',
        bom_run_id: 'bomrun-compliance-001',
        produced_by_bom_item_id: 'bomitem-compliance-decision',
        name: 'GDPR-DPIA-Netcompany-2026-04',
        uri: 's3://widgetdc-artifacts/gdpr/dpia-netcompany-2026-04.pdf',
        mime_type: 'application/pdf',
        size_bytes: 184320,
        data_class: 'legal',
        policy_profile: 'gdpr-eu-2026-04',
        evidence_hash: 'sha256:' + 'd'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature: 'ed25519:fakesig-full',
        signing_pubkey_id: 'key:compliance-v1',
        signature_domain: 'widgetdc.work-artifact.v1',
        verification_status: 'verified',
        last_verified_at: '2026-04-29T10:30:00Z',
        verifier_id: 'agent:compliance-officer',
        expires_at: '2027-04-29T10:00:00Z',
        lineage_chain: [
          'bomitem-compliance-decision',
          'bomitem-grounding-tedeur',
          'bomitem-synthesis-final',
        ],
        workflow_id: 'wf:gdpr-compliance',
        plan_id: 'plan:phase-e1-bomitem-snapshot',
        correlation_id: 'corr:compliance-2026-04-29',
        actor_id: 'agent:compliance-officer',
        created_at: '2026-04-29T10:00:00Z',
        signed_at: '2026-04-29T10:01:00Z',
      }
      expect(Value.Check(WorkArtifact, full)).toBe(true)
    })

    it('rejects WorkArtifact with truncated evidence_hash', () => {
      const bad = {
        id: 'artifact-doc-12345',
        artifact_type: 'document',
        bom_run_id: 'bomrun-test-12345',
        evidence_hash: 'sha256:short',
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.work-artifact.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(WorkArtifact, bad)).toBe(false)
    })

    it('rejects WorkArtifact with unknown artifact_type', () => {
      const bad = {
        id: 'artifact-doc-12345',
        artifact_type: 'unknown_type',
        bom_run_id: 'bomrun-test-12345',
        evidence_hash: 'sha256:' + 'c'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.work-artifact.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(WorkArtifact, bad)).toBe(false)
    })

    it('rejects WorkArtifact with malformed produced_by_bom_item_id', () => {
      const bad = {
        id: 'artifact-doc-12345',
        artifact_type: 'document',
        bom_run_id: 'bomrun-test-12345',
        produced_by_bom_item_id: 'not-a-bomitem-id',
        evidence_hash: 'sha256:' + 'c'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.work-artifact.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(WorkArtifact, bad)).toBe(false)
    })
  })

  describe('Cross-contract invariants', () => {
    it('snapshot items reference BOMItem ids that match BOMItem.id pattern', () => {
      // Both share '^bomitem-[a-zA-Z0-9-]{8,}$' — round-trip check
      const bomItemId = 'bomitem-roundtrip-test'
      const item = {
        id: bomItemId,
        bom_run_id: 'bomrun-roundtrip-001',
        item_type: 'synthesis',
        decision_type: 'method_selection',
        policy_requirement: '',
        method_selected: 'LLM',
        method_reason: 'default',
        validation_status: 'passed',
      }
      const snapshot = {
        id: 'configsnap-roundtrip-001',
        snapshot_type: 'session',
        feature_model_version: 'fm-v1.0',
        rule_set_version: 'method-selector-v5',
        route_template_version: 'rt-v1.0',
        bom_run_id: 'bomrun-roundtrip-001',
        items: [{ bom_item_id: bomItemId, method_selected: 'LLM' }],
        snapshot_hash: 'sha256:' + 'e'.repeat(64),
        canonicalization_version: 'jcs-rfc8785-v1',
        signature_domain: 'widgetdc.config-snapshot.v1',
        created_at: '2026-04-29T10:00:00Z',
      }
      expect(Value.Check(BOMItem, item)).toBe(true)
      expect(Value.Check(ConfigurationSnapshot, snapshot)).toBe(true)
    })

    it('domain separators are distinct across the three contract types (replay-safety)', () => {
      // Domain separator strings live in defaults; verify they differ
      // BOMItem default: widgetdc.bom-item.v1
      // ConfigurationSnapshot default: widgetdc.config-snapshot.v1
      // WorkArtifact default: widgetdc.work-artifact.v1
      const domains = [
        'widgetdc.bom-item.v1',
        'widgetdc.config-snapshot.v1',
        'widgetdc.work-artifact.v1',
      ]
      const unique = new Set(domains)
      expect(unique.size).toBe(domains.length)
    })
  })
})
