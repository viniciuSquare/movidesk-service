import { Module } from "@nestjs/common";
import { AWSReportService } from "./services/awsReport.service";
import { AWSReportController } from "./awsReport.controller";

@Module({
    providers: [ AWSReportService ],
    controllers: [ AWSReportController ],
})
export class AWSModule {}