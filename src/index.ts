/**
 * Represents a class constructor that takes no arguments.
 * @template InstanceType - The type of instance created by this constructor.
 *
 * @example
 * ```typescript
 * class Logger {}
 * const LoggerClass: UnitClass<Logger> = Logger;
 * ```
 */
export type UnitClass<InstanceType> = new () => InstanceType;

/**
 * Represents a class constructor with specific constructor arguments.
 * @template InstanceType - The type of instance created by this constructor.
 * @template Args - Tuple type of constructor arguments, defaults to empty array.
 *
 * @example
 * ```typescript
 * class User {
 *   constructor(name: string, age: number) {}
 * }
 * const UserClass: ClassType<User, [string, number]> = User;
 * ```
 */
export type ClassType<InstanceType, Args extends any[] = []> = new (...args: Args) => InstanceType;

/**
 * Represents an abstract class constructor.
 * @template InstanceType - The type of instance this abstract class represents.
 * @template Args - Tuple type of constructor arguments, defaults to empty array.
 *
 * @example
 * ```typescript
 * abstract class BaseService {
 *   abstract execute(): void;
 * }
 * const ServiceClass: AbstractClassType<BaseService> = BaseService;
 * ```
 */
export type AbstractClassType<InstanceType, Args extends any[] = []> = abstract new (
  ...args: Args
) => InstanceType;

/**
 * Shorthand for a class constructor with any arguments.
 * @template T - The type of instance created by this constructor.
 */
export type AnyClass<T> = ClassType<T, any[]>;

/**
 * Shorthand for an abstract class constructor with any arguments.
 * @template T - The type of instance this abstract class represents.
 */
export type AnyAbstractClass<T> = AbstractClassType<T, any[]>;

/**
 * Union type representing any constructor (class or abstract class).
 */
export type AnyConstructor = ClassType<any, any[]> | AbstractClassType<any, any[]>;

/**
 * Configuration object for deferred class instantiation with dependency resolution.
 *
 * This interface allows you to separate class instantiation from argument resolution,
 * enabling lazy evaluation and runtime dependency injection.
 *
 * @template InstanceType - The type of instance to be created.
 * @template Args - Tuple type of constructor arguments.
 * @template Runtime - Optional runtime context type passed to the resolver.
 *
 * @example
 * ```typescript
 * // Sync resolver
 * const userResolver: ClassableByResolver<User, [string, number], AppContext> = {
 *   target: User,
 *   resolve: (ctx) => [ctx.config.name, ctx.config.age]
 * };
 *
 * // Async resolver
 * const asyncResolver: ClassableByResolver<User, [string], DbContext> = {
 *   target: User,
 *   resolve: async (ctx) => {
 *     const name = await ctx.db.fetchName();
 *     return [name];
 *   }
 * };
 * ```
 */
export interface ClassableByResolver<InstanceType, Args extends any[] = [], Runtime = never> {
  /** The target class constructor to instantiate. */
  target: ClassType<InstanceType, Args>;
  /**
   * Function that resolves constructor arguments.
   * Can return arguments synchronously or as a Promise.
   */
  resolve: (...args: Runtime extends never ? [] : [runtime: Runtime]) => Args | Promise<Args>;
}

/**
 * Union type representing either a direct class constructor or a resolver configuration.
 *
 * Use this type when a function accepts both plain classes and resolver objects.
 *
 * @template InstanceType - The type of instance to be created.
 * @template Args - Tuple type of constructor arguments.
 * @template Runtime - Optional runtime context type for resolvers.
 *
 * @example
 * ```typescript
 * function register<T>(cls: Classable<T>) {
 *   // Accepts both User and { target: User, resolve: () => [...] }
 * }
 *
 * register(User);
 * register({ target: User, resolve: () => ["John", 30] });
 * ```
 */
export type Classable<InstanceType, Args extends any[] = [], Runtime = never> =
  | ClassType<InstanceType, Args>
  | ClassableByResolver<InstanceType, Args, Runtime>;

/**
 * Type guard that checks if an object has a specific property.
 * After the check, TypeScript narrows the type to include that property.
 *
 * @template Obj - The object type being checked.
 * @template K - The property key to check for.
 * @param obj - The object to check.
 * @param prop - The property name to look for.
 * @returns True if the object has the specified property.
 *
 * @example
 * ```typescript
 * const data: unknown = { name: "John" };
 * if (hasOwnProperty(data, "name")) {
 *   console.log(data.name); // TypeScript knows 'name' exists
 * }
 * ```
 */
function hasOwnProperty<Obj, K extends PropertyKey>(
  obj: Obj,
  prop: K
): obj is Obj & Record<K, unknown> {
  return typeof obj === "object" && obj !== null && Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * A placeholder class used as a marker for unresolved or pending class registrations.
 * Useful in dependency injection containers or lazy initialization patterns.
 *
 * @example
 * ```typescript
 * class Container {
 *   private bindings = new Map<string, Classable<any>>();
 *
 *   register(key: string, cls: Classable<any> = classable.placeholder) {
 *     this.bindings.set(key, cls);
 *   }
 * }
 * ```
 */
export class Placeholder {}

/**
 * Pre-configured placeholder resolver that creates an empty Placeholder instance.
 * Use this as a default value when a classable binding is not yet configured.
 */
export const placeholder = Object.freeze({
  target: Placeholder,
  resolve: () => [] as const,
});

/**
 * Utility type for extending the Placeholder class in type definitions.
 * Useful for creating typed placeholders with additional properties.
 *
 * @template Extend - Additional properties to add to the Placeholder type.
 */
export type ThisExtended<Extend> = Placeholder & Extend;

/**
 * Utility type for creating a static class type with additional properties.
 *
 * @template Extend - Static properties to add to the class.
 * @template InstanceType - The instance type of the class.
 * @template Args - Constructor argument types.
 */
export type StaticExtended<Extend, InstanceType = any, Args extends any[] = []> = ClassType<
  InstanceType,
  Args
> &
  Extend;

/**
 * Interface defining all available methods on the `classable` API object.
 * This provides type-safe access to class manipulation utilities.
 */
export interface ClassableAPI {
  /** Reference to the Placeholder class constructor. */
  Placeholder: ClassType<Placeholder>;

  /** Pre-configured placeholder resolver instance. */
  placeholder: ClassableByResolver<Placeholder>;

  /** Checks if a value is a class constructor. */
  is: (fn: unknown) => fn is AnyClass<any>;

  /** Checks if a value is an abstract class constructor. */
  isAbstract: (fn: unknown) => fn is AnyAbstractClass<any>;

  /** Checks if a value is a ClassableByResolver object. */
  isResolver: <InstanceType, Args extends any[] = [], Runtime = never>(
    obj: unknown
  ) => obj is ClassableByResolver<InstanceType, Args, Runtime>;

  /** Converts a class constructor to a resolver configuration. */
  toResolver<T, A extends any[] = [], R = never>(
    cls: ClassType<T, A>,
    runtime?: R
  ): ClassableByResolver<T, [], R>;

  /** Extracts the target class from a Classable (class or resolver). */
  getTarget: <Target>(cls: Classable<Target, any[], any>) => Target;

  /** Creates a new resolver with a custom resolve function. */
  withResolve: <InstanceType, Args extends any[] = [], Runtime = never>(
    base: Classable<InstanceType, Args, Runtime>,
    resolve: ClassableByResolver<InstanceType, Args, Runtime>["resolve"]
  ) => ClassableByResolver<InstanceType, Args, Runtime>;

  /** Wraps a class with a transformation function. */
  wrap<T>(cls: ClassType<T>, wrapper: (target: ClassType<T>) => ClassType<T>): ClassType<T>;

  /** Wraps a resolver's target with a transformation function. */
  wrap<T, A extends any[], R>(
    cls: ClassableByResolver<T, A, R>,
    wrapper: (target: ClassType<T>) => ClassType<T>
  ): ClassableByResolver<T, A, R>;

  /** Returns metadata about the classable (type and target name). */
  getDescriptor: (cls: Classable<any, any[], any>) => {
    type: "class" | "resolver";
    target: string;
  };

  /** Creates an instance from a plain class. */
  create<InstanceType>(cls: ClassType<InstanceType>): InstanceType;

  /** Creates an instance from a resolver with sync resolve function. */
  create<InstanceType, Args extends any[], Runtime>(
    cls: ClassableByResolver<InstanceType, Args, Runtime> & {
      resolve: (runtime: Runtime) => Args;
    },
    runtime: Runtime
  ): InstanceType;

  /** Creates an instance from a resolver with async resolve function. */
  create<InstanceType, Args extends any[], Runtime>(
    cls: ClassableByResolver<InstanceType, Args, Runtime> & {
      resolve: (runtime: Runtime) => Promise<Args>;
    },
    runtime: Runtime
  ): Promise<InstanceType>;
}

/**
 * The main classable API object providing utilities for working with classes and resolvers.
 *
 * This frozen object contains methods for:
 * - Type checking (`is`, `isAbstract`, `isResolver`)
 * - Converting between formats (`toResolver`, `withResolve`)
 * - Instance creation (`create`)
 * - Class manipulation (`wrap`, `getTarget`, `getDescriptor`)
 *
 * @example
 * ```typescript
 * // Check if something is a class
 * if (classable.is(MyClass)) {
 *   const instance = classable.create(MyClass);
 * }
 *
 * // Create instance with resolver
 * const resolver = {
 *   target: User,
 *   resolve: (ctx: AppContext) => [ctx.userName, ctx.userAge]
 * };
 * const user = classable.create(resolver, appContext);
 *
 * // Wrap a class with middleware
 * const wrapped = classable.wrap(Logger, (Target) => {
 *   return class extends Target {
 *     log(msg: string) {
 *       super.log(`[${Date.now()}] ${msg}`);
 *     }
 *   };
 * });
 * ```
 */
export const classable = Object.freeze({
  Placeholder,
  placeholder,

  /**
   * Checks if a value is a class constructor (not abstract).
   *
   * @param fn - The value to check.
   * @returns True if the value is a class constructor.
   *
   * @example
   * ```typescript
   * class MyClass {}
   * classable.is(MyClass); // true
   * classable.is(() => {}); // false
   * ```
   */
  is: (fn: unknown): fn is AnyClass<any> => {
    return typeof fn === "function" && /^class\s/.test(Function.prototype.toString.call(fn));
  },

  /**
   * Checks if a value is an abstract class constructor.
   *
   * @param fn - The value to check.
   * @returns True if the value is an abstract class.
   *
   * @example
   * ```typescript
   * abstract class BaseService {}
   * classable.isAbstract(BaseService); // true
   * ```
   */
  isAbstract: (fn: unknown): fn is AnyAbstractClass<any> => {
    return (
      typeof fn === "function" && /^abstract\s+class\s/.test(Function.prototype.toString.call(fn))
    );
  },

  /**
   * Checks if a value is a ClassableByResolver object.
   *
   * @template InstanceType - Expected instance type.
   * @template Args - Expected constructor arguments.
   * @template Runtime - Expected runtime context type.
   * @param obj - The value to check.
   * @returns True if the value is a resolver configuration.
   *
   * @example
   * ```typescript
   * const resolver = { target: User, resolve: () => ["John"] };
   * classable.isResolver(resolver); // true
   * classable.isResolver(User); // false
   * ```
   */
  isResolver: <InstanceType, Args extends any[] = [], Runtime = never>(
    obj: unknown
  ): obj is ClassableByResolver<InstanceType, Args, Runtime> => {
    return (
      hasOwnProperty(obj, "target") &&
      classable.is(obj.target) &&
      hasOwnProperty(obj, "resolve") &&
      typeof obj.resolve === "function"
    );
  },

  /**
   * Converts a class constructor to a resolver configuration.
   * If the input is already a resolver, returns it unchanged.
   *
   * @template InstanceType - The instance type.
   * @template Args - Constructor argument types.
   * @template Runtime - Runtime context type.
   * @param cls - The class or resolver to convert.
   * @returns A ClassableByResolver configuration.
   *
   * @example
   * ```typescript
   * const resolver = classable.toResolver(User);
   * // { target: User, resolve: () => [] }
   * ```
   */
  toResolver: <InstanceType, Args extends any[] = [], Runtime = never>(
    cls: ClassType<InstanceType, Args>
  ): ClassableByResolver<InstanceType, Args, Runtime> => {
    if (classable.isResolver<InstanceType, Args, Runtime>(cls)) {
      return cls;
    }

    return {
      target: cls,
      resolve: () => [] as unknown as Args,
    };
  },

  /**
   * Creates an instance from a Classable (class or resolver).
   *
   * - For plain classes: instantiates with no arguments.
   * - For sync resolvers: resolves arguments and instantiates.
   * - For async resolvers: returns a Promise that resolves to the instance.
   *
   * @template InstanceType - The type of instance to create.
   * @template Args - Constructor argument types.
   * @template Runtime - Runtime context type.
   * @param cls - The class or resolver to instantiate.
   * @param runtime - Optional runtime context passed to the resolver.
   * @returns The created instance, or a Promise for async resolvers.
   *
   * @example
   * ```typescript
   * // Plain class
   * const logger = classable.create(Logger);
   *
   * // Sync resolver
   * const user = classable.create(userResolver, context);
   *
   * // Async resolver
   * const user = await classable.create(asyncResolver, context);
   * ```
   */
  create: <InstanceType, Args extends any[] = [], Runtime = never>(
    cls: Classable<InstanceType, Args, Runtime>,
    runtime?: Runtime
  ) => {
    if (classable.isResolver<InstanceType, Args, Runtime>(cls)) {
      const args = cls.resolve(
        ...((runtime === undefined ? [] : [runtime]) as Runtime extends never
          ? []
          : [runtime: Runtime])
      );

      if (args instanceof Promise) {
        return args.then((resolvedArgs) => new cls.target(...resolvedArgs));
      }

      return new cls.target(...args);
    }

    return new cls(...([] as unknown as Args));
  },

  /**
   * Extracts the target class from a Classable.
   *
   * @template InstanceType - The instance type.
   * @template Args - Constructor argument types.
   * @template Runtime - Runtime context type.
   * @param cls - The class or resolver to extract from.
   * @returns The underlying class constructor.
   *
   * @example
   * ```typescript
   * const target = classable.getTarget(userResolver);
   * // Returns User class
   * ```
   */
  getTarget<InstanceType, Args extends any[], Runtime = never>(
    cls: Classable<InstanceType, Args, Runtime>
  ): ClassType<InstanceType> {
    if (classable.isResolver<InstanceType, Args, Runtime>(cls)) {
      return cls.target;
    }
    return cls;
  },

  /**
   * Creates a new resolver by combining a base classable with a custom resolve function.
   *
   * @template InstanceType - The instance type.
   * @template Args - Constructor argument types.
   * @template Runtime - Runtime context type.
   * @param base - The base class or resolver.
   * @param resolve - The new resolve function.
   * @returns A new resolver with the custom resolve function.
   *
   * @example
   * ```typescript
   * const customResolver = classable.withResolve(User, (ctx) => {
   *   return [ctx.name, ctx.age];
   * });
   * ```
   */
  withResolve: <InstanceType, Args extends any[] = [], Runtime = never>(
    base: Classable<InstanceType, Args, Runtime>,
    resolve: ClassableByResolver<InstanceType, Args, Runtime>["resolve"]
  ): ClassableByResolver<InstanceType, Args, Runtime> => {
    const normalized = classable.isResolver<InstanceType, Args, Runtime>(base)
      ? base
      : classable.toResolver<InstanceType, Args, Runtime>(base);
    return {
      target: normalized.target,
      resolve,
    };
  },

  /**
   * Wraps a class or resolver's target with a transformation function.
   * Useful for adding mixins, decorators, or middleware to classes.
   *
   * @template InstanceType - The instance type.
   * @template Args - Constructor argument types.
   * @template Runtime - Runtime context type.
   * @param cls - The class or resolver to wrap.
   * @param wrapper - Function that transforms the target class.
   * @returns A new class or resolver with the wrapped target.
   *
   * @example
   * ```typescript
   * const timestampedLogger = classable.wrap(Logger, (Target) => {
   *   return class extends Target {
   *     log(msg: string) {
   *       super.log(`[${new Date().toISOString()}] ${msg}`);
   *     }
   *   };
   * });
   * ```
   */
  wrap: <InstanceType, Args extends any[] = [], Runtime = never>(
    cls: Classable<InstanceType, Args, Runtime>,
    wrapper: (target: ClassType<InstanceType, Args>) => ClassType<InstanceType, Args>
  ): Classable<InstanceType, Args, Runtime> => {
    if (classable.isResolver<InstanceType, Args, Runtime>(cls)) {
      return {
        target: wrapper(cls.target),
        resolve: cls.resolve,
      };
    }

    return wrapper(cls);
  },

  /**
   * Returns metadata describing the classable.
   *
   * @param cls - The class or resolver to describe.
   * @returns Object with type ("class" or "resolver") and target class name.
   *
   * @example
   * ```typescript
   * classable.getDescriptor(User);
   * // { type: "class", target: "User" }
   *
   * classable.getDescriptor({ target: User, resolve: () => [] });
   * // { type: "resolver", target: "User" }
   * ```
   */
  getDescriptor: (cls: Classable<any, any[], any>) => {
    if (classable.isResolver<any, any[], any>(cls)) {
      return {
        type: "resolver",
        target: cls.target.name,
      };
    }

    return {
      type: "class",
      target: cls.name,
    };
  },
}) as Readonly<ClassableAPI>;
