/* Triago notifications service: renders generated and delivery-aware backend notification state. */
import { request } from "./client";
import type { Notification } from "./types";

export async function getNotifications(): Promise<Notification[]> {
  return (await request<{ notifications: Notification[] }>("/api/notifications")).notifications;
}

export async function markNotificationsRead(): Promise<number> {
  return (await request<{ updated: number }>("/api/notifications/mark-read", { method: "POST" })).updated;
}
