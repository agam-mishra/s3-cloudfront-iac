import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

// import * as sqs from 'aws-cdk-lib/aws-sqs';
/**
 * Custom Props Interface to allow passing additional
 * properties besides those defined in StackProps
 */
interface ConsumerProps extends StackProps {
	s3AutoDeleteObjects: boolean,
	s3BucketRemovalPolicy: RemovalPolicy
}

export class s3Stack extends Stack {

	public readonly s3Bucket: s3.IBucket;


	constructor(scope: Construct, id: string, props: ConsumerProps) {
		super(scope, id, props);

		const s3Bucket = new s3.Bucket(this, 'Bucket', {
			autoDeleteObjects: props.s3AutoDeleteObjects,
			removalPolicy: props.s3BucketRemovalPolicy,
			versioned: false,
			publicReadAccess: false,
			encryption: s3.BucketEncryption.S3_MANAGED,
		})

		this.s3Bucket = s3Bucket;

		//Create a Policy Document
		const s3BucketPolicy = new iam.ManagedPolicy(this, 'Policy', {
			statements: [
				new iam.PolicyStatement({
					resources: [
						`${s3Bucket.bucketArn}`,
						`${s3Bucket.bucketArn}/*`
					],
					actions: [
						"s3:GetObject",
						"s3:PutObject",
						"s3:DeleteObject",
						"s3:GetObjectVersion",
						"s3:ListBucket",
					],
					effect: iam.Effect.ALLOW,
				})
			],
			managedPolicyName: "s3BucketBucketAccess",
			description: "Allows uploading and downloading object from S3 bucket"
		});


		//Create role, to which we'll attach our Policies
		const s3BucketS3Role = new iam.Role(this, 'Role', {
			assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
			description: 'S3 bucket access',
			roleName: "s3BucketRole",
		});
		s3BucketPolicy.attachToRole(s3BucketS3Role);

		//create an IAM group
		const s3BucketAccessGroup = new iam.Group(this, 'Group', {
			groupName: "s3BucketAccess",
		});
		s3BucketPolicy.attachToGroup(s3BucketAccessGroup);




	}

}
