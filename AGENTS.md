# Project architecture decisions

- Keep the academic-year provider inside the router so it can resolve an institution from either the signed-in user's tenant or an institution-detail URL; CEO date-range reports otherwise fall back to unrelated defaults.
- Keep student dashboard presentation and its semantic accent tokens scoped to the student dashboard; reuse existing course data read-only so redesigns cannot restyle other roles or alter learning rules.