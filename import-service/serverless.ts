import type { AWS } from '@serverless/typescript';
import { importProductsFile, importFileParser } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    stage: 'dev',
    region: 'eu-west-2',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      S3_BUCKET: 'aws-course-shop-bucket',
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: 'arn:aws:s3:::${self:provider.environment.S3_BUCKET}',
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: 'arn:aws:s3:::${self:provider.environment.S3_BUCKET}/*',
      },
      {
        Effect: 'Allow',
        Action: 'sqs:SendMessage',
        Resource: 'arn:aws:sqs:${aws:region}:${aws:accountId}:aws-course-catalog-items-queue',
      },
    ],
    httpApi: {
      cors: true,
      authorizers: {
        basicAuthorizer: {
          type: 'request',
          name: 'basicAuthorizer',
          functionArn: 'arn:aws:lambda:${aws:region}:${aws:accountId}:function:authorization-service-dev-basicAuthorizer',
          resultTtlInSeconds: 0,
          identitySource: '$request.header.Authorization',
        },
      },
    },
  },
  // import the function via paths
  functions: {
    importProductsFile,
    importFileParser,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
