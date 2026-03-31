export interface StatisticItem {
  id: string;
  label: string;
  value: number;
  icon: "users" | "reports" | "consultations" | "experience";
}

export interface Appointment {
  id: number;
  name: string;
  disease: string;
  date: string;
  time: string;
  initials: string;
}

export interface Notification {
  id: number;
  name: string;
  action: string;
  time: string;
  initials: string;
}

export interface NavigationItem {
  id: string;
  label: string;
}
