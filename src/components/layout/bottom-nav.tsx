
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, BookOpenCheck } from 'lucide-react'; // Simplified icons
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: Home }, // Consolidated Home link
  { href: '/recipes', label: 'Recipes', icon: BookOpenCheck },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-md">
      {/* Adjust grid columns to 3 */}
      <div className="mx-auto grid h-16 max-w-md grid-cols-3 items-center justify-around px-1">
        {navItems.map((item) => {
          // Check if the current path starts with the item's href for broader matching
          // Exact match for root pages
           const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-1 text-center text-[10px] transition-colors sm:text-xs', // Adjusted padding, text size
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className="h-5 w-5"
                aria-hidden="true"
              />
              {/* Ensure label doesn't wrap too awkwardly on small screens */}
              <span className="mt-1 block max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

