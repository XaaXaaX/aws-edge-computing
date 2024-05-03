#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { EdgeStack } from '../lib/us-east-1-stack';
import { CloudFrontStack } from '../lib/cloudfront-stack';
import { IConstruct } from 'constructs';
import { RemovalPolicyReportAspect } from '../helper/RemovalPolicyReport';

class ApplyDestroyPolicyAspect implements cdk.IAspect {
  public visit(node: IConstruct): void {
    if (node instanceof cdk.CfnResource) {
      node.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    }
  } 
}

const app = new cdk.App();
const region = process.env.CDK_DEFAULT_REGION;
const account = process.env.CDK_DEFAULT_ACCOUNT;
const appStack = new AppStack(app, AppStack.name, { stackName: `cloudfront-app-stack`,
  env: { 
    region: region,

  },
  crossRegionReferences: true
 });

const edgeStack = new EdgeStack(app, EdgeStack.name, { stackName: `cloudfront-edge-stack`,
  table: appStack.table,
  appRegion: region!,
  env: { 
    region: 'us-east-1',
  },
  crossRegionReferences: true 
});

new CloudFrontStack(app, CloudFrontStack.name, { stackName: `cloudfront-stack`,
  functionUrl: appStack.functionUrl,
  edgeFunction: edgeStack.edgeFunction,
  env: { region: region!},
  crossRegionReferences: true
});

app.synth();

cdk.Aspects.of(app).add(new ApplyDestroyPolicyAspect());
cdk.Aspects.of(app).add(new RemovalPolicyReportAspect());
