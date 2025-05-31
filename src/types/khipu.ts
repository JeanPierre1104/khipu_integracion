// Khipu Web Client Type Definitions

export interface KhipuEvent {
  type: string;
  data?: unknown;
  error?: string;
  message?: string;
}

export interface KhipuModalOptions {
  modal: boolean;
  style?: {
    primaryColor?: string;
    fontFamily?: string;
    headerHeight?: string;
  };
}

export interface PaymentResult {
  operationId: string;
  exitTitle: string;
  exitMessage: string;
  exitUrl: string;
  result: 'OK' | 'ERROR' | 'WARNING' | 'CONTINUE';
  failureReason?: string;
  continueUrl?: string;
  events: unknown[];
}

export interface KhipuInstance {
  startOperation: (
    paymentId: string,
    callback: (result: PaymentResult) => void, 
    options?: unknown
  ) => void;
}

export interface KhipuWebClient {
  instance?: () => KhipuInstance;
  startOperation?: (
    paymentId: string,
    callback: (result: unknown) => void,
    options?: unknown
  ) => void;
}

// Payment API Types
export interface PaymentResponse {
  payment_id: string;
  payment_url: string;
  simplified_transfer_url: string;
  transfer_url: string;
  app_url: string;
  ready_for_terminal: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  subject: string;
  body?: string;
  transaction_id?: string;
  custom?: string;
  notify_url?: string;
  return_url?: string;
  cancel_url?: string;
  picture_url?: string;
  notify_api_version?: string;
  expires_date?: string;
  send_email?: boolean;
  payer_email?: string;
  send_reminders?: boolean;
  responsible_user_email?: string;
  fixed_payer_personal_identifier?: string;
  integrator_fee?: number;
  collect_account_uuid?: string;
  confirm_timeout_date?: string;
  mandatory_payment_method?: string;
}

export interface NotificationPayment {
  payment_id: string;
  payment_url: string;
  simplified_transfer_url: string;
  transfer_url: string;
  app_url: string;
  ready_for_terminal: boolean;
  notification_token: string;
  receiver_id: number;
  conciliation_date: string;
  subject: string;
  amount: number;
  currency: string;
  status: string;
  status_detail: string;
  body: string;
  picture_url: string;
  receipt_url: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  notify_api_version: string;
  expires_date: string;
  attachment_urls: string[];
  bank: string;
  bank_id: string;
  payer_name: string;
  payer_email: string;
  personal_identifier: string;
  bank_account_number: string;
  out_of_date_conciliation: boolean;
  transaction_id: string;
  custom: string;
  responsible_user_email: string;
  send_reminders: boolean;
  send_email: boolean;
  payment_method: string;
}

// Global Window types - Module Augmentation
declare global {
  interface Window {
    Khipu?: unknown;
    KWS?: unknown;
    khipu?: unknown;
    kws?: unknown;
    KHIPU?: unknown;
  }
}

// Ensure this file is treated as a module
export {};
