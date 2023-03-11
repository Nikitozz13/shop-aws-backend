import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getProductStockById } from '@libs/dynamo-service';
import { InvalidProductDataError } from '@libs/errors';

import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { productId } = event.pathParameters;
    console.log('Dynamo:event:getProductsById with arguments', { productId });
    const product = await getProductStockById(productId);
    console.log('Dynamo:result:getProductsById', product);
    return formatJSONResponse(product);
  } catch (e) {
    if (e instanceof InvalidProductDataError) {
      console.log('InvalidProductDataError', e.message);
      return formatJSONResponse({ error: e.message }, 404);
    }
    return formatJSONResponse({ error: e.message }, 500);
  }
};

export const main = middyfy(getProductsById);
