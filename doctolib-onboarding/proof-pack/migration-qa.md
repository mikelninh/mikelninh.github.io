# Migration QA Report

## Source & target
- Source:
- Target:
- Export date:
- Record count:

## Mapping checks
| Source field | Target field | Rule | Result |
|---|---|---|---|

## Quality checks
- Required-field completeness
- Duplicate detection
- Unique / external ID integrity
- Invalid formats
- Unmatched records
- Referential integrity where relevant

## Sample validation
Validate representative active records against the source.

## Example SQL checks
```sql
-- duplicate external IDs
SELECT external_id, COUNT(*)
FROM patients
GROUP BY external_id
HAVING COUNT(*) > 1;
```

## Acceptance / remediation decision
