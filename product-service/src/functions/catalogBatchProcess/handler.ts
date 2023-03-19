import { SQSEvent, SQSHandler } from 'aws-lambda';

const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  console.log('SQSHandler:event:catalogBatchProcess', event);

  try {
    const payload = event.Records[0];
    console.log('SQSHandler:event:eventRecordBody', JSON.stringify(payload));

    console.log('SQSHandler:result: function execution completed with success');
  } catch (e) {
    throw new Error('Error occured during event processing', e.message);
  }
};

export const main = catalogBatchProcess;
