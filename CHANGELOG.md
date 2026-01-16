# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Added

- **Type Utilities**
  - `UnitClass<T>` - Class constructor with no arguments
  - `ClassType<T, Args>` - Class constructor with specific arguments
  - `AbstractClassType<T, Args>` - Abstract class constructor
  - `AnyClass<T>` - Class constructor with any arguments
  - `AnyAbstractClass<T>` - Abstract class with any arguments
  - `AnyConstructor` - Union type for any constructor
  - `Classable<T, Args, Runtime>` - Class or resolver configuration
  - `ClassableByResolver<T, Args, Runtime>` - Resolver configuration interface
  - `ThisExtended<Extend>` - Utility for extending Placeholder
  - `StaticExtended<Extend, T, Args>` - Utility for static class extension

- **classable API**
  - `classable.is(fn)` - Type guard for class constructors
  - `classable.isAbstract(fn)` - Type guard for abstract classes
  - `classable.isResolver(obj)` - Type guard for resolver objects
  - `classable.create(cls, runtime?)` - Instance creation with sync/async resolver support
  - `classable.toResolver(cls)` - Convert class to resolver format
  - `classable.withResolve(base, resolve)` - Create resolver with custom resolve function
  - `classable.wrap(cls, wrapper)` - Apply decorators/middleware to classes
  - `classable.getTarget(cls)` - Extract target class from Classable
  - `classable.getDescriptor(cls)` - Get metadata (type and target name)

- **Utilities**
  - `Placeholder` class - Marker for unresolved bindings
  - `placeholder` - Pre-configured placeholder resolver

- **Documentation**
  - Full JSDoc documentation for all types and methods
  - Comprehensive README with examples
  - MIT License

[1.0.0]: https://github.com/mxwebio/mxweb-classable/releases/tag/v1.0.0
