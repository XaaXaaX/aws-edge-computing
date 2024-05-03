import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join, resolve } from 'path';
import { LambdaConfiguration } from '../helper/lambda-nodejs';
import { Architecture } from 'aws-cdk-lib/aws-lambda';

export interface EdgeStackProps extends StackProps {
  table: ITable;
  appRegion: string;
}

export class EdgeStack extends Stack {
  readonly edgeFunction: NodejsFunction;
  constructor(scope: Construct, id: string, props: EdgeStackProps) {
    super(scope, id, props);

    this.edgeFunction = new NodejsFunction(this, 'Function', {
      entry: resolve(join(__dirname, '../../src/edge/index.ts')),
      handler: 'handler',
      ...LambdaConfiguration,
      architecture: Architecture.X86_64,
      memorySize: 128,
      timeout: Duration.seconds(5),
    });

    props.table.grantReadData(this.edgeFunction);
  }
}
