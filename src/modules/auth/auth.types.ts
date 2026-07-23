export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    role: 'customer' | 'staff' | 'admin';
    telegramId: string;
    telegramUsername: string | null;
    telegramPhone: string | null;
    telegramPhoto: string | null;
    notifyViaTelegram: boolean;
    createdAt: string;
  };
  needsPassword?: boolean;
  telegramId?: string;
}

export interface OidcInitResponse {
  success: boolean;
  authorizationUrl: string;
}

export interface TelegramTokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

export interface AuthPayload {
  userId: string;
  role: 'customer' | 'staff' | 'admin';
}
