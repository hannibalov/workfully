export const errorMessages = {
  PARAMETER_MISSING: (parameter: string) => `${parameter} is required`,
};

export class BasicError extends Error {
  constructor(message: string) {
    super(message); // Pass the message to the base Error class
    this.name = this.constructor.name; // Set the name property to the custom error class name

    // Ensure the prototype chain is correctly set for instances of this class
    Object.setPrototypeOf(this, BasicError.prototype);
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(`${message} not found`); // Pass the message to the base Error class
    this.name = this.constructor.name; // Set the name property to the custom error class name

    // Ensure the prototype chain is correctly set for instances of this class
    Object.setPrototypeOf(this, ResourceNotFoundError.prototype);
  }
}
