import type { AWS } from '@serverless/typescript';

import {
  getProductsList,
  getProductsById,
  createProduct,
  catalogBatchProcess,
} from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: [
    'serverless-auto-swagger',
    'serverless-webpack',
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'eu-west-2',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      PRODUCTS_TABLE_NAME: 'my-store-app_products',
      STOCKS_TABLE_NAME: 'my-store-app_stocks',
      CREATE_PRODUCT_TOPIC_ARN: { 'Ref': 'createProductTopic' },
    },
    iam: {
      role: {
        name: '',
        managedPolicies: ['arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess'],
        statements: [
          {
            Effect: 'Allow',
            Action: 'sns:Publish',
            Resource: '${self:provider.environment.CREATE_PRODUCT_TOPIC_ARN}',
          }
        ]
      },
    },
    httpApi: {
      cors: true,
    },
  },
  // import the function via paths
  functions: {
    getProductsList,
    getProductsById,
    createProduct,
    catalogBatchProcess,
  },
  package: { individually: true },
  custom: {
    client: {
      apiHostPath: 'ecjqmbb4ij.execute-api.eu-west-2.amazonaws.com/dev',
    },
    webpack: {
      webpackConfig: 'webpack.config.js',
      includeModules: true,
    },
    autoswagger: {
      apiType: 'httpApi',
      typefiles: ['./src/models/Product.ts'],
      generateSwaggerOnDeploy: true,
      useStage: true,
      host: "${self:custom.client.apiHostPath}",
    },
  },
  resources: {
    Resources: {
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'aws-course-catalog-items-queue',
        },
      },
      createProductTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'aws-course-create-product-topic',
          Subscription: [
            {
              Protocol: 'email',
              Endpoint: 'nikitozz_13@mail.ru',
            },
          ],
        },
      },
    }
  }
};

module.exports = serverlessConfiguration;
