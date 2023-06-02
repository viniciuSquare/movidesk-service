
import { AWSMetricsFileHandler } from "../handlers/AWSMetricsHandler";
import { Metric } from "../models/Metric";
import { ToolsKit } from "../shared/Tool";
import { AWSMetricsReportBaseService } from "./base/BaseMetrics.service";

export class MetricsService extends AWSMetricsReportBaseService{

  constructor(report: AWSMetricsFileHandler) { 
    super(report);
  }

  async saveMetrics() {
    const promises = this.metrics.map(async (metric) => await metric.store());

    if (promises) {
      return await Promise.all(promises)
    }

    console.log("No promise")
  }

  metricsToTable() {
    // * Presume they are about the same resource/service/product
    const instances = this.metrics.map(metric => metric.instance);
    // Group by date
    const metricsGroupedByDay = ToolsKit.groupBy('day')(this.metrics);
    const keys = Object.keys(metricsGroupedByDay);

    return keys.map(day => {
      return {
        [day]: metricsGroupedByDay[day]
          .map((metric: Metric) => {
            return {
              "Date": metric.date,
              [metric.instance?.label || "Undefined"]: metric.maximumUsage
            }

          })
      } 
    })

    // Transformed Data Structure "date": { "instanceId" : "metricValue" }
    // const metricsTransformedObj = 
  }

}