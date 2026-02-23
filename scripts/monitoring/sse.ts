/**
 * SSE Broadcaster
 *
 * Pushes real-time updates to connected dashboard clients via
 * Server-Sent Events. Includes auto-cleanup of dead connections.
 */

import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

interface SSEClient {
  id: string;
  res: Response;
  connectedAt: number;
}

const clients = new Map<string, SSEClient>();

function sendEvent(res: Response, event: string, data: any): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/**
 * Express handler for the SSE endpoint.
 * Sets up headers and registers the client.
 */
export function sseHandler(req: Request, res: Response): void {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Railway/nginx compatibility
  res.flushHeaders();

  const clientId = randomUUID();
  clients.set(clientId, { id: clientId, res, connectedAt: Date.now() });

  // Send initial connection confirmation
  sendEvent(res, "connected", { clientId, serverTime: new Date().toISOString(), clients: clients.size });

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(":heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
      clients.delete(clientId);
    }
  }, 30_000);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(clientId);
  });
}

/**
 * Broadcast an event to all connected clients.
 * Dead connections are automatically cleaned up.
 */
export function broadcast(event: string, data: any): void {
  for (const [id, client] of clients) {
    try {
      sendEvent(client.res, event, data);
    } catch {
      clients.delete(id);
    }
  }
}

/**
 * Get the number of connected SSE clients.
 */
export function getClientCount(): number {
  return clients.size;
}
