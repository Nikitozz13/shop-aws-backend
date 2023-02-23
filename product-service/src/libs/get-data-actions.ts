import { ProductSchema } from '@models/Product';
import mockProducts from '@mocks/products';

const getProducts: () => Promise<Array<ProductSchema>> = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(mockProducts), 0);
  })
}

export {
  getProducts,
}
