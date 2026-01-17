# @mxweb/classable

A TypeScript utility library for working with classes and deferred instantiation through resolver patterns. Provides type-safe class manipulation, dependency injection patterns, and lazy initialization support.

## ESM-only (by design)

Classable relies on the semantic identity of classes:

- native `class` syntax
- stable constructor identity
- intact static surfaces
- predictable module graph

CommonJS transforms classes and breaks these guarantees at runtime.

- This is not a compatibility limitation.
- It is a design requirement.

## Installation

```bash
npm install @mxweb/classable
# or
yarn add @mxweb/classable
# or
pnpm add @mxweb/classable
```

## Features

- 🎯 **Type-safe class utilities** - Full TypeScript support with precise type inference
- 🔄 **Resolver pattern** - Separate class instantiation from argument resolution
- ⏳ **Async support** - Handle async dependency resolution seamlessly
- 🎁 **Class wrapping** - Apply decorators, mixins, and middleware to classes
- 🔍 **Type guards** - Runtime checks with TypeScript type narrowing
- 📦 **Zero dependencies** - Lightweight and self-contained

## Quick Start

```typescript
import { classable, Classable, ClassableByResolver } from '@mxweb/classable';

// Basic class instantiation
class Logger {
  log(msg: string) {
    console.log(msg);
  }
}

const logger = classable.create(Logger);
logger.log('Hello!');
```

## Core Concepts

### Classable

A `Classable` is either a plain class constructor or a resolver configuration object:

```typescript
import { Classable, ClassableByResolver } from '@mxweb/classable';

class User {
  constructor(public name: string, public age: number) {}
}

// Plain class
const cls: Classable<User> = User;

// Resolver with dependency injection
const resolver: ClassableByResolver<User, [string, number], AppContext> = {
  target: User,
  resolve: (ctx) => [ctx.config.userName, ctx.config.userAge]
};
```

### ClassableByResolver

A configuration object that separates class instantiation from argument resolution:

```typescript
interface ClassableByResolver<InstanceType, Args, Runtime> {
  target: ClassType<InstanceType, Args>;  // The class to instantiate
  resolve: (runtime: Runtime) => Args | Promise<Args>;  // Argument resolver
}
```

### Readonlyable

All `Args` type parameters accept both mutable and readonly arrays, so you can use `Object.freeze()` or `as const` without type errors:

```typescript
// Both work seamlessly
const mutableResolver = {
  target: User,
  resolve: () => ['John', 30]  // mutable array
};

const frozenResolver = Object.freeze({
  target: User,
  resolve: () => ['John', 30] as const  // readonly array
});
```

## API Reference

### Type Utilities

| Type | Description |
|------|-------------|
| `Readonlyable<T>` | Accepts both mutable and readonly versions of a type |
| `UnitClass<T>` | Class constructor with no arguments |
| `ClassType<T, Args>` | Class constructor with specific arguments |
| `AbstractClassType<T, Args>` | Abstract class constructor |
| `AnyClass<T>` | Class constructor with any arguments |
| `AnyAbstractClass<T>` | Abstract class with any arguments |
| `AnyConstructor` | Any class or abstract class |
| `Classable<T, Args, Runtime>` | Class or resolver configuration |
| `ClassableByResolver<T, Args, Runtime>` | Resolver configuration |
| `InstanceByStatic<T, Method, Args, Runtime>` | Static factory method pattern |
| `ClassableSelector<T, Args, Runtime>` | Selector function for choosing classables |

### `classable` API

#### `classable.is(fn)`

Checks if a value is a class constructor.

```typescript
class MyClass {}
classable.is(MyClass);     // true
classable.is(() => {});    // false
classable.is({});          // false
```

#### `classable.isAbstract(fn)`

Checks if a value is an abstract class constructor.

```typescript
abstract class BaseService {}
classable.isAbstract(BaseService);  // true
classable.isAbstract(MyClass);      // false
```

#### `classable.isResolver(obj)`

Checks if a value is a `ClassableByResolver` object.

```typescript
const resolver = { target: User, resolve: () => ['John', 30] };
classable.isResolver(resolver);  // true
classable.isResolver(User);      // false
```

#### `classable.create(cls, runtime?)`

Creates an instance from a class or resolver. Handles both sync and async resolvers.

```typescript
// Plain class
const logger = classable.create(Logger);

// Sync resolver
const user = classable.create({
  target: User,
  resolve: (ctx) => [ctx.name, ctx.age]
}, context);

// Async resolver
const user = await classable.create({
  target: User,
  resolve: async (ctx) => {
    const data = await fetchUserData();
    return [data.name, data.age];
  }
}, context);
```

#### `classable.toResolver(cls)`

Converts a class constructor to a resolver configuration.

```typescript
const resolver = classable.toResolver(User);
// { target: User, resolve: () => [] }
```

#### `classable.getTarget(cls)`

Extracts the target class from a Classable.

```typescript
const target = classable.getTarget(resolver);  // User class
const target2 = classable.getTarget(User);     // User class
```

#### `classable.withResolve(base, resolve)`

Creates a new resolver with a custom resolve function.

```typescript
const customResolver = classable.withResolve(User, (ctx) => {
  return [ctx.name, ctx.age];
});
```

#### `classable.wrap(cls, wrapper)`

Wraps a class or resolver's target with a transformation function.

```typescript
const timestampedLogger = classable.wrap(Logger, (Target) => {
  return class extends Target {
    log(msg: string) {
      super.log(`[${new Date().toISOString()}] ${msg}`);
    }
  };
});
```

#### `classable.getDescriptor(cls)`

Returns metadata about the classable.

```typescript
classable.getDescriptor(User);
// { type: "class", target: "User" }

classable.getDescriptor(resolver);
// { type: "resolver", target: "User" }
```

#### `classable.from(def, runtime?)`

Creates an instance from a static factory method definition.

```typescript
class Cache {
  private constructor(private ttl: number) {}
  
  static create(ttl: number): Cache {
    return new Cache(ttl);
  }
}

const cacheInstance = classable.from({
  target: Cache,
  selector: () => ({ method: "create", args: [3600] })
});

// With runtime context
const dynamicCache = classable.from({
  target: Cache,
  selector: (ctx) => ({ method: "create", args: [ctx.cacheTTL] })
}, appContext);
```

#### `classable.select(selector)`

Creates a selector function that chooses a classable from a list based on custom logic.

```typescript
// Simple selector
const pickFirst = classable.select((...classes) => {
  return [classes[0], []];
});
const [selected, args] = pickFirst(ServiceA, ServiceB);

// With runtime context
const pickByEnv = classable.select<Logger, [], Env>((env, ...loggers) => {
  return env.isDev ? [loggers[0], []] : [loggers[1], []];
});
const [logger, loggerArgs] = pickByEnv(devEnv, DevLogger, ProdLogger);
```

### Placeholder

Utility classes for marking unresolved bindings:

```typescript
import { classable } from '@mxweb/classable';

// Use placeholder resolver as default value
class Container {
  private bindings = new Map();
  
  register(key: string, cls = classable.placeholder) {
    this.bindings.set(key, cls);
  }
}

// Use placeholderInstance for static factory pattern
const instance = classable.from(classable.placeholderInstance);
// Returns new Placeholder via getInstance()
```

## Advanced Usage

### Static Factory Method Pattern

Use `InstanceByStatic` for classes that use static factory methods instead of direct instantiation:

```typescript
import { classable, InstanceByStatic } from '@mxweb/classable';

class Database {
  private constructor(private connectionString: string) {}
  
  static connect(connectionString: string): Database {
    return new Database(connectionString);
  }
  
  static createInMemory(): Database {
    return new Database(':memory:');
  }
}

// Define static factory configuration
const dbDef: InstanceByStatic<Database, 'connect', [string]> = {
  target: Database,
  selector: () => ({ method: 'connect', args: ['postgres://localhost'] })
};

// Create instance via factory method
const db = classable.from(dbDef);

// With runtime context for dynamic selection
const dynamicDb = classable.from({
  target: Database,
  selector: (ctx) => ctx.isTest
    ? { method: 'createInMemory', args: [] }
    : { method: 'connect', args: [ctx.dbUrl] }
}, appContext);
```

### Dependency Injection Pattern

```typescript
interface AppContext {
  db: Database;
  config: Config;
}

class UserService {
  constructor(
    private db: Database,
    private maxUsers: number
  ) {}
}

const userServiceResolver: ClassableByResolver<
  UserService,
  [Database, number],
  AppContext
> = {
  target: UserService,
  resolve: (ctx) => [ctx.db, ctx.config.maxUsers]
};

// Create with context
const context: AppContext = { db: new Database(), config: { maxUsers: 100 } };
const service = classable.create(userServiceResolver, context);
```

### Async Dependency Resolution

```typescript
const asyncResolver: ClassableByResolver<User, [string], DbContext> = {
  target: User,
  resolve: async (ctx) => {
    const userData = await ctx.db.fetchUser(ctx.userId);
    return [userData.name];
  }
};

// Returns Promise<User>
const user = await classable.create(asyncResolver, dbContext);
```

### Class Middleware/Decorators

```typescript
// Add logging to all methods
const withLogging = classable.wrap(MyService, (Target) => {
  return class extends Target {
    constructor(...args: any[]) {
      super(...args);
      console.log(`Created ${Target.name}`);
    }
  };
});

// Chain multiple wrappers
const enhanced = classable.wrap(
  classable.wrap(MyService, withLogging),
  withMetrics
);
```

### Type Guards with Narrowing

```typescript
function processClassable(input: unknown) {
  if (classable.isResolver(input)) {
    // TypeScript knows input has 'target' and 'resolve'
    console.log(`Resolver for: ${input.target.name}`);
  } else if (classable.is(input)) {
    // TypeScript knows input is a class
    console.log(`Class: ${input.name}`);
  }
}
```

## TypeScript Support

This library is written in TypeScript and provides full type inference:

```typescript
// Types are automatically inferred
const resolver = {
  target: User,
  resolve: (ctx: AppContext) => [ctx.name, ctx.age] as [string, number]
};

// Return type is correctly inferred as User
const user = classable.create(resolver, context);

// Async resolver returns Promise<User>
const asyncResolver = {
  target: User,
  resolve: async (ctx: AppContext) => {
    return [await getName(), await getAge()] as [string, number];
  }
};
const asyncUser = classable.create(asyncResolver, context); // Promise<User>
```

## Documentation

For detailed documentation, guides, and API reference, visit:

[https://edge.mxweb.io/classable](https://edge.mxweb.io/classable)

## License

MIT
