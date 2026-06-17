-- DropForeignKey
ALTER TABLE `WhatsAppMessage` DROP FOREIGN KEY `WhatsAppMessage_contactId_fkey`;

-- AlterTable
ALTER TABLE `AMCContract` ADD COLUMN `annualValue` DOUBLE NULL,
    ADD COLUMN `autoRenew` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `coveredEquipment` TEXT NULL,
    ADD COLUMN `createdById` VARCHAR(191) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `renewalDate` DATETIME(3) NULL,
    ADD COLUMN `slaPriority` VARCHAR(191) NULL,
    MODIFY `contractValue` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `coveredServices` VARCHAR(191) NULL,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `ComplaintWhatsAppLink` ADD COLUMN `autoCreated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `linkedById` VARCHAR(191) NULL,
    ADD COLUMN `ticketId` VARCHAR(191) NULL,
    MODIFY `complaintId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MaintenanceSite`
    ADD COLUMN `contactPerson` VARCHAR(191) NULL,
    ADD COLUMN `contactPhone` VARCHAR(191) NULL,
    ADD COLUMN `customerId` VARCHAR(191) NULL,
    ADD COLUMN `description` TEXT NULL,
    MODIFY `address` TEXT NULL;

-- AlterTable
ALTER TABLE `MaintenanceTicket` ADD COLUMN `actualResolutionMinutes` DOUBLE NULL,
    ADD COLUMN `assignedTeamId` VARCHAR(191) NULL,
    ADD COLUMN `closedById` VARCHAR(191) NULL,
    ADD COLUMN `customerApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `customerApprovedAt` DATETIME(3) NULL,
    ADD COLUMN `customerFeedback` TEXT NULL,
    ADD COLUMN `customerRating` INTEGER NULL,
    ADD COLUMN `customerSignature` TEXT NULL,
    ADD COLUMN `labourHours` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `materialCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `serviceCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `transportCost` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `description` TEXT NOT NULL,
    MODIFY `cancelledReason` TEXT NULL;

-- AlterTable
ALTER TABLE `MaintenanceWorkOrder`
    ADD COLUMN `materialCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `photos` VARCHAR(191) NULL,
    ADD COLUMN `serviceCost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `totalCost` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `serviceNotes` TEXT NULL,
    MODIFY `completionNotes` TEXT NULL;

-- AlterTable
ALTER TABLE `MaterialRequest` ADD COLUMN `issuedById` VARCHAR(191) NULL,
    ADD COLUMN `supervisorApprovedAt` DATETIME(3) NULL,
    ADD COLUMN `supervisorApprovedById` VARCHAR(191) NULL,
    ADD COLUMN `totalCost` DOUBLE NULL,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `SLATemplate` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    MODIFY `label` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `TechnicianProfile` ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `specializations` VARCHAR(191) NULL,
    ADD COLUMN `totalActiveJobs` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalCompletedJobs` INTEGER NOT NULL DEFAULT 0,
    MODIFY `bio` TEXT NULL;

-- AlterTable
ALTER TABLE `WhatsAppAccount` ADD COLUMN `accessToken` VARCHAR(191) NULL,
    ADD COLUMN `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `phoneNumberId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `WhatsAppBotLog` MODIFY `inputMessage` TEXT NULL,
    MODIFY `responseMessage` TEXT NULL;

-- AlterTable
ALTER TABLE `WhatsAppContact` ADD COLUMN `customerId` VARCHAR(191) NULL,
    MODIFY `notes` TEXT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `WhatsAppConversation` ADD COLUMN `internalNotes` TEXT NULL,
    ADD COLUMN `tags` VARCHAR(191) NULL,
    ADD COLUMN `ticketId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `WhatsAppMessage` ADD COLUMN `isDelivered` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `senderType` VARCHAR(191) NULL,
    ADD COLUMN `sentById` VARCHAR(191) NULL,
    MODIFY `contactId` VARCHAR(191) NULL,
    MODIFY `content` TEXT NULL;

-- AlterTable
ALTER TABLE `WhatsAppMessageTemplate` ADD COLUMN `bodyText` TEXT NULL,
    ADD COLUMN `buttons` TEXT NULL,
    ADD COLUMN `displayName` VARCHAR(191) NULL,
    ADD COLUMN `footerText` TEXT NULL,
    ADD COLUMN `headerText` TEXT NULL,
    ADD COLUMN `headerType` VARCHAR(191) NULL,
    MODIFY `content` TEXT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS `MaintenanceInvoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNo` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NULL,
    `workOrderId` VARCHAR(191) NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `labourCost` DOUBLE NOT NULL DEFAULT 0,
    `materialCost` DOUBLE NOT NULL DEFAULT 0,
    `transportCost` DOUBLE NOT NULL DEFAULT 0,
    `serviceCharges` DOUBLE NOT NULL DEFAULT 0,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `paidAmount` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `notes` TEXT NULL,
    `issuedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MaintenanceInvoice_invoiceNo_key`(`invoiceNo`),
    UNIQUE INDEX `MaintenanceInvoice_workOrderId_key`(`workOrderId`),
    INDEX `MaintenanceInvoice_invoiceNo_idx`(`invoiceNo`),
    INDEX `MaintenanceInvoice_ticketId_idx`(`ticketId`),
    INDEX `MaintenanceInvoice_workOrderId_idx`(`workOrderId`),
    INDEX `MaintenanceInvoice_customerId_idx`(`customerId`),
    INDEX `MaintenanceInvoice_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PMSchedule` (
    `id` VARCHAR(191) NOT NULL,
    `scheduleNo` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `siteId` VARCHAR(191) NULL,
    `equipmentId` VARCHAR(191) NULL,
    `assetId` VARCHAR(191) NULL,
    `scheduleType` VARCHAR(191) NOT NULL,
    `frequencyMonths` INTEGER NOT NULL DEFAULT 1,
    `assignedTechnicianId` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `lastVisitDate` DATETIME(3) NULL,
    `nextVisitDate` DATETIME(3) NULL,
    `totalVisits` INTEGER NOT NULL DEFAULT 12,
    `completedVisits` INTEGER NOT NULL DEFAULT 0,
    `autoGenerateWorkOrder` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PMSchedule_scheduleNo_key`(`scheduleNo`),
    INDEX `PMSchedule_scheduleNo_idx`(`scheduleNo`),
    INDEX `PMSchedule_customerId_idx`(`customerId`),
    INDEX `PMSchedule_siteId_idx`(`siteId`),
    INDEX `PMSchedule_assignedTechnicianId_idx`(`assignedTechnicianId`),
    INDEX `PMSchedule_nextVisitDate_idx`(`nextVisitDate`),
    INDEX `PMSchedule_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `ServiceRating` (
    `id` VARCHAR(191) NOT NULL,
    `ticketId` VARCHAR(191) NULL,
    `workOrderId` VARCHAR(191) NULL,
    `technicianProfileId` VARCHAR(191) NULL,
    `customerId` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL DEFAULT 0,
    `category` VARCHAR(191) NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ServiceRating_ticketId_idx`(`ticketId`),
    INDEX `ServiceRating_technicianProfileId_idx`(`technicianProfileId`),
    INDEX `ServiceRating_category_idx`(`category`),
    INDEX `ServiceRating_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ComplaintWhatsAppLink_ticketId_idx` ON `ComplaintWhatsAppLink`(`ticketId`);

-- CreateIndex
CREATE INDEX `ComplaintWhatsAppLink_complaintId_idx` ON `ComplaintWhatsAppLink`(`complaintId`);

-- CreateIndex
CREATE INDEX `MaintenanceSite_customerId_idx` ON `MaintenanceSite`(`customerId`);

-- CreateIndex
CREATE INDEX `WhatsAppContact_customerId_idx` ON `WhatsAppContact`(`customerId`);

-- AddForeignKey
ALTER TABLE `WhatsAppContact` ADD CONSTRAINT `WhatsAppContact_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsAppMessage` ADD CONSTRAINT `WhatsAppMessage_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `WhatsAppContact`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceTicket` ADD CONSTRAINT `MaintenanceTicket_closedById_fkey` FOREIGN KEY (`closedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceSite` ADD CONSTRAINT `MaintenanceSite_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialRequest` ADD CONSTRAINT `MaterialRequest_supervisorApprovedById_fkey` FOREIGN KEY (`supervisorApprovedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialRequest` ADD CONSTRAINT `MaterialRequest_issuedById_fkey` FOREIGN KEY (`issuedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AMCContract` ADD CONSTRAINT `AMCContract_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AMCContract` ADD CONSTRAINT `AMCContract_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceInvoice` ADD CONSTRAINT `MaintenanceInvoice_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `MaintenanceTicket`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceInvoice` ADD CONSTRAINT `MaintenanceInvoice_workOrderId_fkey` FOREIGN KEY (`workOrderId`) REFERENCES `MaintenanceWorkOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceInvoice` ADD CONSTRAINT `MaintenanceInvoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceInvoice` ADD CONSTRAINT `MaintenanceInvoice_issuedById_fkey` FOREIGN KEY (`issuedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PMSchedule` ADD CONSTRAINT `PMSchedule_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PMSchedule` ADD CONSTRAINT `PMSchedule_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `MaintenanceSite`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PMSchedule` ADD CONSTRAINT `PMSchedule_assignedTechnicianId_fkey` FOREIGN KEY (`assignedTechnicianId`) REFERENCES `TechnicianProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PMSchedule` ADD CONSTRAINT `PMSchedule_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServiceRating` ADD CONSTRAINT `ServiceRating_technicianProfileId_fkey` FOREIGN KEY (`technicianProfileId`) REFERENCES `TechnicianProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
