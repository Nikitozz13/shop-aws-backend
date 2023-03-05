import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getProductStocks } from '@libs/dynamo-service';

import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    const products = await getProductStocks();
    console.log('Dynamo:result:products', products);
    return formatJSONResponse(products);
  } catch (e) {
    return formatJSONResponse({ error: e }, 500);
  }
  
};

export const main = middyfy(getProductsList);
