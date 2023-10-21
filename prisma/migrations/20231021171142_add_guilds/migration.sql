-- CreateTable
CREATE TABLE "DiscordGuild" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "splash" TEXT,
    "discovery_splash" TEXT,
    "features" TEXT[],
    "approximate_member_count" INTEGER,
    "approximate_presence_count" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscordGuild_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscordGuild_id_key" ON "DiscordGuild"("id");

-- AddForeignKey
ALTER TABLE "DiscordGuild" ADD CONSTRAINT "DiscordGuild_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "DiscordAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
