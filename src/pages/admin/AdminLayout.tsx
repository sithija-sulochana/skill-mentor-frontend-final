import { useState } from "react";
import { Outlet, Navigate, NavLink, useLocation } from "react-router";
import { useUser, useClerk } from "@clerk/clerk-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Users,
  CalendarCheck,
  Menu,
  LogOut,
  ChevronRight,
  Shield,
  Loader2,
  Home,
} from "lucide-react";
import { Link } from "react-router";

const AdminLayout = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (
    !user.publicMetadata.roles ||
    !(user.publicMetadata.roles as string[]).includes("Admin")
  ) {
    return <Navigate to="/" />;
  }

  const navItems = [
    {
      name: "Create Subject",
      path: "/admin/create-subject",
      icon: BookOpen,
      description: "Add new courses",
    },
    {
      name: "Create Mentor",
      path: "/admin/create-mentor",
      icon: Users,
      description: "Add new mentors",
    },
    {
      name: "Manage Bookings",
      path: "/admin/bookings",
      icon: CalendarCheck,
      description: "View all bookings",
    },
  ];

  // Get current page title
  const currentPage = navItems.find((item) => item.path === location.pathname);
  const pageTitle = currentPage?.name || "Dashboard";

  const handleSignOut = () => {
    signOut();
  };

  // Sidebar content JSX (reused for desktop and mobile)
  const sidebarContent = (
    <>
      {/* Logo Section */}
      <div className="p-6">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SkillMentor
            </p>
          </div>
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
            Management
          </p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span>{item.name}</span>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                      {item.description}
                    </p>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <Separator className="my-4" />

        {/* Quick Links */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
            Quick Links
          </p>
          <nav className="flex flex-col gap-1">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Home className="w-4 h-4" />
              </div>
              <span>Back to Website</span>
            </Link>
          </nav>
        </div>
      </ScrollArea>

      <Separator />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-sm">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {user.fullName}
            </p>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              >
                Admin
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/admin"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Admin
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                {pageTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop User Info */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Administrator
                </p>
              </div>
              <Avatar className="h-9 w-9 border-2 border-slate-200 dark:border-slate-700">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {user.firstName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                {pageTitle}
              </h1>
              {currentPage && (
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {currentPage.description}
                </p>
              )}
            </div>

            {/* Page Content */}
            
          </div>
          <Outlet />
        </main>
        
      </div>
      
    </div>
    
  );
};

export default AdminLayout;