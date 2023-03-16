import csv from 'csv-parser';

export const parseCsvStream = async (stream: NodeJS.ReadableStream) => {
  const csvResult = [];
  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (data) => {
        console.log('utils:parseCsvStream:onData', data);
        csvResult.push(data);
      })
      .on('end', () => {
        console.log('utils:parseCsvStream:onEnd', csvResult);
        resolve(csvResult);
      })
      .on('error', (error) => {
        console.log('utils:parseCsvStream:onError', error);
        reject(error);
      });
  });
}