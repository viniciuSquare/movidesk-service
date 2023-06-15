-- CreateTable
CREATE TABLE `Ticket` (
    `ticketNumber` INTEGER NOT NULL,
    `ownerName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `ticketCreatedDate` DATETIME(3) NOT NULL,
    `ticketLastUpdate` DATETIME(3) NOT NULL,
    `teamId` INTEGER NOT NULL,
    `ticketResolvedIn` DATETIME(3) NOT NULL,

    PRIMARY KEY (`ticketNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActionTimes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `person` VARCHAR(191) NOT NULL,
    `timeSpent` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `ticketNumber` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ActionTimes` ADD CONSTRAINT `ActionTimes_ticketNumber_fkey` FOREIGN KEY (`ticketNumber`) REFERENCES `Ticket`(`ticketNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;
