import { OutputMetricsReportProps, OutputReport } from "./OutputReport";

import * as PRO_DB_CPU_WidgetJson from '../Metadata/PRO/PRO_DB_CPU.json'
import * as PRO_DB_MEM_WidgetJson from '../Metadata/PRO/PRO_DB_MEM.json'
import * as PRO_APP_CPU_WidgetJson from '../Metadata/PRO/PRO_APP_CPU.json'
import * as PRO_APP_MEM_WidgetJson from '../Metadata/PRO/PRO_APP_MEM.json'

import { AWSService } from "../services/AWS.service";

export class PROOutputReport extends OutputReport {
  private awsService: AWSService;
  private awsCredentials = {
    accessKeyId: process.env.PRO_ACCESS_KEY_ID ? process.env.PRO_ACCESS_KEY_ID : "EMPTY",
    secretAccessKey: process.env.PRO_SECRET_ACCESS_KEY ? process.env.PRO_SECRET_ACCESS_KEY : "EMPTY"
  }

  weeksReportSheetRange = [['A1', 'O12']]

  private DBCPUSample = `=IFERROR(AVERAGE('01-02-2023'!C17;'02-02-2023'!C17;'03-02-2023'!C17);"-")`;
  private DBMemorySample = `=IFERROR(AVERAGE('01-02-2023'!I17;'02-02-2023'!I17;'03-02-2023'!I17);"-")`;
  
  private AppCPUSample = `=IFERROR(AVERAGE('01-02-2023'!C17;'02-02-2023'!C17;'03-02-2023'!C17);"-")`;
  private AppMemorySample = `=IFERROR(AVERAGE('01-02-2023'!C39;'02-02-2023'!C39;'03-02-2023'!C39);"-")`;
  
  outputReportProperties: OutputMetricsReportProps = {
    application: {
      sourceRange: 'B2:N13',
      resourceMetricsRanges: {
        cpu: {
          dataOutputRanges: 'B4:O15',
          weekMetricsStartRange: 'C17:O20',
          weekFormulaSample: this.AppCPUSample
        },
        memory:{
          dataOutputRanges: 'C26:O37',
          weekMetricsStartRange: 'C39:O42',
          weekFormulaSample: this.AppMemorySample
        }
      },
      instancesQuantity: 13
    },
    database: {
      sourceRange: 'B2:E13',
      resourceMetricsRanges: {
        cpu: {
          dataOutputRanges : 'C4:F15',
          weekMetricsStartRange: 'C17:F20',
          weekFormulaSample: this.DBCPUSample
        },
        memory: {
          dataOutputRanges: 'I4:L15',
          weekMetricsStartRange: 'I17:L20',
          weekFormulaSample: this.DBMemorySample
        }
      },
      instancesQuantity: 4
    }
  }

  constructor() {
    super("PRO");
    this.awsService = new AWSService(this.awsCredentials);
  }

  static metadataProps = {
    database: {
      memory: {
        MetricWidget: JSON.stringify(PRO_DB_MEM_WidgetJson)
      },
      cpu: {
        MetricWidget: JSON.stringify(PRO_DB_CPU_WidgetJson),

      }
    },
    application: {
      memory: {
        MetricWidget: JSON.stringify(PRO_APP_MEM_WidgetJson)
      },
      cpu: {
        MetricWidget: JSON.stringify(PRO_APP_CPU_WidgetJson)
      }
    }
  }
  
  // * AWS CloudWatch service
  async getMetricsFromCloudWatchParams(cpu = true, memory = true) {
    let data = { cpu: {}, memory: {} }
    if(cpu) {
      data.cpu = await this.awsService.getMetricsDataFromCloudWatch(this.CPUParams).then((data) => {
        console.log("DATABASE CPU DATA from CloudWatch params:\n", data, "\n\n");
        return data
      })
    }
    
    if(memory) {
      data.memory = await this.awsService.getMetricsDataFromCloudWatch(this.MemoryParams).then((data) => {
        console.log("DATABASE Memory DATA from CloudWatch params:\n", data, "\n\n");
        return data
      })

    }

    return data
  }

  private get CPUParams() {
    const params = {
      MetricDataQueries: [
        ...PRO_APP_CPU_WidgetJson.metrics.map((metricMetaData, index) => {
          return {
            Id: `m${index}CPU`,
            MetricStat: {
              Metric: {
                Namespace: "AWS/EC2",
                MetricName: "CPUUtilization",
                Dimensions: [
                  {
                    Name: "InstanceId",
                    Value: metricMetaData[3] as string
                  }
                ],
              },
              Period: 3600,
              Stat: "Maximum"
            },
            ReturnData: true
          }
        }),
      ],
      ScanBy: "TimestampAscending",
      StartTime: new Date('2023-02-01T03:00:00.000Z'),
      EndTime: new Date('2023-03-01T02:59:59.000Z')
    }

    return params
  }

  private get MemoryParams() {
    const params = {
      MetricDataQueries: [
        ...PRO_DB_MEM_WidgetJson.metrics.map((metricMetaData, index) => {
          return {
            Id: `m${index}Mem`,
            MetricStat: {
              Metric: {
                Namespace: 'AWS/EC2',
                // MetricName: 'Memory % Committed Bytes In Use',
                MetricName: 'MemoryUtilization',
                Dimensions: [
                  {
                    Name: "host",
                    Value: metricMetaData[3] as string
                  },
                  {
                    Name: "objectname",
                    Value: 'Memory'
                  },
                ],
              },
              Period: 3600,
              Stat: "Maximum",
              Unit: 'Percent'
            },
            ReturnData: true
          }
        }),
      ],
      ScanBy: "TimestampAscending",
      StartTime: new Date('2023-02-01T03:00:00.000Z'),
      EndTime: new Date('2023-03-01T02:59:59.000Z')
    }

    return params
  }

  async getMetricsFromWidgetParams() {
    // DATABASE
    await this.awsService.getMetricsDataFromWidgetImage(this.widgetImageCPUParams).then((data) => {
      console.log("DATABASE DATA from widget image params:\n", data, "\n\n");
    })

    // APPLICATION
  }

  private get widgetImageCPUParams() {
    return {
      MetricWidget: PROOutputReport.metadataProps.database.cpu.MetricWidget
    }
  }

}