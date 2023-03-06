import * as LambdaTester from "lambda-tester";
import { main as getProductsList } from "@functions/getProductsList/handler";
import { getProducts } from "@libs/get-data-actions";

jest.mock("@libs/get-data-actions");

jest.mock('@libs/lambda', () => {
  return {
    middyfy: (handler) => handler
  }
});

describe("getProductsList", () => {
  const mockProducts = [{ id: "1", title: "Product 1" }, { id: "2", title: "Product 2" }];

  beforeAll(() => {
    (getProducts as jest.Mock).mockResolvedValue(mockProducts);
  });

  test("should return list of products with status 200", async () => {
    await LambdaTester(getProductsList).expectResult(
      (result) => {
        expect(result.statusCode).toBe(200);
        expect(result.body).toBe(JSON.stringify(mockProducts));
      }
    );
  });
});
