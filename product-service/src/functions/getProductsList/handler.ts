import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { getProductStocks } from '@libs/dynamo-service';

import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  const products = await getProductStocks();
  console.log('Dynamo:result:products', products);
  return formatJSONResponse(products);
};

export const main = middyfy(getProductsList);
