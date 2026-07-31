# Typical Floor Plan Update

- Replaced `public/images/plans/typical-plan.webp` with the supplied 1774 x 887 plan.
- Remapped all 26 office hotspots to the structural boundaries in the new plan.
- Updated the plan aspect ratio and selected-office crop calculations.
- Existing floor switching, pan/zoom, office popup, multi-select, enquiry, and cost-sheet behavior remains unchanged.

## Verification note

A clean local build could not be completed in the supplied sandbox because its internal npm proxy does not currently contain `zustand@5.0.14`, a transitive dependency. The source changes themselves are isolated to the floor-plan asset and coordinate support files.
