import { DynamoDB } from 'aws-sdk';
import { Product, Stock, ProductStock } from '@models/Product';

const joinArrays = ({ a, b, idName, foreignIdName }) => {
  const map = {};
  a.forEach((item) => {
    map[item[idName]] = item;
  })
  console.log('map:a', map);
  b.forEach((item) => {
    const { [foreignIdName]: id, ...rest } = item;
    if (map[id]) {
      map[id] = { ...map[id], ...rest }
    }
  })
  console.log('map:b', map);
  console.log('map:values', Object.values(map));
  return Object.values(map);
}

class DynamoService {
  private static dynamo = new DynamoDB.DocumentClient();
  private static productsTableName = process.env.PRODUCTS_TABLE_NAME
  private static stocksTableName = process.env.STOCKS_TABLE_NAME

  static async scan<T>(tableName: string) {
    const result = await DynamoService.dynamo.scan({
      TableName: tableName
    }).promise();
    return result.Items as Array<T>;
  }

  static getProducts = async () => {
    return DynamoService.scan<Product>(DynamoService.productsTableName)
  }
  
  static getStocks = async () => {
    return DynamoService.scan<Stock>(DynamoService.stocksTableName)
  }

  static getProductStocks = async () => {
    const [products, stocks] = await Promise.all([ DynamoService.getProducts(), DynamoService.getStocks() ]);
    const productStocks = joinArrays({
      a: products,
      b: stocks,
      idName: 'id',
      foreignIdName: 'product_id',
    }) as Array<ProductStock>;
    return productStocks;
  }
}

const getProductStocks: () => Promise<Array<ProductStock>> = async () => {
  return await DynamoService.getProductStocks();
}

const getProductStockById: (productId: string) => Promise<ProductStock> = async (productId) => {
  return new Promise(async (resolve, reject) => {
    const products = await getProductStocks();
    const product = products.find(p => p.id === productId);
    if (!product) {
      reject(`Product "${productId}" not found`);
    }
    resolve(product);
  })
}

export {
  getProductStocks,
  getProductStockById,
}
