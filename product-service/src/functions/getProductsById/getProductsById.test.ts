import * as LambdaTester from "lambda-tester";
import { main as getProductsById } from "@functions/getProductsById/handler";
import { getProductStockById } from "@libs/dynamo-service";

jest.mock('@libs/dynamo-service');

jest.mock('@libs/lambda', () => {
  return {
    middyfy: (handler) => handler
  }
});

describe("getProductsById", () => {
  test("should return needed product with status 200", async () => {
    const mockProduct = { id: "2", title: "Product 2" };
    (getProductStockById as jest.Mock).mockResolvedValueOnce(mockProduct);
    await LambdaTester(getProductsById)
      .event({pathParameters: { productId: '2' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify(mockProduct));
      });
  });

  test("should return error when product was not found", async () => {
    const errorMessage = 'Product not found';
    const expectedResult = { error: errorMessage };
    (getProductStockById as jest.Mock).mockImplementationOnce(() => Promise.reject(errorMessage));
    await LambdaTester(getProductsById)
      .event({pathParameters: { productId: '3' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(500);
        expect(result.body).toBe(JSON.stringify(expectedResult));
      });
  });
});
