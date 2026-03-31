import type {
  Appointment,
  NavigationItem,
  Notification,
  StatisticItem,
} from "../types";

export const statisticsData: StatisticItem[] = [
  { id: "patients", label: "Patients", value: 212, icon: "users" },
  { id: "reports", label: "Reports", value: 114, icon: "reports" },
  { id: "consultations", label: "Consultations", value: 182, icon: "consultations" },
  { id: "experience", label: "Experience", value: 127, icon: "experience" },
];

export const appointmentsData: Appointment[] = [
  { id: 1, name: "Alex Smith", disease: "Hypertension", date: "05.09.21", time: "10:00", initials: "AS" },
  { id: 2, name: "Sarah Jones", disease: "Diabetes", date: "06.09.21", time: "09:00", initials: "SJ" },
  { id: 3, name: "Samuel Dutton", disease: "Asthma", date: "07.09.21", time: "10:00", initials: "SD" },
  { id: 4, name: "Carolina Gilson", disease: "Allergy", date: "10.09.21", time: "11:30", initials: "CG" },
];

export const notificationsData: Notification[] = [
  { id: 1, name: "Tom Curtis", action: "made an appointment", time: "16.09.21 at 12:00", initials: "TC" },
  { id: 2, name: "Betty Jackson", action: "made an appointment", time: "15.09.21 at 10:00", initials: "BJ" },
];

export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "calendar", label: "Calendar" },
  { id: "statistic", label: "Statistic" },
  { id: "profile", label: "Profile" },
  { id: "chat", label: "Chat" },
];
