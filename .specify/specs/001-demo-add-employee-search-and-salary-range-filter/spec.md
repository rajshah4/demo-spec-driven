# Feature: Demo: Add employee search and salary range filter

> Issue: #1
> Status: Draft

## Problem Statement

The payroll dashboard currently lists all employees in a single unfiltered view. For demos, that makes it harder to quickly highlight a specific employee, role, or compensation band without manually scanning the full roster.

Adding employee search and salary range filters will make the dashboard easier to present, easier to navigate, and more useful for focused conversations about payroll data, while preserving the existing create, update, and delete workflows that the demo already relies on.

## User Stories

1. As a demo presenter, I want to search employees by name or job title, so that I can quickly find the people I want to discuss.
2. As a demo presenter, I want to filter employees by minimum and maximum salary, so that I can focus on a specific compensation band.
3. As a payroll administrator, I want the dashboard to clearly show which filters are active and give me a single way to clear them, so that I can understand the current view and reset it quickly.
4. As an existing user of the payroll dashboard, I want employee create, update, and delete behavior to remain unchanged, so that adding filters does not disrupt current workflows.

## Functional Requirements

### Must Have

- [ ] Support searching employees by employee name or title from the payroll dashboard.
- [ ] Apply search matching in a user-friendly way so partial matches can surface relevant employees.
- [ ] Support filtering employees by minimum salary.
- [ ] Support filtering employees by maximum salary.
- [ ] Treat salary range boundaries as inclusive when filtering matching employees.
- [ ] Validate salary filter inputs so invalid values do not break the page experience.
- [ ] Display the currently active search and salary filters in a visible summary area on the dashboard.
- [ ] Provide a clear action that removes all active filters and returns the dashboard to its default unfiltered state.
- [ ] Update the employee listing views on the dashboard to reflect the active search and salary filters.
- [ ] Preserve existing employee create, update, and delete capabilities for employees that remain visible in the current filtered view.
- [ ] Preserve the existing unfiltered experience when no search term or salary filters are applied.
- [ ] Show a clear empty state when no employees match the active filters.

### Should Have

- [ ] Keep filter inputs populated with the currently applied values so users can understand and refine the current view.
- [ ] Make the active filter summary easy to scan during a live demo.
- [ ] Provide helpful validation or guidance when the minimum salary is greater than the maximum salary.

### Nice to Have

- [ ] Preserve the current filtered view in a shareable or refresh-safe way.
- [ ] Offer individual removal of active filters in addition to the clear-all action.

## Acceptance Criteria

- [ ] Verify that entering a search term matching an employee name narrows the dashboard to matching employees only.
- [ ] Verify that entering a search term matching an employee title narrows the dashboard to matching employees only.
- [ ] Verify that applying only a minimum salary shows employees whose salaries are greater than or equal to that value.
- [ ] Verify that applying only a maximum salary shows employees whose salaries are less than or equal to that value.
- [ ] Verify that applying both minimum and maximum salary shows only employees within the inclusive range.
- [ ] Verify that the dashboard visibly shows the active search term and salary filters after they are applied.
- [ ] Verify that the clear action removes all filters and restores the default employee view.
- [ ] Verify that the dashboard shows a clear no-results state when filters match no employees.
- [ ] Verify that employee add, edit, and delete flows continue to work as they do today.
- [ ] Verify that invalid salary filter inputs are handled gracefully without breaking the dashboard.

## Out of Scope

- Adding new employee data fields beyond the existing name, title, salary, manager, and address fields.
- Changing employee create, update, or delete rules beyond what is necessary to keep them working with filtered views.
- Advanced filtering beyond the requested search term plus minimum and maximum salary.
- Sorting, pagination, export, or bulk actions.
- Authentication, authorization, or role-based access changes.

## Open Questions

1. Should the summary cards at the top of the dashboard reflect the filtered employee set, or should they continue to show metrics for the full payroll roster regardless of active filters?
