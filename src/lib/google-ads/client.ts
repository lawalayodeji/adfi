import { GoogleAdsApi, Customer } from "google-ads-api";

let client: GoogleAdsApi | null = null;

function getClient(): GoogleAdsApi {
  if (!client) {
    client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });
  }
  return client;
}

export function getCustomer(refreshToken: string, customerId: string): Customer {
  return getClient().Customer({
    customer_id: customerId,
    refresh_token: refreshToken,
  });
}
