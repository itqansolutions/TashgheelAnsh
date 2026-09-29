import { Prisma } from "@prisma/client";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  previousState?: any;
  newState?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  static async log(
    tx: Prisma.TransactionClient,
    params: LogAuditParams
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        previousState: params.previousState ? (params.previousState as Prisma.InputJsonValue) : Prisma.JsonNull,
        newState: params.newState ? (params.newState as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  }
}
