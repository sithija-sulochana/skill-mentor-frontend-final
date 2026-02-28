import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useAuth, SignInButton, UserButton } from "@clerk/clerk-react";
import SkillMentorLogo from "@/assets/logo.webp";
import {
  Menu,
  ChevronRight,
  Home,
  Users,
  BookOpen,
  Shield,
  LayoutDashboard,
  LogIn,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

interface NavLink {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navLinks: NavLink[] = [
  { to: "/", label: "Tutors", icon: Users },
  { to: "/", label: "About Us", icon: BookOpen },
  { to: "/", label: "Resources", icon: Home },
  { to: "/admin", label: "Admin", icon: Shield },
];

interface NavItemsProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

function NavItems({ mobile = false, onItemClick }: NavItemsProps) {
  return (
    <nav
      className={cn(
        "flex items-center gap-1",
        mobile && "flex-col items-stretch gap-1 w-full"
      )}
    >
      {navLinks.map((link) => {
        const IconComponent = link.icon;
        return (
          <Link
            key={link.label}
            to={link.to}
            className={cn(
              "relative group flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300",
              mobile
                ? "text-slate-300 hover:text-white hover:bg-white/10 w-full justify-between"
                : "text-slate-300 hover:text-white text-sm"
            )}
            onClick={onItemClick}
          >
            {mobile && <IconComponent className="w-4 h-4 text-slate-400" />}
            <span>{link.label}</span>
            {mobile && (
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            )}
            {!mobile && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-linear-to-r from-blue-500 to-purple-500 group-hover:w-3/4 transition-all duration-300 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

interface AuthButtonsProps {
  mobile?: boolean;
  isSignedIn: boolean;
  onItemClick?: () => void;
}

function AuthButtons({ mobile = false, isSignedIn, onItemClick }: AuthButtonsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        mobile && "flex-col items-stretch gap-3 w-full"
      )}
    >
      {isSignedIn ? (
        <>
          <Link
            to="/dashboard"
            className={cn(mobile && "w-full")}
            onClick={onItemClick}
          >
            <Button
              variant="ghost"
              className={cn(
                "gap-2 text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300",
                mobile && "w-full justify-start"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <div
            className={cn(
              "flex items-center",
              mobile && "w-full justify-center py-2"
            )}
          >
            <div className="ring-2 ring-purple-500/50 ring-offset-2 ring-offset-black rounded-full">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <SignInButton
            forceRedirectUrl="/dashboard"
            mode="modal"
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary",
              },
            }}
          >
            <Button
              variant="ghost"
              className={cn(
                "gap-2 text-slate-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-300",
                mobile && "w-full justify-start"
              )}
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          </SignInButton>
          <Link to="/login" className={cn(mobile && "w-full")}>
            <Button
              className={cn(
                "gap-2 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300",
                mobile && "w-full"
              )}
            >
              <UserPlus className="w-4 h-4" />
              Sign up
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}

export function Navigation() {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileItemClick = () => setIsOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "py-2 bg-black/95 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-white/5"
          : "py-3 bg-black/80 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-75 blur transition-all duration-500" />
                <img
                  src={SkillMentorLogo}
                  alt="SkillMentor Logo"
                  className="relative size-11 rounded-full ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white tracking-tight">
                  SkillMentor
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase hidden sm:block">
                  Learn & Grow
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <NavItems />
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <AuthButtons isSignedIn={isSignedIn ?? false} />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[320px] bg-linear-to-b from-slate-950 to-black border-l border-white/10 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="p-6 border-b border-white/10">
                    <Link
                      to="/"
                      className="flex items-center gap-3"
                      onClick={handleMobileItemClick}
                    >
                      <div className="relative">
                        <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-50 blur" />
                        <img
                          src={SkillMentorLogo}
                          alt="SkillMentor Logo"
                          className="relative size-12 rounded-full ring-2 ring-white/20"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xl text-white">
                          SkillMentor
                        </span>
                        <span className="text-xs text-slate-400 font-medium tracking-wider">
                          Learn & Grow
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Navigation
                    </p>
                    <NavItems mobile onItemClick={handleMobileItemClick} />
                  </div>

                  {/* Mobile Auth Section */}
                  <div className="p-6 border-t border-white/10 bg-slate-950/50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                      Account
                    </p>
                    <AuthButtons
                      mobile
                      isSignedIn={isSignedIn ?? false}
                      onItemClick={handleMobileItemClick}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
