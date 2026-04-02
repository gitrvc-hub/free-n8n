import { env } from '$lib/server/env';

const headers = {
  'X-N8N-API-KEY': env.N8N_API_KEY,
  'Content-Type': 'application/json'
};

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: unknown[];
  connections: unknown;
  settings?: unknown;
}

export async function exportWorkflows(): Promise<N8nWorkflow[]> {
  const response = await fetch(`${env.N8N_API_URL}/api/v1/workflows`, { headers });
  if (!response.ok) {
    throw new Error(`[n8n-api] Failed to list workflows: ${response.status}`);
  }
  const body = (await response.json()) as { data: N8nWorkflow[] };
  return body.data;
}

export async function getWorkflow(workflowId: string): Promise<N8nWorkflow> {
  const response = await fetch(`${env.N8N_API_URL}/api/v1/workflows/${workflowId}`, { headers });
  if (!response.ok) {
    throw new Error(`[n8n-api] Failed to get workflow ${workflowId}: ${response.status}`);
  }
  return (await response.json()) as N8nWorkflow;
}

export async function importWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow> {
  const response = await fetch(`${env.N8N_API_URL}/api/v1/workflows`, {
    method: 'POST',
    headers,
    body: JSON.stringify(workflow)
  });
  if (!response.ok) {
    throw new Error(`[n8n-api] Failed to import workflow: ${response.status}`);
  }
  return (await response.json()) as N8nWorkflow;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${env.N8N_API_URL}/healthz`, {
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}
