import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { UsersRepository } from "@/server/repositories/usersRepository";
import { requirePermission } from "@/server/actions/authActions";
import { PERMISSIONS } from "@/server/permissions";
import { UsersClient } from "./UsersClient";

export default async function UsersPage() {
  const sessionUser = await requirePermission(PERMISSIONS.USERS_VIEW);
  const users = await UsersRepository.getUsers();

  return (
    <AppShell>
      <UsersClient initialUsers={users} currentUserId={sessionUser.id} />
    </AppShell>
  );
}
