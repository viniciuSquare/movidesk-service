import dayjs from "dayjs";
import { Metric } from "../../models/Metric";
import { ToolsKit } from "../../shared/Tool";
import { AWSMetricsFileHandler } from "../../handlers/AWSMetricsHandler";

export class AWSMetricsReportBaseService {

  protected metrics: Metric[] = [];

  constructor( protected report: AWSMetricsFileHandler ) {
    this.metrics = report.getMetricsOnValidPeriod()
		console.log(this.metrics.length + " metrics loaded on " + this.report.dashboardDetails?.dashboardName);
  } 

  metricsByTime() {
		const keys = Object.keys(this.metricsByDay());
		const groupedData: { [day: string]: { [key: string]: string | Date | number }[] } = {}

		keys.map((day: string) => {
			const metricsByDay = this.metricsByDay()[day]
			
			const groupByTime = ToolsKit.groupBy('date');
			const metricsGroupedByDay = groupByTime(metricsByDay); // -> 02-01-2023

			groupedData[day] = []

			Object.keys(metricsGroupedByDay).forEach( time => {
				const metricByTime: { [key: string]: Date | string | number } = {};
        
				metricByTime["Date"] = dayjs(time).format('YYYY-MM-DD HH:mm:ss') || time;
				metricsGroupedByDay[time].forEach( (metric: Metric) => {
					metricByTime[metric.instance?.label || "undefined"] = Number(metric.maximumUsage);
				})

				groupedData[day].push(metricByTime);
			})
		});
		
		return groupedData
	}

	metricsByDay(): { [key: string]: any } {
		const groupByDay = ToolsKit.groupBy('day');
		const metricsGroupedByDay = groupByDay(this.metrics);

		const metricsByDayFiltered: { [key: string]: object[] } = {}

		const days = Object.keys(metricsGroupedByDay);

		days.forEach(day => {
			metricsByDayFiltered[day] = []

			metricsByDayFiltered[day]
				.push(...metricsGroupedByDay[day].filter((metric: Metric) => metric.isBusinessHour));
		})
		return metricsByDayFiltered
	}

}