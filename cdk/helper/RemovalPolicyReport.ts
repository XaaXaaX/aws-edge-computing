import { IAspect, CfnResource, CfnDeletionPolicy } from "aws-cdk-lib";
import { IConstruct } from "constructs";
import { debug } from "aws-cdk/lib/logging";

interface RemovalPolicyReportItem {
    name: string;
    logicalId: string;
    deletionPolicy?: CfnDeletionPolicy;
}

export class RemovalPolicyReportAspect implements IAspect {
    public readonly resources: RemovalPolicyReportItem[] = [];
    visit(node: IConstruct): void {
        if (node instanceof CfnResource) {
            if ( node.cfnOptions.deletionPolicy !== CfnDeletionPolicy.DELETE) {                
                this.resources.push({
                    name: node.toString(),
                    logicalId: node.logicalId,
                    deletionPolicy: node.cfnOptions.deletionPolicy,
                });
            }

            debug(`Resource ${node.toString()} has a deletion policy of ${node.cfnOptions.deletionPolicy}`);

        }
    }

}