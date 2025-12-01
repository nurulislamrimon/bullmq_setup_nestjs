export interface IEmailJob {
  to: string;
  subject: string;
  template: string;
  payload: Record<string, unknown>;
}
