'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, GlassWater, Settings, User } from 'lucide-react'; // Added User icon
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/calories', label: 'Calories', icon: Utensils },
  { href: '/water', label: 'Water', icon: GlassWater },
  { href: '/register', label: 'Profile', icon: User }, // Added Profile/Register link
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-md">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          // Check if the current path starts with the item's href for broader matching (e.g., /settings/subpage)
          // Exact match for root pages like '/calories', '/water', '/register'
           const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 text-xs transition-colors', // Added horizontal padding
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className="h-5 w-5"
                aria-hidden="true"
              />
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}