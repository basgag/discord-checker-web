import { type APIUser } from "discord-api-types/v10";
import axios, { AxiosError, type AxiosResponse } from "axios";

const GATEWAY_URL = "https://discord.com/api/v10";

export const DISCORD_EPOCH = 1420070400000;

/**
 * Converts a Discord snowflake id to a milliseconds timestamp.
 * @param snowflake
 */
export const snowflakeToMilliseconds = (snowflake: string): number => {
  return Number(snowflake) / 4194304 + DISCORD_EPOCH;
};

interface RequestConfig {
  data?: object;
  token?: string;
  delay?: number;
  method?: "GET" | "POST" | "PUT" | "DELETE";
}

/**
 * Sends a request to the Discord api with the given data. If a rate limit is encountered, wait and retry.
 * @param {string} uri The request uri (e.g. /users)
 * @param {RequestConfig} config The request config for this request.
 */
export async function apiRequest<ReturnType>(
  uri: string,
  config: RequestConfig,
): Promise<AxiosResponse<ReturnType> | null> {
  const { data = null, token = null, delay = 0, method = "GET" } = config;
  try {
    if (delay && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const url = GATEWAY_URL + uri;
    return await axios.request<ReturnType>({
      url,
      method,
      data,
      headers: token ? { Authorization: token } : {},
    });
  } catch (err) {
    if (err instanceof AxiosError) {
      if (err.response && err.response.status === 429) {
        return await apiRequest(uri, {
          ...config,
          delay: 5000,
        });
      }
    }

    return null;
  }
}

export const fetchUser = async (id: string, config: RequestConfig) => {
  return apiRequest<APIUser>(`/users/${id}`, config);
};

interface BillingCountryResponse {
  country_code: string;
}

export const fetchBillingCountry = async (config: RequestConfig) => {
  return apiRequest<BillingCountryResponse>(
    "/users/@me/billing/country-code",
    config,
  );
};
