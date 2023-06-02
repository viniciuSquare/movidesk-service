import { Instance } from "../models/Instance"

export interface DashboardMetadata {
    dashboardName: string,
    product?: "PRO" | "PLUS"
    service?: "Application" | "Database",
    resource?: "CPU" | "Memory",
}

export interface MetricDetails {
    service?: "Application" | "Database",
    resource?: "CPU" | "Memory",
    product?: "PRO" | "PLUS"
}

export interface AWSDetails {
    region: string,
    instances?: Instance[]
}

export interface MetricsReportMetadata {
    period: string[],
    metricDetails: MetricDetails,
    aws: AWSDetails,
}