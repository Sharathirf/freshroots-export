import { redirect } from 'next/navigation';

export default async function AdminIntegrationServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const resolved = await params;
  const service = resolved?.service || 'cloudflare-analytics';
  redirect(`/admin?tab=integrations&setup=${encodeURIComponent(service)}`);
}
