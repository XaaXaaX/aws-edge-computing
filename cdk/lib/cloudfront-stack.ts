import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { AllowedMethods, CachePolicy, Distribution, HttpVersion, LambdaEdgeEventType, OriginRequestPolicy, PriceClass, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { FunctionUrlOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { FunctionUrl } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export interface CloudFrontStackProps extends StackProps {
  functionUrl: FunctionUrl;
  edgeFunction: NodejsFunction;
}

export class CloudFrontStack extends Stack {
  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    new Distribution(this, 'Distribution', {
      enabled: true,
      priceClass: PriceClass.PRICE_CLASS_100,
      errorResponses: [
        {httpStatus: 400, ttl: Duration.seconds(0)},
        {httpStatus: 403, ttl: Duration.seconds(0)},
        {httpStatus: 404, ttl: Duration.seconds(0)},
        {httpStatus: 500, ttl: Duration.seconds(0)},
        {httpStatus: 502, ttl: Duration.seconds(0)},
        {httpStatus: 503, ttl: Duration.seconds(0)},
        {httpStatus: 504, ttl: Duration.seconds(0)},
      ],
      defaultBehavior: {
        origin: new FunctionUrlOrigin(props.functionUrl),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        edgeLambdas: [
          {
            functionVersion: props.edgeFunction.currentVersion,
            eventType: LambdaEdgeEventType.VIEWER_REQUEST,
            includeBody: true,
          }
        ]
      },
      httpVersion: HttpVersion.HTTP2_AND_3,
    });

    
  }
}
