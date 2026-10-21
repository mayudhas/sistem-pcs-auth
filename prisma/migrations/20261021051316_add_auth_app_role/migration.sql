-- CreateTable
CREATE TABLE "auth_app_role" (
    "role_id" UUID NOT NULL,
    "app_id" VARCHAR(50) NOT NULL,
    "role_code" VARCHAR(50) NOT NULL,
    "role_nama" VARCHAR(100) NOT NULL,
    "role_deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "auth_app_role_pkey" PRIMARY KEY ("role_id")
);

-- CreateIndex
CREATE INDEX "auth_app_role_app_id_idx" ON "auth_app_role"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_app_role_app_id_role_code_key" ON "auth_app_role"("app_id", "role_code");

-- AddForeignKey
ALTER TABLE "auth_app_role" ADD CONSTRAINT "auth_app_role_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "auth_app"("app_id") ON DELETE CASCADE ON UPDATE CASCADE;
