import * as LambdaTester from "lambda-tester";
import { main as getProductsList } from "@functions/getProductsList/handler";
import { getProductStocks } from "@libs/dynamo-service";

jest.mock("@libs/dynamo-service");

jest.mock('@libs/lambda', () => {
  return {
    middyfy: (handler) => handler
  }
});

describe("getProductsList", () => {
  const mockProducts = [{ id: "1", title: "Product 1" }, { id: "2", title: "Product 2" }];

  beforeEach(() => {
    (getProductStocks as jest.Mock).mockClear().mockResolvedValue(mockProducts);
  });

  test("should return list of products with status 200", async () => {
    await LambdaTester(getProductsList).expectResult(
      (result) => {
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify(mockProducts));
      }
    );
  });

  test("should handle internal error with status 500", async () => {
    const errorMessage = 'Internal Error';
    const expectedResult = { error: errorMessage };
    (getProductStocks as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error(errorMessage)));
    await LambdaTester(getProductsList)
      .expectResult((result) => {
        expect(result.statusCode).toBe(500);
        expect(result.body).toBe(JSON.stringify(expectedResult));
      }
    );
  });
});
