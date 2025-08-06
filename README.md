# orval-axiosInstance-cloudflare-configuration
🛠️ Fixing Illegal invocation in Cloudflare Pages (Workers) When Using Axios + Orval
When using Orval with a custom Axios instance inside a Cloudflare Pages (i.e., Cloudflare Workers) environment, you may encounter the following error:
TypeError: Illegal invocation: function called with incorrect `this` reference.
📌 Problem
This is caused by how the Cloudflare Workers runtime handles AbortController.abort(). It throws an error because the internal this reference is incorrect in that context.

✅ Solution
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.APIURL ?? "https://api.yourdomain.com",
});

export const apiClientInstance = <T = any>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => {
  let controller: AbortController | undefined;

  // Detect Cloudflare Workers environment
  const isCloudflareWorkers =
    typeof navigator !== "undefined" &&
    navigator.userAgent?.includes("Cloudflare-Workers");

  // Use AbortController only if supported
  if (!isCloudflareWorkers && typeof AbortController !== "undefined") {
    controller = new AbortController();
  }

  const mergedConfig: AxiosRequestConfig = {
    ...config,
    ...options,
    params: {
      ...(config.params || {}),
      ...(options?.params || {}),
    },
    headers: {
      ...(config.headers || {}),
      ...(options?.headers || {}),
    },
    ...(controller && { signal: controller.signal }),
  };

  const promise = AXIOS_INSTANCE(mergedConfig);

  if (controller) {
    // @ts-ignore
    promise.cancel = () => {
      try {
        controller.abort();
      } catch (error) {
        console.warn("AbortController.abort() failed:", error);
      }
    };
  } else {
    // @ts-ignore
    promise.cancel = () => {
      console.warn("Request cancellation not supported in this environment");
    };
  }

  return promise;
};

Orval Config Example
Update your orval.config.ts to use this as a custom mutator:
export default defineConfig({
  exampleAPI: {
    input: {
      target: "https://api.example.com/swagger",
    },
    output: {
      mode: "single",
      target: "./src/api.ts",
      client: "axios",
      override: {
        mutator: {
          path: "./src/lib/axios.ts",
          name: "apiClientInstance",
        },
      },
    },
  },
});

Tested On
✅ Cloudflare Pages (Workers)

✅ Vercel (Node)

✅ Local dev (Next.js)

