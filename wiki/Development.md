# Development Guide

## Local Setup
1. Clone the repo and run `npm install`.
2. Copy `.env.example` to `.env` and fill in credentials.
3. Run `npm run dev` to start the app.

## Folder Structure
```mermaid
graph TD
  SRC[src/]
  LIB[src/lib/]
  ROUTES[src/routes/]
  FUNCTIONS[netlify/functions/]
  SCRIPTS[scripts/]
  STATIC[static/]
  SRC --> LIB
  SRC --> ROUTES
  SRC --> STATIC
  ROOT[Project Root] --> SRC
  ROOT --> FUNCTIONS
  ROOT --> SCRIPTS
  ROOT --> STATIC
```

## Contributing
- See [CONTRIBUTING.md](../CONTRIBUTING.md)
