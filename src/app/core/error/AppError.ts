export class AppError extends Error {
  constructor(public override message: string, public status?: number) {
    super(message);
    this.name = 'AppError';
  }
}
