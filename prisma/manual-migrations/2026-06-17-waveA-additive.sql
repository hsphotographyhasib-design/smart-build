-- DropIndex
DROP INDEX `ComplaintWhatsAppLink_complaintId_key` ON `ComplaintWhatsAppLink`;

-- AlterTable
ALTER TABLE `AIInsight` MODIFY `description` TEXT NOT NULL,
    MODIFY `recommendations` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `AdvancePayment` MODIFY `reason` TEXT NULL;

-- AlterTable
ALTER TABLE `Announcement` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `AssetIssue` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `AssetMaintenance` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `AuditLog`
    MODIFY `oldValues` TEXT NULL,
    MODIFY `newValues` TEXT NULL;

-- AlterTable
ALTER TABLE `BOQItem`
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `BudgetChangeOrder`
    MODIFY `description` TEXT NULL,
    MODIFY `reason` TEXT NULL;

-- AlterTable
ALTER TABLE `BudgetLineItem` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `BudgetSnapshot` MODIFY `snapshotData` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `ChangeEvent` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `ChangeOrder` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `ClientComplaint` ADD COLUMN `idempotencyKey` VARCHAR(191) NULL,
    ADD COLUMN `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `resolutionDeadline` DATETIME(3) NULL,
    ADD COLUMN `responseDeadline` DATETIME(3) NULL,
    ADD COLUMN `slaBreached` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'portal',
    ADD COLUMN `ticketNumber` VARCHAR(191) NULL,
    ADD COLUMN `workflowStage` VARCHAR(191) NOT NULL DEFAULT 'received',
    MODIFY `description` TEXT NOT NULL,
    MODIFY `resolution` TEXT NULL;

-- AlterTable
ALTER TABLE `CostCode` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Customer` MODIFY `address` TEXT NULL;

-- AlterTable
ALTER TABLE `DailyNote`
    MODIFY `workDone` TEXT NULL,
    MODIFY `issues` TEXT NULL;

-- AlterTable
ALTER TABLE `DayBookEntry` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `DirectCost` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Discussion` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `DiscussionComment`
    MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Expense` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `FeatureFlag` MODIFY `description` TEXT NULL,
    MODIFY `config` TEXT NULL;

-- AlterTable
ALTER TABLE `Invoice`
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `InvoiceItem`
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `LeaveRequest` MODIFY `reason` TEXT NULL;

-- AlterTable
ALTER TABLE `MaintenanceSite`;

-- AlterTable
ALTER TABLE `MaintenanceTimeline` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `MaintenanceWorkOrder`;

-- AlterTable
ALTER TABLE `Material` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `MilestonePayment` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Notification` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `deliveredAt` DATETIME(3) NULL,
    ADD COLUMN `expiresAt` DATETIME(3) NULL,
    ADD COLUMN `link` VARCHAR(191) NULL,
    ADD COLUMN `priority` VARCHAR(191) NOT NULL DEFAULT 'normal',
    MODIFY `message` TEXT NOT NULL,
    MODIFY `data` TEXT NULL;

-- AlterTable
ALTER TABLE `OpenItem` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Payment` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Product`
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Project`
    MODIFY `description` TEXT NULL,
    MODIFY `address` TEXT NULL;

-- AlterTable
ALTER TABLE `ProjectComment` MODIFY `content` TEXT NOT NULL,
    MODIFY `mentions` TEXT NULL;

-- AlterTable
ALTER TABLE `ProjectCommitment`
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `ProjectMilestone`
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `ProjectTask` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrderItem`
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseRequest` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `PurchaseRequestItem` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `RFI` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `RFIComment` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `SalesInvoice`
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `SalesQuotation` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Session` ADD COLUMN `browser` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `deviceType` VARCHAR(191) NULL,
    ADD COLUMN `lastActivityAt` DATETIME(3) NULL,
    ADD COLUMN `operatingSystem` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `StockMovement` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `SubContractor` MODIFY `address` TEXT NULL;

-- AlterTable
ALTER TABLE `Submittal` MODIFY `specification` TEXT NULL,
    MODIFY `notes` TEXT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Supplier` MODIFY `address` TEXT NULL;

-- AlterTable
ALTER TABLE `SystemVersion` MODIFY `releaseNotes` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `WorkOrder`
    MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `crews` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `productivity_logs`
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `resource_assignments` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `resource_requests` MODIFY `reason` TEXT NULL,
    MODIFY `notes` TEXT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `skills`
    MODIFY `description` TEXT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS `QRCode` (
    `id` VARCHAR(191) NOT NULL,
    `qrId` VARCHAR(191) NOT NULL,
    `moduleType` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(191) NOT NULL,
    `referenceNo` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `token` VARCHAR(191) NOT NULL,
    `securityHash` VARCHAR(191) NOT NULL,
    `metadata` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NULL,
    `generatedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `QRCode_qrId_key`(`qrId`),
    INDEX `QRCode_moduleType_idx`(`moduleType`),
    INDEX `QRCode_recordId_idx`(`recordId`),
    INDEX `QRCode_moduleType_recordId_idx`(`moduleType`, `recordId`),
    INDEX `QRCode_token_idx`(`token`),
    INDEX `QRCode_qrId_idx`(`qrId`),
    INDEX `QRCode_generatedById_idx`(`generatedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `QRScanLog` (
    `id` VARCHAR(191) NOT NULL,
    `qrCodeId` VARCHAR(191) NOT NULL,
    `scannedById` VARCHAR(191) NULL,
    `scanType` VARCHAR(191) NOT NULL DEFAULT 'scan',
    `deviceInfo` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `location` TEXT NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `result` TEXT NULL,
    `scannedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `QRScanLog_qrCodeId_idx`(`qrCodeId`),
    INDEX `QRScanLog_scannedById_idx`(`scannedById`),
    INDEX `QRScanLog_scannedAt_idx`(`scannedAt`),
    INDEX `QRScanLog_verified_idx`(`verified`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `QRVerification` (
    `id` VARCHAR(191) NOT NULL,
    `qrCodeId` VARCHAR(191) NOT NULL,
    `attemptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL,
    `failReason` VARCHAR(191) NULL,
    `moduleType` VARCHAR(191) NULL,
    `recordId` VARCHAR(191) NULL,

    INDEX `QRVerification_qrCodeId_idx`(`qrCodeId`),
    INDEX `QRVerification_ipAddress_idx`(`ipAddress`),
    INDEX `QRVerification_attemptedAt_idx`(`attemptedAt`),
    INDEX `QRVerification_success_idx`(`success`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `QRPrintJob` (
    `id` VARCHAR(191) NOT NULL,
    `jobName` VARCHAR(191) NOT NULL,
    `moduleType` VARCHAR(191) NOT NULL,
    `template` VARCHAR(191) NOT NULL DEFAULT 'standard',
    `qrCodeIds` TEXT NOT NULL,
    `totalItems` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `QRPrintJob_createdById_idx`(`createdById`),
    INDEX `QRPrintJob_status_idx`(`status`),
    INDEX `QRPrintJob_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `QRAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `qrId` VARCHAR(191) NULL,
    `moduleType` VARCHAR(191) NULL,
    `recordId` VARCHAR(191) NULL,
    `performedBy` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `details` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `QRAuditLog_action_idx`(`action`),
    INDEX `QRAuditLog_moduleType_idx`(`moduleType`),
    INDEX `QRAuditLog_performedBy_idx`(`performedBy`),
    INDEX `QRAuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `QRTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `moduleType` VARCHAR(191) NOT NULL,
    `template` TEXT NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QRTemplate_moduleType_idx`(`moduleType`),
    INDEX `QRTemplate_isDefault_idx`(`isDefault`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `JobQueue` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `payload` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 3,
    `error` TEXT NULL,
    `nextRunAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lockedAt` DATETIME(3) NULL,
    `lockedBy` VARCHAR(191) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobQueue_status_nextRunAt_idx`(`status`, `nextRunAt`),
    INDEX `JobQueue_type_idx`(`type`),
    INDEX `JobQueue_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ComplaintInbox` (
    `id` VARCHAR(191) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `rawData` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `processedAt` DATETIME(3) NULL,
    `error` TEXT NULL,
    `complaintId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ComplaintInbox_status_idx`(`status`),
    INDEX `ComplaintInbox_source_idx`(`source`),
    INDEX `ComplaintInbox_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `SystemEvent` (
    `id` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `payload` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SystemEvent_eventType_idx`(`eventType`),
    INDEX `SystemEvent_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `SystemEvent_userId_idx`(`userId`),
    INDEX `SystemEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ClientComplaint_ticketNumber_key` ON `ClientComplaint`(`ticketNumber`);

-- CreateIndex
CREATE UNIQUE INDEX `ClientComplaint_idempotencyKey_key` ON `ClientComplaint`(`idempotencyKey`);

-- CreateIndex
CREATE INDEX `ClientComplaint_workflowStage_idx` ON `ClientComplaint`(`workflowStage`);

-- CreateIndex
CREATE INDEX `ClientComplaint_slaBreached_idx` ON `ClientComplaint`(`slaBreached`);

-- CreateIndex
CREATE INDEX `ClientComplaint_source_idx` ON `ClientComplaint`(`source`);

-- CreateIndex
CREATE INDEX `ClientComplaint_lastActivityAt_idx` ON `ClientComplaint`(`lastActivityAt`);

-- CreateIndex
CREATE INDEX `Notification_category_idx` ON `Notification`(`category`);

-- CreateIndex
CREATE INDEX `Notification_priority_idx` ON `Notification`(`priority`);

-- CreateIndex
CREATE UNIQUE INDEX `SearchHistory_userId_query_key` ON `SearchHistory`(`userId`, `query`);

-- AddForeignKey
ALTER TABLE `BudgetLineItemUpdate` ADD CONSTRAINT `BudgetLineItemUpdate_budgetLineItemId_fkey` FOREIGN KEY (`budgetLineItemId`) REFERENCES `BudgetLineItem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRCode` ADD CONSTRAINT `QRCode_generatedById_fkey` FOREIGN KEY (`generatedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRScanLog` ADD CONSTRAINT `QRScanLog_qrCodeId_fkey` FOREIGN KEY (`qrCodeId`) REFERENCES `QRCode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRScanLog` ADD CONSTRAINT `QRScanLog_scannedById_fkey` FOREIGN KEY (`scannedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRVerification` ADD CONSTRAINT `QRVerification_qrCodeId_fkey` FOREIGN KEY (`qrCodeId`) REFERENCES `QRCode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRPrintJob` ADD CONSTRAINT `QRPrintJob_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QRTemplate` ADD CONSTRAINT `QRTemplate_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
