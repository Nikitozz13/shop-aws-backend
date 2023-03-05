import { v4 as uuidv4 } from 'uuid';
import { middyfy } from '@libs/lambda';
import { formatJSONResponse } from '@libs/api-gateway';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { createProduct as createProductRequest } from '@libs/dynamo-service';
import { Product } from '@models/Product';

import schema from './schema';

class InvalidProductDataError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidProductDataError";
  }
}

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    console.log('Dynamo:event:createProduct', event);

    const { title, description = '', price } = event.body;
    if (!title || !description || !price) {
      throw new InvalidProductDataError('Product data is invalid');
    }

    const uuid = uuidv4();
    const mockProduct: Product = {
      id: uuid,
      title,
      description,
      price,
    };
    const result = await createProductRequest(mockProduct);
    console.log('Dynamo:result:createProduct', result);

    return formatJSONResponse(result);
  } catch (e) {
    if (e instanceof InvalidProductDataError) {
      return formatJSONResponse({ error: e.message }, 400);
    }
    return formatJSONResponse({ error: e.message }, 500);
  }
};

export const main = middyfy(createProduct);
