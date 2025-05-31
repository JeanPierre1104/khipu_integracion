// Tipos para el Cliente Web de Khipu (KWS)
// Basado en la documentación oficial de Khipu

export interface KhipuWebOptions {
  mountElement: HTMLElement;
  modal: boolean;
  modalOptions?: {
    maxWidth: number;
    maxHeight: number;
  };
  options?: {
    style?: {
      primaryColor?: string;
      fontFamily?: string;
    };
    skipExitPage?: boolean;
  };
}

export interface KhipuWebResult {
  operationId: string;
  exitTitle: string;
  exitMessage: string;
  exitUrl: string;
  result: 'OK' | 'ERROR' | 'WARNING' | 'CONTINUE';
  failureReason?: string;
  continueUrl?: string;
  events: Array<{
    timestamp: string;
    step: string;
    description: string;
  }>;
}

export type KhipuWebCallback = (result: KhipuWebResult) => void;

// Interfaz para el objeto Khipu global
export interface KhipuWeb {
  startOperation(paymentId: string, callback: KhipuWebCallback, options: KhipuWebOptions): void;
  close(): void;
  restart(): void;
}

// No necesitamos declaración global aquí ya que existe en khipu.ts
// La declaración específica se maneja en tiempo de ejecución

export {};
