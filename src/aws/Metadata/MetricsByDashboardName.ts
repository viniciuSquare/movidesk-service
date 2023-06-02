import { DashboardMetadata } from "../shared/Types";

// Dashboards metrics will be feed with this metadata
export const metricsByDashboardName: DashboardMetadata[] = [
  {
    dashboardName: "CPUUtilization_-_SQL_WWW",
    service: "Database",
    resource: "CPU",
    product: "PLUS"
  },
  {
    dashboardName: "Memória_SQL_WWW",
    service: "Database",
    resource: "Memory",
    product: "PLUS"
  },
  {
    dashboardName: "CPUUtilization_-_WEBs",
    service: "Application",
    resource: "CPU",
    product: "PLUS"
  },
  {
    dashboardName: "Memória_Aplicação_WEB",
    service: "Application",
    resource: "Memory",
    product: "PLUS"
  },
  {
    dashboardName: "Quiver_PRO",
    service: "Application",
    resource: "CPU",
    product: "PRO"
  },
  {
    dashboardName: "Memória_AppQuiverPRO",
    service: "Application",
    resource: "Memory",
    product: "PRO"
  },
  {
    dashboardName: "SQL_SERVER_-_CPU",
    service: "Database",
    resource: "CPU",
    product: "PRO"
  },
  {
    dashboardName: "Memória_Banco_QuiverPRO",
    service: "Database",
    resource: "Memory",
    product: "PRO"
  },

]