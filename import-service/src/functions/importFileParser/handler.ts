import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import  { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"
import { parseCsvStream } from '@utils/parse-csv';

const QUEUE_URL = 'https://sqs.eu-west-2.amazonaws.com/136908532975/aws-course-catalog-items-queue';

const importFileParser = async (event) => {
  console.log('S3:importFileParser:event', event);
  try {
    const s3client = new S3Client({ region: process.env.AWS_REGION });

    for (const record of event.Records) {
      const s3Data = await s3client.send(new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: record.s3.object.key,
      }));

      const sqsClient = new SQSClient({ region: process.env.AWS_REGION });

      const csvData = await parseCsvStream(s3Data.Body as NodeJS.ReadableStream);
      csvData.forEach(async (dataRow) => {
        const data = await sqsClient.send(new SendMessageCommand({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(dataRow),
        }));
        console.log("SQSClient:SendMessageCommand", data);
      });

      console.log("SQSClient:Finished");

      await s3client.send(new CopyObjectCommand({
        Bucket: process.env.S3_BUCKET,
        CopySource: process.env.S3_BUCKET + '/' + record.s3.object.key,
        Key: record.s3.object.key.replace('uploaded', 'parsed'),
      }));

      await s3client.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: record.s3.object.key,
      }));

      console.log('Parsed file "' + record.s3.object.key.split('/')[1] + '" finished');
    }
  } catch (e) {
    console.log(e.message);
  }
};

export const main = importFileParser;
