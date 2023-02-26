import * as LambdaTester from "lambda-tester";
import { main as getProductsById } from "@functions/getProductsById/handler";
import { getProductById } from "@libs/get-data-actions";

jest.mock("@libs/get-data-actions");

jest.mock('@libs/lambda', () => {
  return {
    middyfy: (handler) => handler
  }
});

describe("getProductsById", () => {
  const mockProduct = { id: "2", title: "Product 2" };

  test("should return needed product with status 200", async () => {
    (getProductById as jest.Mock).mockResolvedValueOnce(mockProduct);
    await LambdaTester(getProductsById)
      .event({pathParameters: { productId: '2' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify(mockProduct));
      });
  });

  test("should return error when product was not found", async () => {
    (getProductById as jest.Mock).mockResolvedValueOnce(null);
    await LambdaTester(getProductsById)
      .event({pathParameters: { productId: '3' }} as any)
      .expectResult((result) => {
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify(mockProduct));
      });
  });
});
