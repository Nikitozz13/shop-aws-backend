import { SQSEvent, SQSHandler } from 'aws-lambda';

const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log('SQSHandler:event:catalogBatchProcess', event);

  try {
    for (const record of event.Records) {
      console.log('Record: ', record);
    }

    console.log('SQSHandler:result: function execution completed with success');
  } catch (e) {
    throw new Error('Error occured during event processing', e.message);
  }
};

export const main = catalogBatchProcess;
