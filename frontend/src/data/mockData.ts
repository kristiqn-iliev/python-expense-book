import type {
  Notification,
  StatisticItem,
} from "../types";

export const statisticsData: StatisticItem[] = [
  { id: "patients", label: "Patients", value: 212, icon: "users" },
  { id: "reports", label: "Reports", value: 114, icon: "reports" },
  { id: "consultations", label: "Consultations", value: 182, icon: "consultations" },
  { id: "experience", label: "Experience", value: 127, icon: "experience" },
];

export const notificationsData: Notification[] = [
  { id: 1, name: "Tom Curtis", action: "made an appointment", time: "16.09.21 at 12:00", initials: "TC" },
  { id: 2, name: "Betty Jackson", action: "made an appointment", time: "15.09.21 at 10:00", initials: "BJ" },
];
