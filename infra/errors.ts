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
export class MethodNotAllowedError extends Error {
  statusCode: number;
  action: string;

  constructor() {
    super("Método HTTP não permitido para esse endpoint.");
    this.statusCode = 405;
    this.action = "Verifique os métodos HTTP permitidos para esse endpoint.";
    this.name = "MethodNotAllowedError";
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
