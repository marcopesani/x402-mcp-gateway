-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "walletAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotWallet" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "encryptedPrivateKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendingPolicy" (
    "id" TEXT NOT NULL,
    "perRequestLimit" DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    "perHourLimit" DOUBLE PRECISION NOT NULL DEFAULT 1.00,
    "perDayLimit" DOUBLE PRECISION NOT NULL DEFAULT 10.00,
    "wcApprovalLimit" DOUBLE PRECISION NOT NULL DEFAULT 5.00,
    "whitelistedEndpoints" TEXT NOT NULL DEFAULT '[]',
    "blacklistedEndpoints" TEXT NOT NULL DEFAULT '[]',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpendingPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "endpoint" TEXT NOT NULL,
    "txHash" TEXT,
    "network" TEXT NOT NULL DEFAULT 'base',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL DEFAULT 'payment',
    "userId" TEXT NOT NULL,
    "responsePayload" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'GET',
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentRequirements" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "signature" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "HotWallet_address_key" ON "HotWallet"("address");

-- CreateIndex
CREATE UNIQUE INDEX "HotWallet_userId_key" ON "HotWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SpendingPolicy_userId_key" ON "SpendingPolicy"("userId");

-- AddForeignKey
ALTER TABLE "HotWallet" ADD CONSTRAINT "HotWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendingPolicy" ADD CONSTRAINT "SpendingPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingPayment" ADD CONSTRAINT "PendingPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
