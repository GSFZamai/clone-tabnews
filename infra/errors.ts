export class InternalServerError extends Error {
  statusCode: number;
  action: string;

  constructor({ cause }) {
    super("Falha interna do servidor.", {
      cause,
    });
    this.statusCode = 500;
    this.action = "Entrar em contato com o suporte.";
    this.name = "InternalServerError";
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
