#!/usr/bin/env node

import { App, RemovalPolicy, Tags } from 'aws-cdk-lib';
import { s3Stack } from '../lib/stacks/s3-stack';
import { CloudFrontStack } from '../lib/stacks/cloudfront-stack';

const app = new App();

/* Tags Configuration - Helpful for Billing / Permissions */
const tagKey = 'application';
const tagValue = 'MyNCR DAM';
Tags.of(app).add(tagKey, tagValue);

const s3BucketStack = new s3Stack(app, 's3BucketStack', {
	terminationProtection: false,

	/* S3 Configuration */
	s3AutoDeleteObjects: false,
	s3BucketRemovalPolicy: RemovalPolicy.RETAIN,

});

const cloudfrontStack = new CloudFrontStack(app, 'cloudFrontStack', {
	/* Environment Configuration */
	terminationProtection: false,
	crossRegionReferences: true,


	/* S3 Configuration */
	originBucketName: s3BucketStack.s3Bucket.bucketName
});