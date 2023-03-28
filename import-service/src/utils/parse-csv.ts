import csv from 'csv-parser';

export const parseCsvStream = async (stream: NodeJS.ReadableStream) => {
  const csvResult = [];
  return new Promise<any[]>((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (data) => {
        csvResult.push(data);
      })
      .on('end', () => {
        resolve(csvResult);
      })
      .on('error', (error) => {
        console.log('utils:parseCsvStream:onError', error);
        reject(error);
      });
  });
}