import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('S3:importProductsFile:event', event.queryStringParameters);
  
  try {
    const { name } = event.queryStringParameters;
    const resultUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/uploaded/${name}`;

    const s3client = new S3Client({ region: process.env.AWS_REGION })
    const s3Response = await s3client.send(new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: '',
    }));

    console.log('S3:importProductsFile:result', s3Response);

    return formatJSONResponse(resultUrl);
  } catch (e) {
    return formatJSONResponse(e.message, 500);
  }
};

export const main = middyfy(importProductsFile);
