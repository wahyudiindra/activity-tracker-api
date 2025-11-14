-- CreateIndex
CREATE INDEX "api_logs_client_id_timestamp_idx" ON "api_logs"("client_id", "timestamp");
