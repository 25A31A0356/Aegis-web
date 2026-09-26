# AEGIS Contribution Guidelines & Developer Workflow

Welcome to the AEGIS Disaster Response Engineering Team. We build life-safety infrastructure where reliability, code clarity, and architectural integrity are paramount.

## 1. Development Principles
1. **Never Invent Functionality**: Code and documentation must reflect verified implementations.
2. **Offline-First Resilience**: All client features must gracefully handle network failure and maintain data durability.
3. **Strict Type Safety**: All TypeScript must pass strict compiler checks (`noImplicitAny`, strict null checks); Python backend must adhere to Pydantic v2 schemas and strict typing.

---

## 2. Branching & Commit Conventions

### 2.1 Branch Strategy
- `main`: Production-ready, verified releases.
- `staging`: Integration testing environment.
- `feat/<feature-name>`: New capabilities (e.g., `feat/offline-sos-outbox`).
- `fix/<bug-name>`: Bug fixes and patches (e.g., `fix/gps-drift-filter`).
- `docs/<doc-name>`: Technical documentation enhancements.

### 2.2 Conventional Commits
All commits must follow the standard Angular/Conventional Commits format:
```text
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`.
- Example: `feat(synoptic): implement Catmull-Rom spline interpolation for Cyclone Arnab`

---

## 3. Pull Request & Review Process
1. Ensure all local tests pass before opening a PR (`npm test` and `pytest`).
2. Include reproduction steps or verification test cases.
3. Update relevant documentation in `docs/` and architecture diagrams if system design is altered.
4. Require at least one peer approval from the core architecture team.
