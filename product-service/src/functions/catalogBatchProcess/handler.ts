import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { v4 as uuidv4 } from 'uuid';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { createProductTransaction as createProductRequest } from '@libs/dynamo-service';
import { InvalidProductDataError } from '@libs/errors';

const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log('SQSHandler:event:catalogBatchProcess', event);

  try {
    const snsClient = new SNSClient({ region: process.env.AWS_REGION });

    for (const record of event.Records) {
      console.log('Record: ', record);
      
      const { title, description = '', price, count } = JSON.parse(record.body);
      if (!title || !description || !price || !count) {
        throw new InvalidProductDataError(`Product data is invalid for: ${record.body}`);
      }

      const uuid = uuidv4();
      const result = await createProductRequest(
        { id: uuid, title, description, price },
        { product_id: uuid, count }
      );
      console.log('Dynamo:result:createProductWithStock', result);
    }

    const snsResult = await snsClient.send(new PublishCommand({
      Subject: 'AWS Products creation',
      Message: 'Products have been created successfully',
      TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN,
    }));
    console.log('SNSPublishCommand:result finished with success', snsResult);

    console.log('SQSHandler:result: function execution completed with success');
  } catch (e) {
    throw new Error('Error occured during event processing', e.message);
  }
};

export const main = catalogBatchProcess;
