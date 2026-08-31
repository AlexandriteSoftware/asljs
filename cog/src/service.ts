export interface Service
{
  dispose?(): Promise<void>;
}

export type ServiceFactory<TService extends Service = Service> =
  (
  ) =>
    | TService
  | Promise<TService>;

export interface ServiceProvider
{
  get<TService extends Service>(
    name: string
  ): Promise<TService>;
}

export class SingletonServiceProvider implements ServiceProvider
{
  readonly #factories = new Map<string, ServiceFactory>();
  readonly #services = new Map<string, Promise<Service>>();

  register<TService extends Service>(
    name: string,
    factory: ServiceFactory<TService>
  ): void
  {
    if (
      this.#factories.has(
        name)
      || this.#services.has(
        name)
    ) {
      throw new Error(
        `Service is already registered: ${name}`);
    }

    this.#factories.set(
      name,
      factory);
  }

  async get<TService extends Service>(
    name: string
  ): Promise<TService>
  {
    let service =
      this.#services.get(
        name);

    if (!service) {
      const factory =
        this.#factories.get(
          name);

      if (!factory) {
        throw new Error(
          `Service is not registered: ${name}`);
      }

      service =
        Promise.resolve(
          factory());

      this.#services.set(
        name,
        service);
    }

    return await service as TService;
  }

  async dispose(): Promise<void>
  {
    const services =
      [ ...this.#services.values() ];

    this.#services.clear();

    for (const service of services.reverse()) {
      await (await service).dispose?.();
    }
  }
}
