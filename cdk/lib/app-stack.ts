import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { FunctionUrl, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join, resolve } from 'path';
import { LambdaConfiguration } from '../helper/lambda-nodejs';
import { LambdaFunction } from './lambda-resource';

export interface AppStackProps extends StackProps {}

export class AppStack extends Stack {
  readonly table: ITable;
  readonly functionUrl: FunctionUrl;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.table = new Table(this, 'Table', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      sortKey: { name: 'name', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      tableName: `${props?.stackName}-table`,
      removalPolicy: RemovalPolicy.DESTROY
  }) 

    const regionalFunction = new LambdaFunction(this, 'Function', {
      entry: resolve(join(__dirname, '../../src/regional/index.ts')),
      handler: 'handler',
      ...LambdaConfiguration,
      environment: {
        TABLE_NAME: this.table.tableName
      }
    });
    
    this.functionUrl = regionalFunction.addFunctionUrl({ authType: FunctionUrlAuthType.NONE });
    this.table.grantReadData(regionalFunction);
  }
}
