# Locked guideline fallback

## Purpose

Locked milestones and activities can use achievement conditions that the learner GraphQL API does not describe in enough detail for the app to display. The app must not show an empty guideline modal or a partial list that omits unsupported requirements.

## Behaviour

- When every unlock condition is a supported `submit` or `complete` action with the metadata required to build its route, the modal displays the existing linked guideline list.
- When any unlock condition is unsupported or lacks required route metadata, the modal displays a generic message instead of any condition links.
- The generic message identifies whether the locked item is an activity or milestone.
- Missing or empty unlock-condition arrays retain the existing behaviour and do not open a modal.
- The guideline template does not render an ordered list when no routes are available.

## Backend boundary

The backend remains responsible for lock state and condition evaluation. This fallback does not interpret, reproduce, or expose unsupported backend rules. Displaying their details later requires the learner GraphQL API to provide a complete condition contract.

## Test coverage

The Home page tests cover fully supported, mixed unsupported, and incomplete condition data. The popup component test verifies that an empty route collection does not produce an empty ordered list.
