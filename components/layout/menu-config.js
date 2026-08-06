import {
  LayoutDashboard, Users, FileText, ClipboardList,
  FlaskConical, TestTubes, Settings, Shield,
  TestTube, IndianRupee, Workflow, UserCog, Beaker, Microscope, Activity, Bell, BarChart3, Database,
  Package, History, Boxes, Truck
} from "lucide-react";

export const dashboardMenuConfig = [
  {
    section: "CORE",
    icon: Database,
    items: [
      { name: "Dashboard", module: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Patients", module: "Patients", href: "/dashboard/patients", icon: Users },
      { name: "Specimens", module: "Specimens", href: "/dashboard/specimens", icon: Beaker }
    ]
  },
  {
    section: "CLINICAL PATHOLOGY",
    icon: Activity,
    items: [
      { name: "Orders", module: "Orders", href: "/dashboard/orders", icon: ClipboardList },
      { name: "Worklist", module: "Worklist", href: "/dashboard/worklist", icon: Workflow },
      { name: "Results Entry", module: "Results Entry", href: "/dashboard/results", icon: FlaskConical },
      { name: "QC Management", module: "QC Management", href: "/dashboard/qc", icon: TestTubes },
      { name: "Packages", module: "Packages", href: "/dashboard/packages", icon: Package },
      { name: "Result History", module: "Result History", href: "/dashboard/result-history", icon: History }
    ]
  },
  {
    section: "BIOHAZARD",
    icon: Activity,
    items: [
      { name: "Waste Management", module: "Waste Management", href: "/dashboard/waste", icon: Workflow },
    ]
  },
  {
    section: "ADMINISTRATION",
    icon: Settings,
    items: [
      { name: "Users", module: "Users", href: "/dashboard/users", icon: UserCog },
      { name: "Tests & Prices", module: "Tests & Prices", href: "/dashboard/test-price", icon: IndianRupee },
      { name: "Instruments", module: "Instruments", href: "/dashboard/instruments", icon: Microscope },
      { name: "Roles", module: "Roles", href: "/dashboard/roles", icon: Shield },
      { name: "Templates", module: "Templates", href: "/dashboard/templates", icon: FileText },
      { name: "Hospitals", module: "Hospitals", href: "/dashboard/hospitals", icon: TestTube },
      { name: "Inventory", module: "Inventory", href: "/dashboard/inventory", icon: Boxes },
      { name: "Suppliers", module: "Inventory", href: "/dashboard/inventory-suppliers", icon: Truck },
      { name: "Settings", module: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Physicians", module: "Physicians", href: "/dashboard/physician", icon: UserCog },
      { name: "Audit Logs", module: "Audit Logs", href: "/dashboard/audit-logs", icon: BarChart3 },
      { name: "Notifications", module: "Notifications", href: "/dashboard/notifications", icon: Bell },
    ]
  }
];

export const adminMenuConfig = [
  {
    section: "ADMINISTRATION",
    icon: Settings,
    items: [
      { name: "Dashboard", module: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Tenants", module: "Users", href: "/admin/tenants", icon: TestTubes },
      { name: "Upload Test Catalog", module: "Tests & Packages", href: "/admin/upload-test-catalogs", icon: IndianRupee },
      { name: "Templates", module: "templates", href: "/admin/templates", icon: FileText },
    ]
  }
];
