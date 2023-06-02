import { Instances } from "@prisma/client"

export class Instance {
    id?: number
    label?: string
    instanceId?: string
    instanceIdentifier?: string
    
    product?: string
    service?: string

    region?: string
    
    instanceType?: string
    keyName?: string

    platform?: string
    tags?: string

    privateIpAddress?: string
    publicIpAddress?: string

    getByInstanceId() {

    }

    fromAWS(instance: AWS.EC2.Instance ) {
        const {
            InstanceId,
            InstanceType,
            KeyName,
            Placement,
            Platform,
            PrivateIpAddress,
            PublicIpAddress,
            Tags,
        } = instance;

        this.product          = Tags?.find(tag => tag.Key == 'product')?.Value || undefined;
        this.label            = Tags?.find(tag => tag.Key == 'Name')?.Value || undefined;
        this.instanceId       = InstanceId;
        this.instanceType     = InstanceType;
        this.keyName          = KeyName;
        this.region           = Placement?.AvailabilityZone;
        this.platform         = Platform;
        this.privateIpAddress = PrivateIpAddress;
        this.publicIpAddress  = PublicIpAddress;
        this.tags             = JSON.stringify(Tags);

        return this
    }

    fromPrisma(instanceModel: Instances) {
        this.id               = instanceModel.id               || undefined
        this.product          = instanceModel.product          || undefined
        this.label            = instanceModel.label            || undefined
        this.platform         = instanceModel.platform         || undefined
        this.tags             = instanceModel.tags?.toString() || undefined
        this.region           = instanceModel.region           || undefined
        this.instanceId       = instanceModel.instanceId       || undefined
        this.instanceType     = instanceModel.instanceType     || undefined
        this.privateIpAddress = instanceModel.privateIpAddress || undefined
        this.publicIpAddress  = instanceModel.publicIpAddress  || undefined

        // for (const property in instanceModel) {
        //     if (this.hasOwnProperty(property)) {
        //         const castPropertyKey = property as keyof Instances;
        //         this[property] = instanceModel[castPropertyKey] ;
        //     }
        //   }
        
        return this
    }
}