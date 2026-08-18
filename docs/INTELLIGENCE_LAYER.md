# Intelligence Layer

## v1 Status
No AI in v1. The core workflow (submit, review, approve, return) is pure database logic.

## Later: Report Quality Scoring
**Messy input**: free-text report content of varying length and structure.

**Auto-structure schema** (stored as column on reports later):
```json
{
  "completeness_score": 0.8,
  "completeness_source": "keyword_coverage_check",
  "completeness_confidence": 0.75,
  "completeness_review_status": "unreviewed",
  "missing_sections": ["risk_assessment", "budget"],
  "word_count": 1240,
  "has_test_data": true
}
```

**Events to track**:
- report.submitted
- report.approved
- report.returned
- report.revision_created

**Scoring rules** (rule-based, start here):
- Completeness: 1 point per required section keyword found (max 10 → score = found/10).
- Timeliness: +0.2 if submitted before due_date; −0.2 if after.
- Revision penalty: −0.1 per return cycle.

**What gets ranked**: Reports in the manager review queue, sorted by due-date urgency then by completeness score ascending (flag weak reports first).

## v1 vs Later
| Capability | v1 | Later |
|------------|----|----|
| Quality score | — | rule-based, stored on report |
| Review queue ranking | due-date only | due-date + score |
| Missing-section hints | — | computed from keyword check |
| Report summarization | — | AI-generated summary field |