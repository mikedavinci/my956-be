export interface WebhookEvent {
  data: {
    id: string;
    object: string;
    status: string;
    public_metadata?: Record<string, any>;
    email_address?: string;
    email_addresses?: Array<{
      email_address: string;
      primary: boolean;
    }>;
    first_name?: string;
    last_name?: string;
    created_at: number;
    updated_at: number;
  };
  object: string;
  type: string;
}
