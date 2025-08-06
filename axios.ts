import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.API_URL ?? "https://api.yourdomain.com",
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
