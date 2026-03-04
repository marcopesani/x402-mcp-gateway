const DEFAULT_POSTGRES_URL = "postgresql://app:app_dev_password@localhost:5432/appdb";

export const resolvePostgresUrl = () => process.env.POSTGRES_URL ?? DEFAULT_POSTGRES_URL;
