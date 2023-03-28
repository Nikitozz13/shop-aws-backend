import 'aws-sdk-client-mock-jest';
import { mockClient } from 'aws-sdk-client-mock';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { main as catalogBatchProcess } from "@functions/catalogBatchProcess/handler";
import { createProductTransaction as createProductRequest } from "@libs/dynamo-service";
import { SQSRecord } from 'aws-lambda';

const mockedUUIDValue = '2bf0c181-b525-4c84-ab2a-38c8815a7594';
const snsClientMock = mockClient(SNSClient);

jest.mock("@libs/dynamo-service");
jest.mock('uuid', () => ({ v4: () => mockedUUIDValue }));

const mockProducts = [
  {
    title: 'Product 1 title',
    description: 'Product 1 description',
    price: 1,
    count: 1,
  },
  {
    title: 'Product 2 title',
    description: 'Product 2 description',
    price: 2,
    count: 2,
  },
];
const toRecords = (data) => data.map((d) => ({ body: JSON.stringify(d)})) as SQSRecord[];

describe("catalogBatchProcess", () => {
  const env = process.env;

  beforeEach(() => {
    (createProductRequest as jest.Mock).mockClear().mockResolvedValue({});
    snsClientMock.reset();
    process.env = {
      ...env,
      AWS_REGION: 'region',
      CREATE_PRODUCT_TOPIC_ARN: 'topicName',
    };
  });

  afterEach(() => {
    process.env = env;
  });

  test("should create product and stock successfully and send email", async () => {
    const mockProductsToSave = mockProducts.map(({ title, description, price }) => ({
      id: mockedUUIDValue, title, description, price
    }));
    const mockStocksToSave = mockProducts.map(({ count }) => ({
      product_id: mockedUUIDValue, count
    }));

    await catalogBatchProcess({ Records: toRecords(mockProducts) });

    expect(snsClientMock).toHaveReceivedCommand(PublishCommand);
    for (let i = 0; i < mockProducts.length; i++) {
      expect(createProductRequest).toHaveBeenNthCalledWith(i + 1, mockProductsToSave[i], mockStocksToSave[i]);
      expect(snsClientMock).toHaveReceivedNthCommandWith(i + 1, PublishCommand, {
        Message: JSON.stringify(mockProductsToSave[i]),
      });
    }
  });
});
