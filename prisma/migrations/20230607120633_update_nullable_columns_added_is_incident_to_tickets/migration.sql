-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `isIncident` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `ticketResolvedIn` DATETIME(3) NULL;
