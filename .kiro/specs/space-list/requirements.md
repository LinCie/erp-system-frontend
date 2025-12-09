# Requirements Document

## Introduction

This document defines the requirements for the Space List feature on the main dashboard page. The feature displays a list of spaces in a data table format with search functionality, pagination controls, and view actions. Users can search spaces with debounced input and control the number of items displayed per page.

## Glossary

- **Space**: A workspace entity containing id, name, status, created_at, and updated_at fields
- **Data Table**: A tabular component for displaying structured data with sorting and actions
- **Debounce**: A technique to delay function execution until after a specified time has passed since the last invocation
- **Space List View**: The main dashboard page component displaying spaces in a data table

## Requirements

### Requirement 1

**User Story:** As a user, I want to view a list of spaces on the dashboard, so that I can see all available spaces at a glance.

#### Acceptance Criteria

1. WHEN the dashboard page loads THEN the Space List View SHALL fetch and display spaces from the `/spaces` API endpoint
2. WHEN spaces are displayed THEN the Data Table SHALL show columns for name, status, created date, and actions
3. WHEN the API returns an empty list THEN the Data Table SHALL display an empty state message
4. WHEN the API request fails THEN the Space List View SHALL display an error message to the user

### Requirement 2

**User Story:** As a user, I want to search for spaces by name, so that I can quickly find specific spaces.

#### Acceptance Criteria

1. WHEN a user types in the search input THEN the Space List View SHALL debounce the input for 300 milliseconds before triggering a search
2. WHEN the debounced search value changes THEN the Space List View SHALL fetch spaces matching the search query
3. WHEN the search input is cleared THEN the Space List View SHALL fetch all spaces without a search filter

### Requirement 3

**User Story:** As a user, I want to control how many spaces are displayed per page, so that I can customize my viewing experience.

#### Acceptance Criteria

1. WHEN the page loads THEN the Space List View SHALL display a limit selector with options (10, 20, 50)
2. WHEN a user selects a different limit THEN the Space List View SHALL fetch spaces with the new limit parameter
3. WHEN the limit changes THEN the Space List View SHALL reset to the first page of results

### Requirement 4

**User Story:** As a user, I want to navigate to a space's detail page, so that I can view more information about a specific space.

#### Acceptance Criteria

1. WHEN spaces are displayed THEN each row SHALL include a "View" action in the actions column
2. WHEN a user clicks the View action THEN the Space List View SHALL navigate to `/{locale}/{spaceId}` route
