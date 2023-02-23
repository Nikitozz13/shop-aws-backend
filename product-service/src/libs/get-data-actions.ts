import mockProducts from '@mocks/products';

const getProducts = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(mockProducts), 0);
  })
}

export {
  getProducts,
}
