# GitHub Copilot Instructions

This repository demonstrates Apollo Client cache behavior with GraphQL queries.

## Project Structure

This is a monorepo with two main components:

- **`/frontend`**: React + Vite application using Apollo Client
- **`/server`**: Express GraphQL server

## Technology Stack

### Frontend
- **Framework**: React 19 with Vite
- **GraphQL Client**: Apollo Client v4
- **Styling**: Tailwind CSS 4 with daisyUI
- **State Management**: RxJS for observables
- **Linting**: ESLint with React hooks and refresh plugins

### Backend
- **Runtime**: Node.js (ESM modules)
- **Server**: Express 5
- **GraphQL**: graphql-http for HTTP handling

## Development Workflow

### Package Management
- Use **pnpm** as the package manager (version 10.13.1)
- Run `pnpm install` in the root to install dependencies for all workspaces

### Running the Application
- **Development mode**: `pnpm run dev` (runs both frontend and server concurrently)
- **Frontend only**: `pnpm run dev:frontend` (starts Vite dev server)
- **Server only**: `pnpm run dev:server` (starts Express server on port 4000)

### Code Formatting
- **Prettier** is configured with:
  - Single quotes
  - Trailing commas
  - Tab width: 4 spaces
  - Print width: 120 characters
- Format code: `pnpm run format`

### Linting
- Frontend has ESLint configured
- Run linting: `cd frontend && pnpm run lint`

## Code Style Guidelines

### JavaScript/JSX
- Use ES modules (`import`/`export`)
- Use single quotes for strings
- Use 4-space indentation
- Prefer const/let over var
- Use arrow functions where appropriate

### GraphQL
- Use `gql` template literals from `@apollo/client`
- Name queries and mutations explicitly
- Keep query/mutation definitions close to their usage

### React
- Functional components with hooks
- Use React 19 features
- Follow hooks rules (enforced by ESLint)

## Project Context

This is a demonstration/playground project focused on showing Apollo Client cache behavior. The application:
- Fetches a favorite book with author information via GraphQL
- Demonstrates how different queries requesting different author fields interact with Apollo's cache
- Uses DaisyUI components for UI styling

## Important Notes

- The server serves the built frontend from `/frontend/dist` at the root path
- GraphQL endpoint is at `/graphql`
- Both frontend and server use ESM module syntax (`type: "module"`)
- The project uses AGPL-3.0 license
