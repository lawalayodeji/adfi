import { getCustomer } from "./client";

export interface GoogleCampaign {
  id: string;
  name: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export async function listCampaigns(
  refreshToken: string,
  customerId: string
): Promise<GoogleCampaign[]> {
  const customer = getCustomer(refreshToken, customerId);

  const campaigns = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.start_date,
      campaign.end_date,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.name
    LIMIT 100
  `);

  return campaigns.map((row: any) => ({
    id: String(row.campaign.id),
    name: row.campaign.name,
    status: row.campaign.status,
    budget: (row.campaign_budget?.amount_micros ?? 0) / 1_000_000,
    startDate: row.campaign.start_date ?? "",
    endDate: row.campaign.end_date ?? "",
    impressions: Number(row.metrics?.impressions ?? 0),
    clicks: Number(row.metrics?.clicks ?? 0),
    spend: (row.metrics?.cost_micros ?? 0) / 1_000_000,
    conversions: Number(row.metrics?.conversions ?? 0),
  }));
}

export async function pauseCampaign(
  refreshToken: string,
  customerId: string,
  campaignId: string
): Promise<void> {
  const customer = getCustomer(refreshToken, customerId);
  await customer.campaigns.update([
    {
      resource_name: `customers/${customerId}/campaigns/${campaignId}`,
      status: 3, // PAUSED
    } as any,
  ]);
}

export async function enableCampaign(
  refreshToken: string,
  customerId: string,
  campaignId: string
): Promise<void> {
  const customer = getCustomer(refreshToken, customerId);
  await customer.campaigns.update([
    {
      resource_name: `customers/${customerId}/campaigns/${campaignId}`,
      status: 2, // ENABLED
    } as any,
  ]);
}

export async function createCampaign(
  refreshToken: string,
  customerId: string,
  params: {
    name: string;
    dailyBudget: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<string> {
  const customer = getCustomer(refreshToken, customerId);

  // Create budget first
  const budgetResponse = await customer.campaignBudgets.create([
    {
      name: `${params.name} Budget`,
      amount_micros: Math.round(params.dailyBudget * 1_000_000),
      delivery_method: 2, // STANDARD
    },
  ]);
  const budgetResourceName = (budgetResponse as any).results?.[0]?.resource_name ?? (budgetResponse as any)[0]?.resource_name;

  // Create campaign
  const campaignResponse = await customer.campaigns.create([
    {
      name: params.name,
      status: 3, // PAUSED — let user enable it manually
      campaign_budget: budgetResourceName,
      advertising_channel_type: 2, // SEARCH
    } as any,
  ]);
  const campaignRn = (campaignResponse as any).results?.[0]?.resource_name ?? (campaignResponse as any)[0]?.resource_name ?? "";

  return (campaignRn as string).split("/").pop() ?? "";
}

export async function getCampaignMetrics(
  refreshToken: string,
  customerId: string,
  campaignId: string,
  startDate: string,
  endDate: string
) {
  const customer = getCustomer(refreshToken, customerId);

  const rows = await customer.query(`
    SELECT
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE
      campaign.id = ${campaignId}
      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY segments.date
  `);

  return rows.map((row: any) => ({
    date: row.segments.date,
    impressions: Number(row.metrics?.impressions ?? 0),
    clicks: Number(row.metrics?.clicks ?? 0),
    spend: (row.metrics?.cost_micros ?? 0) / 1_000_000,
    conversions: Number(row.metrics?.conversions ?? 0),
  }));
}
