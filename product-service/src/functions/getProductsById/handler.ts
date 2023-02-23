import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getProductById } from '@libs/get-data-actions';

import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const product = await getProductById(productId);
    return formatJSONResponse(product);
  } catch (e) {
    return formatJSONResponse({
      error: e
    });
  }
};

export const main = middyfy(getProductsById);
