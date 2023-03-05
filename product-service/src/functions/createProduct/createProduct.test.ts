import * as LambdaTester from "lambda-tester";
import { main as createProduct } from "@functions/createProduct/handler";
import { createProduct as createProductRequest } from "@libs/dynamo-service";

const mockedUUIDValue = '2bf0c181-b525-4c84-ab2a-38c8815a7594';

jest.mock("@libs/dynamo-service");
jest.mock('uuid', () => ({ v4: () => mockedUUIDValue }));

jest.mock('@libs/lambda', () => {
  return {
    middyfy: (handler) => handler
  }
});

describe("createProduct", () => {
  beforeEach(() => {
    (createProductRequest as jest.Mock).mockClear().mockResolvedValue({});
  });

  test("should call product creation with needed data and return status 200", async () => {
    const mockProduct = { title: "Product 2", description: "Product 2 description", price: 123 };
    await LambdaTester(createProduct)
      .event({body: mockProduct} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(200);
        expect(createProductRequest).toHaveBeenCalledWith({ id: mockedUUIDValue, ...mockProduct});
        expect(result.body).toBe(JSON.stringify({}));
      }
    );
  });

  test("should handle invalid product data error with status 400", async () => {
    const mockProduct = { title: "Product 2", description: "Product 2 description" };
    await LambdaTester(createProduct)
      .event({body: mockProduct} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(400);
        expect(createProductRequest).toHaveBeenCalledTimes(0);
        expect(result.body).toBe(JSON.stringify({ error: 'Product data is invalid' }));
      }
    );
  });

  test("should handle internal error with status 500", async () => {
    const mockProduct = { title: "Product 2", description: "Product 2 description", price: 123 };
    const errorMessage = 'Internal Error';
    const expectedResult = { error: errorMessage };
    (createProductRequest as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await LambdaTester(createProduct)
      .event({body: mockProduct} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(500);
        expect(createProductRequest).toHaveBeenCalledWith({ id: mockedUUIDValue, ...mockProduct});
        expect(result.body).toBe(JSON.stringify(expectedResult));
      }
    );
  });
});
