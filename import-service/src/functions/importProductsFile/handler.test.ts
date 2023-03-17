import * as LambdaTester from "lambda-tester";
import { mockClient } from "aws-sdk-client-mock";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { main as importProductsFile } from "@functions/importProductsFile/handler";

const s3ClientMock = mockClient(S3Client);
const getSignedUrlMockResult = 'mocked-result';

jest.mock('@libs/lambda', () => ({
  middyfy: (handler) => handler,
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockImplementation(() => getSignedUrlMockResult),
}));

describe("importProductsFile", () => {
  const env = process.env;

  beforeEach(() => {
    s3ClientMock.reset();
    process.env = { ...env };
    s3ClientMock.on(PutObjectCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });
  });

  afterEach(() => {
    process.env = env;
  });

  test("should get correct signed URL and return status 200", async () => {
    process.env.AWS_REGION = 'region'
    process.env.S3_BUCKET = 's3_bucket'

    await LambdaTester(importProductsFile)
      .event({queryStringParameters: { name: 'test-name.csv' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify(getSignedUrlMockResult));
      });
  });

  test("should handle missing parameter and return status 500", async () => {
    await LambdaTester(importProductsFile)
      .event({queryStringParameters: { }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(500);
        expect(result.body).toBe(JSON.stringify('No parameter "name" specified'));
      });
  });

  test("should handle internal error and return status 500", async () => {
    process.env.AWS_REGION = 'region';
    process.env.S3_BUCKET = 's3_bucket';
    const errorMockMessage = 'Internal mock error me';
    (getSignedUrl as jest.Mock).mockImplementationOnce(() => {throw new Error(errorMockMessage)})

    await LambdaTester(importProductsFile)
      .event({queryStringParameters: { name: 'test-name.csv' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(500);
        expect(result.body).toBe(JSON.stringify(errorMockMessage));
      });
  });
});
