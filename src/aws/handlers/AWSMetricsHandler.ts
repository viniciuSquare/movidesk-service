import { CSVFile } from "./CSVFile";

import { QuiverProducts } from "@prisma/client";
import { DashboardMetadata } from "../shared/Types";

import { metricsByDashboardName } from "../Metadata/MetricsByDashboardName";

import { Metric } from "../models/Metric";
import { Instance } from "../models/Instance";

/**
 * Handle AWS metrics CSV report 
 * */
export class AWSMetricsFileHandler {

  private headerEndLine = 4;
  private data = '';

  metrics: Metric[] = []
  instances: Instance[] | null = null;
  dashboardDetails: DashboardMetadata | null = null;

  constructor(public fileName: string,
    private contentInputType: 'local' | 'upload' = "local",
    private dataBuffer: Buffer | null = null
  ) {}

  async feedData() {
    this.feedRawData();
    this.feedDashboardDetails();
  }

  private async feedRawData() {
    switch (this.contentInputType) {
      case 'local':
        this.data = await CSVFile.getDataFromFile(this.fileName)
        break;
      case 'upload':
        if (!this.dataBuffer)
          throw new Error("No uploaded data");
        this.data = this.dataBuffer.toString('utf8');

        break;
    }

    await this.feedDashboardDetails();
  }

  private async feedDashboardDetails() {
    const dash: DashboardMetadata = {
      dashboardName: this.dashboardName,
    }
    // get dashboard metadata
    const dashboardDetails = metricsByDashboardName
      .find(({ dashboardName }) => this.dashboardName == dashboardName)! || dash

    if (!dashboardDetails.service) {
      console.error(" ! ! ! Dashboard metadata not found by name: ", this.dashboardName);
    }
    
    this.setDashboardDetails(dashboardDetails);
  }

  setDashboardDetails(dashboardDetails: DashboardMetadata) {
    this.dashboardDetails = dashboardDetails;
  }

  async feedMetricsFromFile() {
    // console.table(this.header.map(header => this.instanceFromIdentifier(header)));
    const data = await Promise.all(
      this.rawContentArray.map(async (csvRow, line) => {
        if (line == 0) return // Skip header                

        const metricsFromCSVRow = Array.from({ length: this.header.length - 1 }, async (_, idx) => {
          const headerValidIndex = idx + 1;
          const dateStringFromRow = csvRow.split(',')[0];
          
          let instance = await this.instanceFromIdentifier(this.header[headerValidIndex]);
          if (!instance) {
            console.log("Creating instance", this.header[headerValidIndex]);
            const instanceAux = new Instance();
            instanceAux.product = this.metricsProduct;
            instanceAux.label = this.header[headerValidIndex];
            instance = instanceAux;
          }

          const metric = new Metric(
            new Date(dateStringFromRow),
            Number(Number(csvRow.split(',')[headerValidIndex]).toFixed(2)),
            this.metricsService,
            this.metricsResource,
            this.metricsProduct,
            instance
          );

          return metric
        });

        return await Promise.all(metricsFromCSVRow);
      })
    ).then((result) => result.flat().filter(data => !!data))

    data.forEach(data => data != undefined ? this.metrics.push(data) : null)

    return {
      instances: this.instances,
      header: this.header,
      metrics: this.metrics
    }
  }

  private instanceFromIdentifier(identifier: string) {
    const instance = this.instances!.find((instance) => {
      if (identifier.includes('i-')) return instance.instanceId === identifier
      else {
        const labelFormattedToCompare = instance!.label!.replace(/[\s-]/g, "").replace(/\([^()]*\)/g, '').replace(/\s/g, '').toLowerCase();
        // REMOVE COMMENTS - STRING WITHIN ()
        // const identifierFormattedToCompare = identifier.replace(/[\s-]/g, "").toLowerCase().replace(/\(.*?\)/g, "");
        const identifierFormattedToCompare = identifier.replace(/[\s-]/g, "").replace(/\([^()]*\)/g, '').replace(/\s/g, '').toLowerCase();

        const comparation = labelFormattedToCompare == identifierFormattedToCompare;

        return comparation;
      }
    });

    if (!instance) {
      console.log("Creating instance by identifier", identifier);

      const instanceAux = new Instance();
      instanceAux.product = this.metricsProduct;
      instanceAux.product = this.metricsService;
      instanceAux.label = identifier;
    }

    return instance;
  }

  // * Setters
  setInstancesDetails(instancesDetails: Instance[]) {
    this.instances = instancesDetails;
  }

  //* Getters returning treated data from CSV
  get dashboardName() {
    const nameSplit = this.fileName.split('-')
    return nameSplit.length > 5 ? `${nameSplit[0]}-${nameSplit[1]}` : nameSplit[0]
  }

  /**
   * First column head is [date,...instances ids]
   * @returns header array  
   */
  get header(): string[] {
    const headerLines = this.rawDataArray.slice(0, this.headerEndLine);

    const instancesData = headerLines[3].split(',');

    const header = instancesData
      .map(label => {
        if (label.includes("InstanceId") || label.includes("host")) {
          const labelHolder = label.includes("InstanceId") ? "InstanceId" : "host"

          const startIdx = label.indexOf(labelHolder) + labelHolder.length + 1;
          const endIdx = startIdx + label.slice(startIdx, label.length).indexOf(' ');

          return label.slice(startIdx, endIdx);
        }

        return "Data/Hora"
      })
    return header
  }

  get region() {
    const headerLines = this.rawDataArray.slice(0, this.headerEndLine);
    const startIdx = headerLines[3].indexOf("Full label,") + "Full label,".length
    const endIdx = headerLines[3].indexOf(":AWS/EC2") > 0 ? headerLines[3].indexOf(":AWS/EC2") : headerLines[3].indexOf(":CWAgent")

    const instancesData = headerLines[3].slice(startIdx, endIdx);

    return instancesData
  }

  get metricsResource() {
    return this.dashboardDetails!.resource

  }

  get metricsService() {
    return this.dashboardDetails!.service

  }

  get metricsProduct(): QuiverProducts | undefined {
    return this.dashboardDetails!.product as QuiverProducts

  }

  // Filtering business period - weekdays, from 08h to 21h
  getMetricsOnValidPeriod(): Metric[] {
    let acumulator: {
      notBusinessDay: Metric[], notBusinessHour: Metric[], validPeriod: Metric[]
    }

    const businessPeriodValidation = this.metrics.reduce((acc: typeof acumulator, metric) => {
      if (!metric) return acc
      if (!metric.isBusinessDay) {
        acc.notBusinessDay.push(metric);
      } else if (!metric.isBusinessHour) {
        acc.notBusinessHour.push(metric);
      } else {
        acc.validPeriod.push(metric);
      }
      return acc;
    }, { notBusinessDay: [], notBusinessHour: [], validPeriod: [] });

    const filteredByPeriod = Object.keys(businessPeriodValidation).map((key) => {
      if ((key == "notBusinessDay" || key == "notBusinessHour" || key == "validPeriod"))
        return { key, items: businessPeriodValidation[key].length }
    })

    // console.log(filteredByPeriod.filter((period) => period!.key == "validPeriod")[0]?.items, " metrics on valid period\n");

    return businessPeriodValidation.validPeriod
  }

  private get rawContentArray() {
    return this.rawDataArray.slice(this.headerEndLine, this.rawDataArray.length);
  }

  private get rawDataArray(): string[] {
    return this.data.split('\n');
  }
}