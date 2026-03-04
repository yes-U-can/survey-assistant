# Data Migration Service Policy (Draft)

## Scope
- Support organizations migrating from legacy survey systems.
- Provide two paths:
  1. Self-service migration tools
  2. Assisted migration request service

## Internal Rule
- Legacy data from client organizations must never be committed to public repository.
- Migration processing should use isolated secure workspace/storage.

## Product Requirement
- Migration module is a first-class feature in Survey Assistant.
- Request intake flow should capture source format, schema notes, and privacy constraints.
