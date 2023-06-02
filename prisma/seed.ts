import { QuiverProducts } from "@prisma/client";
import { instances } from "src/aws/Metadata/Instances";
import { metricsByDashboardName } from "src/aws/Metadata/MetricsByDashboardName";
import { prisma } from "src/aws/services/prisma";


instances.forEach(async instance => {
    const instanceExists = await prisma.instances.findFirst({ 
        where: { instanceId: { equals: instance.instanceId } } 
    })
    if(instanceExists) {
        return
    }

    await prisma.instances.create({
        data: instance
    }).finally( () => console.log("\n", instance.label, " created"));
})

metricsByDashboardName.forEach(async ({ dashboardName, service, resource, product }) => {
    const existingRecord = await prisma.aWSDashboardDetails.findFirst({
        where: {
            dashboardName
        }
    })

    if (!existingRecord && product && service && resource) {
        // To match Enum class
        const formattedProduct: QuiverProducts = product

        await prisma.aWSDashboardDetails.create({
            data: {
                dashboardName,
                service,
                resource,
                product: formattedProduct
            }
        }).then(() => {
            console.log(dashboardName, " dashboard saved")
        })
    }
});