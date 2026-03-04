import { Command, Flags } from "@oclif/core";

import { getBackendUrl } from "./config.js";

export const apiCommandFlags = {
  "api-key": Flags.string({
    description: "API key override (defaults to BREVET_API_KEY env var)",
    required: false,
  }),
  "backend-url": Flags.string({
    description: "Backend URL (defaults to BREVET_BACKEND_URL env var)",
    required: false,
  }),
};

export abstract class BaseApiCommand<T extends typeof Command> extends Command {
  protected async parseApiFlags(commandClass: T): Promise<{
    apiKey?: string;
    backendUrl: string;
  }> {
    const { flags } = await this.parse(commandClass);
    return {
      apiKey: flags["api-key"] as string | undefined,
      backendUrl: getBackendUrl(flags["backend-url"] as string | undefined),
    };
  }
}
