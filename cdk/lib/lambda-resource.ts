import { CompositePrincipal, ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { LambdaConfiguration } from "../helper/lambda-nodejs";
import { LogGroup, RetentionDays } from "aws-cdk-lib/aws-logs";
import { RemovalPolicy } from "aws-cdk-lib";

export interface LambdaResourceProps extends NodejsFunctionProps {
  isEdge?: boolean;
}

export class LambdaFunction extends NodejsFunction {
  
  constructor(scope: Construct, id: string, props: LambdaResourceProps) {
   
    const lambdaServiceRole = new ServicePrincipal('lambda.amazonaws.com');
    const lambdaEdgeServiceRole = new ServicePrincipal('edgelambda.amazonaws.com');
    const lambdaBasicManagedPolicy = ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole');

    const lambdaFunctionRole = new Role(scope, `${id}Role`, { 
      assumedBy: new CompositePrincipal(
        lambdaServiceRole,
        props.isEdge ? lambdaEdgeServiceRole : lambdaServiceRole
      ),
      managedPolicies: [ 
        lambdaBasicManagedPolicy,
      ]
     });

     super(scope, id, {
      entry: props.entry,
      role: lambdaFunctionRole,
      ...LambdaConfiguration,
      ...props,
      bundling: {
        ...LambdaConfiguration.bundling,
        ...props.bundling
      },
      environment: props.environment
    });

    new LogGroup(scope, `${id}LogGroup`, {
      logGroupName: `/aws/lambda/${this.functionName}`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_DAY
    });
  }
}