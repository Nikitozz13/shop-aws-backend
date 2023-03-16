import * as LambdaTester from "lambda-tester";
import { main as getProductsById } from "@functions/getProductsById/handler";
import { getProductById } from "@libs/get-data-actions";
import { InvalidProductDataError } from '@libs/errors';

jest.mock('@libs/get-data-actions');

jest.mock('@libs/lambda', () => {
  return {
    middyfy: (handler) => handler
  }
});

describe("getProductsById", () => {
  const mockProduct = { id: "2", title: "Product 2" };

  beforeEach(() => {
    (getProductById as jest.Mock).mockClear().mockResolvedValue(mockProduct);
  })

  test("should return needed product with status 200", async () => {
    (getProductById as jest.Mock).mockResolvedValueOnce(mockProduct);
    await LambdaTester(getProductsById)
      .event({pathParameters: { productId: '2' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify(mockProduct));
      });
  });

  test("should return error when product was not found with status 404", async () => {
    const errorMessage = 'Product not found';
    const expectedResult = { error: errorMessage };
    (getProductById as jest.Mock).mockImplementationOnce(() => Promise.reject(new InvalidProductDataError(errorMessage)));
    await LambdaTester(getProductsById)
      .event({pathParameters: { productId: '3' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(404);
        expect(result.body).toBe(JSON.stringify(expectedResult));
      });
  });

  test("should return internal error with status 500", async () => {
    const errorMessage = 'Internal Error';
    const expectedResult = { error: errorMessage };
    (getProductById as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await LambdaTester(getProductsById)
      .event({pathParameters: { productId: '3' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(500);
        expect(result.body).toBe(JSON.stringify(expectedResult));
      });
  });
});
