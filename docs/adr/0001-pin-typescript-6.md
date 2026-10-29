# ADR 0001: Pin TypeScript to 6.x

- Status: accepted
- Context: TypeScript 7.0 installed by default, but `typescript-eslint` (used by `eslint-config-next`) rejects it and the pre-commit hook failed.
- Decision: pin `typescript@6` until typescript-eslint supports TS 7.1+.
- Consequences: revisit when typescript-eslint announces TS 7 support; remove the pin then.
