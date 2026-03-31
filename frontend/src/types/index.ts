export interface StatisticItem {
  id: string;
  label: string;
  value: number;
  icon: "users" | "reports" | "consultations" | "experience";
}

export interface Notification {
  id: number;
  name: string;
  action: string;
  time: string;
  initials: string;
}
