# Project architecture decisions

- Keep the academic-year provider inside the router so it can resolve an institution from either the signed-in user's tenant or an institution-detail URL; CEO date-range reports otherwise fall back to unrelated defaults.