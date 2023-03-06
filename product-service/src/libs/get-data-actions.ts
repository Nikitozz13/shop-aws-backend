import { ProductSchema } from '@models/Product';
import mockProducts from '@mocks/products';
import { InvalidProductDataError } from '@libs/errors';

const getProducts: () => Promise<Array<ProductSchema>> = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProducts), 0);
  })
}

const getProductById: (productId: string) => Promise<ProductSchema> = async (productId) => {
  return new Promise(async (resolve, reject) => {
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) {
      reject(new InvalidProductDataError(`Product "${productId}" not found`));
    }
    resolve(product);
  })
}

export {
  getProducts,
  getProductById,
}
