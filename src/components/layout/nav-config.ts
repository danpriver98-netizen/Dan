import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  MessagesSquare,
  Wallet,
  CalendarCheck,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** show in the mobile bottom bar */
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/contacts", label: "Contacts", icon: Users, mobile: true },
  { href: "/properties", label: "Properties", icon: Building2, mobile: true },
  { href: "/matching", label: "Matching", icon: Target, mobile: true },
  { href: "/communication", label: "Comms", icon: MessagesSquare },
  { href: "/finance", label: "Finance BI", icon: Wallet, mobile: true },
  { href: "/tasks", label: "Task Board", icon: ListTodo },
  { href: "/appointments", label: "Appointments", icon: CalendarCheck },
];
