# Query Safety Rules

1. Use BoundedQuerySpec only.
2. Do not generate arbitrary SQL or SoQL from the model.
3. Validate datasetId against approved catalog.
4. Validate fields against dataset metadata.
5. Validate operators.
6. Enforce row limits.
7. Prefer aggregate queries.
8. Hide or aggregate sensitive fields.
9. Return source attribution and caveats.
10. Write query audit metadata.
