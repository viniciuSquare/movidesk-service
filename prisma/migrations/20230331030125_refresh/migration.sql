-- CreateTable
CREATE TABLE `metrics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `resource` ENUM('CPU', 'Memory') NULL,
    `service` ENUM('Application', 'Database') NULL,
    `instanceId` INTEGER NOT NULL,
    `maximumUsage` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `period` ENUM('DIA', 'NORMAL', 'PICO', 'NOTURNO') NULL,
    `product` ENUM('PRO', 'PLUS') NULL,

    UNIQUE INDEX `metrics_resource_service_instanceId_date_key`(`resource`, `service`, `instanceId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instances_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NULL,
    `instanceId` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `product` VARCHAR(191) NULL,
    `service` VARCHAR(191) NULL,
    `instanceType` VARCHAR(191) NULL,
    `keyName` VARCHAR(191) NULL,
    `platform` VARCHAR(191) NULL,
    `tags` JSON NULL,
    `privateIpAddress` VARCHAR(191) NULL,
    `publicIpAddress` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aws_dashboard_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dashboardName` VARCHAR(191) NOT NULL,
    `service` ENUM('Application', 'Database') NOT NULL,
    `resource` ENUM('CPU', 'Memory') NOT NULL,
    `product` ENUM('PRO', 'PLUS') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `metrics` ADD CONSTRAINT `metrics_instanceId_fkey` FOREIGN KEY (`instanceId`) REFERENCES `instances_details`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
