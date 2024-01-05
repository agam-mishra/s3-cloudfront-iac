## Welcome to S3 Cloudfront IAC project🚀

## This project is developed to help anyone who wants to create S3 and Cloudfront resources through IAC(Infrastructure as Code) for the AWS Application to serve content😃

## The project was developed on AWS CDK V2 in typescript language with help of AWS Documentation🤓
Refer here for AWS Documentation on 
S3 Bucket https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html
Cloudfront https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront-readme.html

## Steps to follow pre-deployment 👇🏻
1. (Optional) Get the ID of the Web ACL you want to attach with Cloudfront distribution. Web Access Control List (web ACL) gives you fine-grained control over all of the HTTP(S) web requests that your protected resource responds to.
Add the ID of the Web ACL in /lib/cloudfront-stack.ts on line 131.

Note: To create a Web ACL you can refer here [WAF IaC](https://medium.com/@agammishra05/waf-web-application-firewall-iac-for-application-load-balancers-1ae2cf43077f)

  
# Steps to follow for deployment👇🏻
1. Clone the repository
2. run npm install to install all the dependencies.
3. Configure your AWS account in CLI using aws configure (keep access key and secret key ready for this step).
4. run cdk deploy to deploy your changes.



## Useful commands😎

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk destroy`     destroys the deployed stack from your AWS account
