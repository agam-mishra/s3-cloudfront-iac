import * as path from 'path';
import { Construct } from 'constructs';
import { Stack, StackProps, Duration, CfnOutput } from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
// import { NodeJsEdgeFunction } from '../constructs/aws-cloudfront/nodejs-edge-function';

/**
 * Custom Props Interface to allow passing additional
 * properties besides those defined in StackProps
 */
interface ConsumerProps extends StackProps {
  originBucketName: string
}

/**
 * The CloudFormation stack holding all our resources related to the CloudFront infrastructure
 */
export class CloudFrontStack extends Stack {
  public readonly distribution: cloudfront.IDistribution;

  constructor(scope: Construct, id: string, props: ConsumerProps) {
    super(scope, id, props);

    /**
     * Import S3 Buckets from S3 Stack - It has to be done this way in this instance to
     * avoid a cyclic dependency
     */
    const originBucket = s3.Bucket.fromBucketAttributes(this, 'OriginBucket', {
      bucketName: props.originBucketName,
    });

   
    //Lambda@Edge is commented for now but have to implement later on for WebP

    /**
     * Create 'Lambda@Edge' function for the Origin Request Event
     */
    // const originRequestFunction = new NodeJsEdgeFunction(this, 'OriginRequestFunction', {
    //   entry: path.resolve(__dirname, '../lambdas/edge/origin-request/index.ts'),
    //   runtime: lambda.Runtime.NODEJS_18_X,
    //   handler: 'handler',
    //   //role: originRequestRole
    // });

    /**
     * Create CloudFront Origin(s)
     */
    const oai = new cloudfront.OriginAccessIdentity(this, 'DistributionOAI', {
      comment: 'Allows access to S3 bucket!'
    });

    const s3Origin = new cloudfrontOrigins.S3Origin(originBucket, {
      originAccessIdentity: oai,
    });

    /**
     * Create an IAM Policy to allow CloudFront to access S3 objects
     */
    const policyStatement = new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:ListBucket'],
      resources: [
        originBucket.arnForObjects("*"),
        originBucket.bucketArn
      ],
      principals: [oai.grantPrincipal],
    });
    const bucketPolicy = new s3.BucketPolicy(this, 'OriginBucketPolicy', {
      bucket: originBucket,
    })
    bucketPolicy.document.addStatements(policyStatement);

    /**
     * Custom Origin Request Policy - Allows us to customize headers, cookies, and query strings
     * forwarded to the origin
     * 
     * Note: This does not effect the cache key (that is effected by the Cache policy)
     */
    const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'OriginRequestPolicy', {
      comment: 'Policy to forward custom headers / cookies to origin',
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
      headerBehavior: cloudfront.OriginRequestHeaderBehavior.none(),
      queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.none(),
    });

    /**
     * Custom Cache Policy
     */
    const cachePolicy = new cloudfront.CachePolicy(this, 'Cache Policy', {
      comment: 'Policy to customize parameters that affect the cache key',
      cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      defaultTtl: Duration.seconds(86400),
      minTtl: Duration.seconds(1),
      maxTtl: Duration.seconds(31536000),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true
    });

    /**
     * Create a new CloudFront Distribution for caching and proxying our requests to our bucket
     */
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cachePolicy,
        originRequestPolicy: originRequestPolicy,
        // edgeLambdas: [
        //   {
        //     functionVersion: originRequestFunction.currentVersion,
        //     eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        //   },
        // ]
      },
      defaultRootObject: "index.html",
      errorResponses: [
        // Uncomment below to serve custom error pages
        // {
        //   httpStatus: 404,
        //   responseHttpStatus: 404,
        //   responsePagePath: '/errors/404.html', // error pages should exist under /errors folder in S3 bucket
        //   ttl: Duration.seconds(120)
        // }
      ],
      webAclId: '' // put here the webacl created for the cloudfront distribution.
    });
    this.distribution = distribution;

    /**
     * Output the distribution's url so we can pass it to external systems
     */
    new CfnOutput(this, 'CloudFrontDomain', {
      value: "https://" + distribution.distributionDomainName
    });
  }
}