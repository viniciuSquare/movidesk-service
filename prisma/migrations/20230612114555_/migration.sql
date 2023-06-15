/*
  Warnings:

  - You are about to alter the column `timeSpent` on the `ActionTimes` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `ActionTimes` MODIFY `timeSpent` DOUBLE NOT NULL;
