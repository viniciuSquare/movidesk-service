import AWS from 'aws-sdk'
import { PlusOutputReport } from '../models/PlusOutputReport';
import { PROOutputReport } from '../models/ProOutputReport';
import { Injectable } from '@nestjs/common';

const credential = {
  accessKeyId: process.env.PRO_ACCESS_KEY_ID ? process.env.PRO_ACCESS_KEY_ID : "EMPTY",
  secretAccessKey: process.env.PRO_SECRET_ACCESS_KEY ? process.env.PRO_SECRET_ACCESS_KEY : "EMPTY"
}
@Injectable()
export class AWSService {
  region = 'sa-east-1';

  constructor( public credentials: typeof credential ) {  }

  cloudwatch = new AWS.CloudWatch({
    region: this.region,
    credentials: new AWS.Credentials(this.credentials)
  });

  ec2 = new AWS.EC2({
    region: this.region,
    credentials: new AWS.Credentials(this.credentials)
  });

  async getMetricsDataFromWidgetImage(params: { MetricWidget: any }) {
    const calback = (err:any, data:any)=> {
      if (err) console.log(err, err.stack);
      else console.log(data);
    }

    const data = await this.cloudwatch.getMetricWidgetImage(params)

    return data.promise()
  }

  async getMetricsDataFromCloudWatch(metricsParams: AWS.CloudWatch.GetMetricDataInput) {
    const response = await this.cloudwatch.getMetricData(metricsParams).promise();
    return response;
  }

  async describeInstancesFromEC2( instancesParams: any ) {
    this.ec2.describeInstances((err, data) => {
      const instances = data.Reservations?.map(data => data.Instances?.map(this.mapInstanceData)).flat()

      return instances
    })
  }

  mapInstanceData(instance: AWS.EC2.Instance) {
    const {
      InstanceId,
      InstanceType,
      KeyName,
      Monitoring,
      Placement,
      Platform,
      PrivateDnsName,
      PrivateIpAddress,
      PublicDnsName,
      PublicIpAddress,
      Tags,
      PlatformDetails,
      State
    } = instance
  
    const mappedData = {
      Produto: Tags?.find(tag => tag.Key == 'product')?.Value || undefined,
      Label: Tags?.find(tag => tag.Key == 'Name')?.Value || undefined,
      State: State?.Name,
      InstanceId,
      InstanceType,
      KeyName,
      Monitoring: Monitoring?.State,
      Region: Placement?.AvailabilityZone,
      Platform,
      PrivateDnsName,
      PrivateIpAddress,
      PublicDnsName,
      PublicIpAddress,
      Tags,
      PlatformDetails,
    }
  
    return mappedData;
  }

}

const params = {
  StartTime: new Date("2023-01-01"), // 1 hour ago
  EndTime: new Date(),
  MetricDataQueries: [
    {
      Id: "m1",
      MetricStat: {
        Metric: {
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [
            {
              Name: "InstanceId",
              Value: "i-093d9a60caca17d09"
            }
          ]
        },
        Period: 3600,
        Stat: "Maximum"
      },
      Label: "Cliente - ROMAP (SQL)",
      ReturnData: true
    },
    {
      Id: "m2",
      MetricStat: {
        Metric: {
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [
            {
              Name: "InstanceId",
              Value: "i-010adcf1add463467"
            }
          ]
        },
        Period: 3600,
        Stat: "Maximum"
      },
      Label: "SQL Server - 01",
      ReturnData: true
    },
    {
      Id: "m3",
      MetricStat: {
        Metric: {
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [
            {
              Name: "InstanceId",
              Value: "i-06101a321fb20fd90"
            }
          ]
        },
        Period: 3600,
        Stat: "Maximum"
      },
      Label: "SQL Server - 04",
      ReturnData: true
    },
    {
      Id: "m4",
      MetricStat: {
        Metric: {
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [
            {
              Name: "InstanceId",
              Value: "i-0d6816f40326b35f2"
            }
          ]
        },
        Period: 3600,
        Stat: "Maximum"
      },
      Label: "SQL Server - 05",
      ReturnData: true
    },
    {
      Id: "m5",
      MetricStat: {
        Metric: {
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [
            {
              Name: "InstanceId",
              Value: "i-0ead036376a9bea1c"
            }
          ]
        },
        Period: 3600,
        Stat: "Maximum"
      },
      Label: "SQL Server - 01 - GC",
      ReturnData: true
    }
  ],
  ScanBy: "TimestampDescending"
};

// cloudwatch.getMetricData(params).promise()
//   .then(async data => {
//     const metricData = data.MetricDataResults[0];
//     const instanceName = await getInstanceName(metricData.Dimensions[0].Value);
//     console.log(`InstanceName: ${instanceName} | Maximum CPU Utilization: ${metricData.Values[0]}`);
//   })
//   .catch(err => {
//     console.error(err);
//   });
