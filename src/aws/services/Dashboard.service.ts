import { AWSDashboardDetails } from "@prisma/client";

import { prisma } from "./prisma";
import { DashboardMetadata } from "../shared/Types";

export class DashboardsService {

  async getMetadataFromReport(dashboardName: string): Promise<DashboardMetadata> {
    console.log('Query dashboard details on report ', dashboardName,'\n')

    const dashboardMetadata = await prisma.aWSDashboardDetails.findFirst({
      where: {
        dashboardName
      }
    });

    if(!dashboardMetadata)
      throw console.error(dashboardName, dashboardMetadata);

    return {
      dashboardName: dashboardMetadata.dashboardName,
      product: dashboardMetadata.product,
      service: dashboardMetadata.service,
      resource: dashboardMetadata.resource
    };
  }
}