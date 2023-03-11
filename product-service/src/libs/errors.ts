export class InvalidProductDataError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidProductDataError";
  }
}