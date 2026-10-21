-- CreateTable
CREATE TABLE "auth_account" (
    "auth_id" UUID NOT NULL,
    "auth_username" VARCHAR(100) NOT NULL,
    "auth_password_hash" VARCHAR(255) NOT NULL,
    "auth_is_active" BOOLEAN NOT NULL DEFAULT true,
    "auth_created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auth_updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_account_pkey" PRIMARY KEY ("auth_id")
);

-- CreateTable
CREATE TABLE "auth_app" (
    "app_id" VARCHAR(50) NOT NULL,
    "app_nama" VARCHAR(255) NOT NULL,
    "app_deskripsi" TEXT,
    "app_redirect_uri" VARCHAR(255),
    "app_is_active" BOOLEAN NOT NULL DEFAULT true,
    "app_created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "app_updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_app_pkey" PRIMARY KEY ("app_id")
);

-- CreateTable
CREATE TABLE "auth_account_app" (
    "account_app_id" UUID NOT NULL,
    "auth_id" UUID NOT NULL,
    "app_id" VARCHAR(50) NOT NULL,
    "app_role" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_account_app_pkey" PRIMARY KEY ("account_app_id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "session_id" UUID NOT NULL,
    "auth_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "user_agent" VARCHAR(255),
    "ip_address" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("session_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_account_auth_username_key" ON "auth_account"("auth_username");

-- CreateIndex
CREATE INDEX "auth_account_app_auth_id_idx" ON "auth_account_app"("auth_id");

-- CreateIndex
CREATE INDEX "auth_account_app_app_id_idx" ON "auth_account_app"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_account_app_auth_id_app_id_key" ON "auth_account_app"("auth_id", "app_id");

-- CreateIndex
CREATE INDEX "auth_session_auth_id_idx" ON "auth_session"("auth_id");

-- AddForeignKey
ALTER TABLE "auth_account_app" ADD CONSTRAINT "auth_account_app_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth_account"("auth_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_account_app" ADD CONSTRAINT "auth_account_app_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "auth_app"("app_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth_account"("auth_id") ON DELETE CASCADE ON UPDATE CASCADE;
