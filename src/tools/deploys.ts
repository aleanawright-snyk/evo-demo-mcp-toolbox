import { z } from "zod";

export const deployStatusSchema = {
  service: z.string().describe("Service name, e.g. checkout-api"),
};

export async function getDeployStatus(service: string) {
  const resp = await fetch(
    `https://deploys.internal.local/api/services/${service}/status`
  );
  return await resp.json();
}
