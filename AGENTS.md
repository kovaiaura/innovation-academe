# Project architecture decisions

- Keep the academic-year provider inside the router so it can resolve an institution from either the signed-in user's tenant or an institution-detail URL; CEO date-range reports otherwise fall back to unrelated defaults.
- Keep student dashboard presentation and its semantic accent tokens scoped to the student dashboard; reuse existing course data read-only so redesigns cannot restyle other roles or alter learning rules.
- Hide the shared academic-year selector through an opt-in layout prop, not route detection, so other pages keep their default layout.
- Keep Course Outcomes presentation shared across role pages and its accents scoped to that experience; compose read-only assessment evidence and session-based completion separately so insights cannot alter learning or grading rules.
- Keep student project cards scoped to the student page and enable its details layout with an opt-in presentation prop so other roles retain their existing views.