import { Outlet, Navigate, NavLink } from "react-router";
import { useUser } from "@clerk/clerk-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="p-6">Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (
    !user.publicMetadata.roles ||
    !user.publicMetadata.roles.includes("Admin")
  ) {
    return <Navigate to="/" />;
  }

  const navItems = [
    { name: "Create Subject", path: "/admin/create-subject" },
    { name: "Create Mentor", path: "/admin/create-mentor" },
    { name: "Manage Bookings", path: "/admin/bookings" },
  ];

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Admin Dashboard
          </h2>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                    isActive && "bg-muted text-primary"
                  )
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <Separator />

        {/* User Info */}
        <div className="p-4 flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback>
              {user.firstName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <Button variant="outline">Logout</Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;