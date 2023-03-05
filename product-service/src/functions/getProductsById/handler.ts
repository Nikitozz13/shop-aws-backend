import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getProductStockById } from '@libs/dynamo-service';

import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const product = await getProductStockById(productId);
    const { PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME } = process.env;
    return formatJSONResponse({ ...product, PRODUCTS_TABLE_NAME, STOCKS_TABLE_NAME });
  } catch (e) {
    return formatJSONResponse({
      error: e
    });
  }
};

export const main = middyfy(getProductsById);
