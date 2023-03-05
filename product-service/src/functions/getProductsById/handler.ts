import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getProductStockById } from '@libs/dynamo-service';

import schema from './schema';

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const { productId } = event.pathParameters;
    console.log('Dynamo:event:getProductsById with arguments', { productId });
    const product = await getProductStockById(productId);
    console.log('Dynamo:result:getProductsById', product);
    return formatJSONResponse(product);
  } catch (e) {
    return formatJSONResponse({ error: e }, 500);
  }
};

export const main = middyfy(getProductsById);
