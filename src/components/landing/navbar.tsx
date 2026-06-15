'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  ChevronDown,
  FolderKanban,
  DollarSign,
  ShoppingCart,
  Users,
  Building2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: { label: string; href: string; icon?: React.ReactNode }[];
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const solutionChildren = [
  { label: 'Project Management', href: '#project-mgmt', icon: <FolderKanban className="size-4" /> },
  { label: 'Financial Management', href: '#finance', icon: <DollarSign className="size-4" /> },
  { label: 'Procurement', href: '#procurement', icon: <ShoppingCart className="size-4" /> },
  { label: 'Workforce Management', href: '#workforce', icon: <Users className="size-4" /> },
  { label: 'Asset Management', href: '#assets', icon: <Building2 className="size-4" /> },
  { label: 'Resources & Reporting', href: '#resources', icon: <BookOpen className="size-4" /> },
];

const navItems: NavItem[] = [
  { label: 'Solutions', href: '#solutions', children: solutionChildren },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

/* ------------------------------------------------------------------ */
/*  Logo                                                               */
/* ------------------------------------------------------------------ */

function Logo() {
  return (
    <a
      href="/"
      className="flex items-center gap-2.5 group"
      aria-label="SmartBuild Home"
    >
      {/* Logo mark – orange square with white inner */}
      <div
        className="relative size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
        style={{ backgroundColor: '#ff5201' }}
        aria-hidden="true"
      >
        <div className="absolute inset-[3px] rounded-[5px] bg-white" />
        <span className="relative text-[10px] font-extrabold tracking-tight" style={{ color: '#ff5201' }}>
          SB
        </span>
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-sm font-extrabold tracking-wide text-current">
          SMARTBUILD
        </span>
        <span className="text-[10px] font-medium text-current/60 tracking-wider uppercase">
          Construction ERP
        </span>
      </div>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop Dropdown                                                   */
/* ------------------------------------------------------------------ */

function DesktopDropdown({ item, scrolled }: { item: NavItem; scrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      <button
        type="button"
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5201]/50',
          scrolled ? 'text-[#1a202c] hover:bg-black/5' : 'text-white/90 hover:text-white hover:bg-white/10'
        )}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown
          className={cn('size-3.5 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && item.children && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 top-full pt-2 z-50"
          >
            <div className="w-64 bg-white rounded-lg border border-[#e2e8f0] shadow-lg py-2 overflow-hidden">
              {item.children.map((child) => (
                <a
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a202c] transition-colors duration-150',
                    'hover:bg-[#f5f1ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff5201]/50'
                  )}
                >
                  <span className="text-[#ff5201]">{child.icon}</span>
                  {child.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Sheet Content                                               */
/* ------------------------------------------------------------------ */

function MobileNav({ onLogin }: { onLogin?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-4" aria-label="Mobile navigation">
      {/* Solutions with sub-items */}
      <div className="flex flex-col">
        <span className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#595552]">
          Solutions
        </span>
        {solutionChildren.map((child) => (
          <SheetClose key={child.href} asChild>
            <a
              href={child.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm text-[#1a202c] rounded-lg transition-colors duration-150',
                'hover:bg-[#f5f1ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5201]/50'
              )}
            >
              <span className="text-[#ff5201]">{child.icon}</span>
              {child.label}
            </a>
          </SheetClose>
        ))}
      </div>

      <div className="my-2 h-px bg-[#e2e8f0]" role="separator" />

      {/* Flat nav items */}
      {navItems
        .filter((i) => i.label !== 'Solutions')
        .map((item) => (
          <SheetClose key={item.label} asChild>
            <a
              href={item.href}
              className={cn(
                'px-3 py-2.5 text-sm font-medium text-[#1a202c] rounded-lg transition-colors duration-150',
                'hover:bg-[#f5f1ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5201]/50'
              )}
            >
              {item.label}
            </a>
          </SheetClose>
        ))}

      <div className="my-2 h-px bg-[#e2e8f0]" role="separator" />

      <div className="flex flex-col gap-2 pt-2 pb-4">
        <SheetClose asChild>
          <Button
            variant="outline"
            className="w-full border-[#e2e8f0] text-[#1a202c] hover:bg-[#f5f1ed] focus-visible:ring-2 focus-visible:ring-[#ff5201]/50"
            onClick={onLogin}
          >
            Login
          </Button>
        </SheetClose>
        <SheetClose asChild>
          <Button
            className="w-full text-white hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#ff5201]/50 focus-visible:ring-offset-2"
            style={{ backgroundColor: '#ff5201' }}
          >
            Request Demo
          </Button>
        </SheetClose>
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Navbar                                                        */
/* ------------------------------------------------------------------ */

interface NavbarProps {
  onLogin?: () => void;
}

export function Navbar({ onLogin }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] shadow-sm'
          : 'bg-transparent border-b border-transparent'
      )}
      role="banner"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {navItems.map((item) =>
            item.children ? (
              <DesktopDropdown key={item.label} item={item} scrolled={scrolled} />
            ) : (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5201]/50',
                  scrolled
                    ? 'text-[#1a202c] hover:bg-black/5'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                )}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* Right CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="outline"
            className={cn(
              'transition-colors duration-200',
              'focus-visible:ring-2 focus-visible:ring-[#ff5201]/50',
              scrolled
                ? 'text-[#1a202c] border-[#e2e8f0] hover:bg-[#f5f1ed]'
                : 'text-white border-white/30 hover:bg-white/10 hover:text-white'
            )}
            onClick={onLogin}
          >
            Login
          </Button>
          <Button
            className="text-white transition-all duration-200 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#ff5201]/50 focus-visible:ring-offset-2"
            style={{ backgroundColor: '#ff5201' }}
          >
            Request Demo
          </Button>
        </div>

        {/* Mobile Sheet */}
        <div className="flex lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className={cn(
                  'inline-flex items-center justify-center size-10 rounded-lg transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5201]/50',
                  scrolled
                    ? 'text-[#1a202c] hover:bg-black/5'
                    : 'text-white hover:bg-white/10'
                )}
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm bg-white p-0 overflow-y-auto">
              <SheetHeader className="p-4 pb-0">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <MobileNav onLogin={onLogin} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}