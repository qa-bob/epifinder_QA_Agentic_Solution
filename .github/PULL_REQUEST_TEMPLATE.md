## Summary

<!-- What does this PR change? One or two sentences. -->

## Type of change

- [ ] New test(s) added
- [ ] Existing test updated / fixed
- [ ] Page object added or updated
- [ ] CI / tooling change
- [ ] Documentation update

## Test suite affected

- [ ] `@smoke`
- [ ] `@navigation`
- [ ] `@forms`
- [ ] `@functional`
- [ ] `@visual`
- [ ] `@responsive`

## Pre-merge checklist

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run lint` passes with no errors
- [ ] Tests run locally with `npm test` (or the relevant subset)
- [ ] No hardcoded URLs in test code
- [ ] No `page.locator()` calls in test bodies (all selectors are in page objects)
- [ ] No form submissions, account creation, or real credentials used
- [ ] Visual baselines updated if design changed (`npm run baseline`)

## Notes for reviewer

<!-- Anything the reviewer should know: why a selector was chosen, why a test was skipped, etc. -->
