import { Args, Command, Flags } from "@oclif/core";

import {
  BackendHttpError,
  fetchJsonOrThrow,
} from "../../lib/api-client.js";
import { apiCommandFlags } from "../../lib/base-api-command.js";
import { getBackendUrl, hasConfiguredBackendUrl } from "../../lib/config.js";

const parseHelloPayload = (payload: unknown): { message: string } => {
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as { message?: unknown }).message !== "string"
  ) {
    throw new Error("Backend returned an invalid hello payload");
  }

  return payload as { message: string };
};

export default class Hello extends Command {
  static args = {
    person: Args.string({
      default: "world",
      description: "Person to say hello to",
      required: false,
    }),
  };
  static description = "Say hello";
  static examples = [
    `<%= config.bin %> <%= command.id %> marco --from cli
hello marco from cli!
`,
    `<%= config.bin %> <%= command.id %> --backend-url http://localhost:4000
backend says: Hello from Fastify
`,
  ];
  static flags = {
    ...apiCommandFlags,
    from: Flags.string({
      char: "f",
      default: "cli",
      description: "Who is saying hello",
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Hello);
    const backendFlag = flags["backend-url"] as string | undefined;
    const shouldCallBackend = hasConfiguredBackendUrl(backendFlag);
    const backendUrl = getBackendUrl(backendFlag);
    const apiKey = flags["api-key"] as string | undefined;

    this.log(`hello ${args.person} from ${flags.from}!`);

    if (!shouldCallBackend) {
      return;
    }

    try {
      const { message } = await fetchJsonOrThrow(
        backendUrl,
        "/hello",
        parseHelloPayload,
        {},
        apiKey,
      );
      this.log(`backend says: ${message}`);
    } catch (error) {
      if (error instanceof BackendHttpError) {
        this.error(`Backend returned ${error.status}`);
      }

      this.error(
        `Failed to reach backend at ${backendUrl}: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }
}
