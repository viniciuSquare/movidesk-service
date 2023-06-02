import { Controller, Get, Body, Patch, Param, Post, Query, Render } from '@nestjs/common';
import { AWSReportService } from './services/awsReport.service';
import { AWSMetricsFileHandler } from './handlers/AWSMetricsHandler';
import { MetricsXLSXReportService } from './services/MetricsXSLX.service';
import { MetricsService } from './services/Metrics.service';
import { metricsByDashboardName } from './Metadata/MetricsByDashboardName';

/**
 * Controller to handle awsReport requests
 * @class AWSReportController
 */
@Controller('aws_report/')
export class AWSReportController {
  /**
   * Constructor
   * @param awsReportService awsReport Service to handle requests
   */
  constructor(private readonly awsReportService: AWSReportService) { }

  @Get()
  @Render('index')
  root() {
    return {
      dashboards: metricsByDashboardName,
      callback: this.consoleSomeshit,
    }
  }

  consoleSomeshit() {
    console.log(" is someshit");
  }

  /**
   * Route to update a ticket from awsReport
   * @param id Ticket ID
   * @param updateawsReportDto Ticket data to update
   * @returns Updated ticket
   */
  @Post('/handle-files')
  async handleUploadedFile(
    @Query('command') command: string,
    @Body() body: any,
  ) {
    console.log(body)
    if (command == 'save-metrics') {
      return this.persistUploadedFileMetrics(body.file);
    } else if (command == 'get-excel') {
      return this.uploadedFileXslxReport(body.file);
    } else {
      throw new Error('Invalid command');
    }
  }

  async uploadedFileXslxReport(file: any) {
    const report = new AWSMetricsFileHandler(
      file.name,
      'upload',
      file.data,
    );
    const service = new MetricsXLSXReportService(report);
    service.processMetricsIntoDailySheets();
    return {
      statusCode: 204,
      message: service.getReportWeekFormula(),
    };
  }

  async persistUploadedFileMetrics(file: any) {
    const report = new AWSMetricsFileHandler(
      file.name,
      'upload',
      file.data,
    );
    await new MetricsService(report).saveMetrics();
    console.log(report.fileName, ' metrics saved successfully');
    return { statusCode: 201 };
  }
}
