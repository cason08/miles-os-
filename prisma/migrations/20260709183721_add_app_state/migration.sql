-- CreateTable
CREATE TABLE "AppState" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastSyncedAt" TIMESTAMP(3),
    "lastProcessedGmailReceivedAt" TIMESTAMP(3),

    CONSTRAINT "AppState_pkey" PRIMARY KEY ("id")
);
