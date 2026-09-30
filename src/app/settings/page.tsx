import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsRepository } from "@/server/repositories/settingsRepository";
import { requirePermission } from "@/server/actions/authActions";
import { PERMISSIONS } from "@/server/permissions";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  await requirePermission(PERMISSIONS.SETTINGS_VIEW);
  const settings = await SettingsRepository.getSettings();

  return (
    <AppShell>
      <SettingsClient initialSettings={settings} />
    </AppShell>
  );
}
