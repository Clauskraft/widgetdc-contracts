#!/bin/bash
# SESSION CONTEXT INJECTOR — widgetdc-contracts
# Fires at SessionStart to inject critical context

echo "═══ WIDGETDC CONTRACTS — SESSION CONTEXT ═══"
echo ""
echo "CRITICAL RULES (ENFORCED):"
echo ""
echo "1. MCP ROUTE FORMAT: {\"tool\":\"name\",\"payload\":{...}}"
echo "   ALDRIG brug 'args' — altid 'payload'"
echo ""
echo "2. READ BEFORE WRITE"
echo "   ALDRIG opret nye filer under src/ uden først at læse"
echo "   mindst 2 eksisterende filer i mappen."
echo ""
echo "3. WIRE FORMAT: snake_case JSON, alle schemas skal have \$id"
echo ""
echo "4. ALDRIG rediger schemas/ eller python/ manuelt"
echo "   Brug: npm run generate"
echo ""
echo "5. LESSON CHECK: Kald audit.lessons ved session boot."
echo "   POST /api/mcp/route {\"tool\":\"audit.lessons\",\"payload\":{\"agentId\":\"YOUR_ID\"}}"
echo ""
echo "═══ END INJECTION ═══"
