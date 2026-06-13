export type Group = {
  id: number;
  name: string;
  description: string;
  default_currency_code: string;
  memberships: Membership[];
};

export type Membership = {
  id: number;
  user_email: string;
  user_name: string;
  joined_at: string;
  left_at: string | null;
};

export type ImportAnomaly = {
  id: number;
  row_number: number;
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  action_taken: string;
};

export type ImportSession = {
  id: number;
  status: string;
  original_filename: string;
  report: Record<string, unknown>;
  anomalies: ImportAnomaly[];
};
