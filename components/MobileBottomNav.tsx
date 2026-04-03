'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Tag, Sparkles, User, X, ChevronDown, ChevronRight } from 'lucide-react';

// ── Category data ────────────────────────────────────────────────────────────

const categoryData: Record<string, {
  sections: {
    title: string;
    items: { label: string; image: string; href: string }[];
  }[];
}> = {
  Women: {
    sections: [
      {
        title: 'Eastern Ready To Wear',
        items: [
          { label: 'Shop All',    image: '/categories/women.jpg',         href: '/category/women'               },
          { label: 'Kurta Set',   image: '/categories/eastern.jpg',       href: '/category/women/kurta-set'     },
          { label: 'Maxi',        image: '/categories/luxury-wear.jpg',   href: '/category/women/maxi'          },
          { label: 'Pishwas',     image: '/categories/women-western.jpg', href: '/category/women/pishwas'       },
          { label: 'Gharara',     image: '/categories/western.jpg',       href: '/category/women/gharara'       },
          { label: 'Sharara',     image: '/categories/girl-newborn.jpg',  href: '/category/women/sharara'       },
          { label: 'Lehenga',     image: '/categories/jewelry.jpg',       href: '/category/women/lehenga'       },
          { label: 'Co Ord Sets', image: '/categories/retail.jpg',        href: '/category/women/co-ord-sets'   },
          { label: 'Kaftan',      image: '/categories/eastern.jpg',       href: '/category/women/kaftan'        },
        ],
      },
      {
        title: 'Eastern Unstitched',
        items: [
          { label: 'Shop All', image: '/categories/women.jpg',       href: '/category/women/unstitched' },
          { label: 'Lawn',     image: '/categories/luxury-wear.jpg', href: '/category/women/lawn'       },
          { label: 'Chiffon',  image: '/categories/western.jpg',     href: '/category/women/chiffon'    },
        ],
      },
      {
        title: 'Modest Wear',
        items: [
          { label: 'Shop All', image: '/categories/women.jpg',         href: '/category/women/modest'  },
          { label: 'Abaya',    image: '/categories/eastern.jpg',       href: '/category/women/abaya'   },
          { label: 'Chaddar',  image: '/categories/luxury-wear.jpg',   href: '/category/women/chaddar' },
          { label: 'Jilbab',   image: '/categories/women-western.jpg', href: '/category/women/jilbab'  },
          { label: 'Hijab',    image: '/categories/western.jpg',       href: '/category/women/hijab'   },
          { label: 'Veil',     image: '/categories/jewelry.jpg',       href: '/category/women/veil'    },
        ],
      },
      {
        title: 'Fusion',
        items: [
          { label: 'Shop All',   image: '/categories/women.jpg',       href: '/category/women/fusion'     },
          { label: 'Kaftans',    image: '/categories/luxury-wear.jpg', href: '/category/women/kaftans'    },
          { label: 'Coord Sets', image: '/categories/eastern.jpg',     href: '/category/women/coord-sets' },
        ],
      },
      {
        title: 'Western',
        items: [
          { label: 'Shop All', image: '/categories/women-western.jpg', href: '/category/women/western' },
          { label: 'Tops',     image: '/categories/western.jpg',       href: '/category/women/tops'    },
          { label: 'Jeans',    image: '/categories/jewelry.jpg',       href: '/category/women/jeans'   },
          { label: 'Dresses',  image: '/categories/retail.jpg',        href: '/category/women/dresses' },
        ],
      },
    ],
  },
  Men: {
    sections: [
      {
        title: 'Eastern',
        items: [
          { label: 'Shop All',       image: '/categories/men.jpg',         href: '/category/men'                },
          { label: 'Shalwar Kameez', image: '/categories/west.jpg',        href: '/category/men/shalwar-kameez' },
          { label: 'Kurta',          image: '/categories/retail.jpg',      href: '/category/men/kurta'          },
          { label: 'Sherwani',       image: '/categories/western.jpg',     href: '/category/men/sherwani'       },
          { label: 'Waistcoat',      image: '/categories/eastern.jpg',     href: '/category/men/waistcoat'      },
          { label: 'Boy Newborn',    image: '/categories/boy-newborn.jpg', href: '/category/boy-newborn'        },
        ],
      },
      {
        title: 'Western',
        items: [
          { label: 'Shop All', image: '/categories/men.jpg',    href: '/category/men/western'  },
          { label: 'Shirts',   image: '/categories/west.jpg',   href: '/category/men/shirts'   },
          { label: 'Trousers', image: '/categories/retail.jpg', href: '/category/men/trousers' },
        ],
      },
    ],
  },
  Kids: {
    sections: [
      {
        title: 'Girls',
        items: [
          { label: 'Shop All', image: '/categories/kids.jpg',         href: '/category/kids'              },
          { label: 'Eastern',  image: '/categories/eastern.jpg',      href: '/category/kids/girl-eastern' },
          { label: 'Western',  image: '/categories/western.jpg',      href: '/category/kids/girl-western' },
          { label: 'Newborn',  image: '/categories/girl-newborn.jpg', href: '/category/girl-newborn'      },
        ],
      },
      {
        title: 'Boys',
        items: [
          { label: 'Shop All', image: '/categories/kids.jpg',        href: '/category/kids'             },
          { label: 'Eastern',  image: '/categories/eastern.jpg',     href: '/category/kids/boy-eastern' },
          { label: 'Western',  image: '/categories/western.jpg',     href: '/category/kids/boy-western' },
          { label: 'Newborn',  image: '/categories/boy-newborn.jpg', href: '/category/boy-newborn'      },
        ],
      },
    ],
  },
  Beauty: {
    sections: [
      {
        title: 'Beauty',
        items: [
          { label: 'Shop All',  image: '/categories/jewelry.jpg',       href: '/category/beauty'           },
          { label: 'Skincare',  image: '/categories/luxury-wear.jpg',   href: '/category/beauty/skincare'  },
          { label: 'Makeup',    image: '/categories/women-western.jpg', href: '/category/beauty/makeup'    },
          { label: 'Fragrance', image: '/categories/western.jpg',       href: '/category/beauty/fragrance' },
        ],
      },
    ],
  },
};

const extraLinks = [
  { label: 'All',          href: '/'              },
  { label: 'New Arrivals', href: '/new-arrivals'  },
  { label: 'West',         href: '/category/west' },
  { label: 'Stores',       href: '/stores'        },
  { label: 'Library',      href: '/library'       },
  { label: 'Orders',       href: '/orders'        },
  { label: 'Rewards',      href: '/rewards'       },
  { label: 'Wishlist',     href: '/wishlist'      },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const NAV_HEIGHT = 62;

// ── Category sheet ────────────────────────────────────────────────────────────

function CategorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const allTabs = ['Women', 'Men', 'Kids', 'Beauty'];
  const [activeTab, setActiveTab] = useState('Women');
  const [openSections, setOpenSections] = useState<string[]>([
    categoryData['Women'].sections[0].title,
  ]);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(t);
    }
  }, [open]);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setOpenSections([categoryData[tab].sections[0].title]);
  };

  const toggleSection = (title: string) =>
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop — covers only the scrollable content area, not the nav */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          // stops above the nav bar so it never overlaps it
          bottom: `${NAV_HEIGHT}px`,
          zIndex: 40,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />

      {/* Sheet — anchored just above the nav */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: `${NAV_HEIGHT}px`,
          zIndex: 45,
          maxHeight: '70dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden',
          background: 'var(--background)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.14), 0 -1px 0 rgba(0,0,0,0.06)',
          transform: visible ? 'translateY(0)' : 'translateY(110%)',
          transition: visible
            ? 'transform 0.44s cubic-bezier(0.32, 0.72, 0, 1)'
            : 'transform 0.36s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 9999, background: 'var(--border)', opacity: 0.7 }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border shrink-0">
          <span className="text-base font-semibold text-foreground tracking-tight">Categories</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0">
          {allTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors relative
                ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab}
              {activeTab === tab && (
                <span style={{
                  position: 'absolute', bottom: 0, left: '15%', right: '15%',
                  height: 2, borderRadius: 9999, background: 'var(--foreground)',
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {categoryData[activeTab].sections.map((section) => {
            const isOpen = openSections.includes(section.title);
            return (
              <div key={section.title} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-secondary/60 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{section.title}</span>
                  <span style={{
                    display: 'flex', alignItems: 'center',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                  </span>
                </button>

                <div style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="px-4 pb-5 pt-1 grid grid-cols-3 gap-3">
                      {section.items.map((item, i) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={onClose}
                          className="group flex flex-col items-center gap-1.5"
                          style={{
                            opacity: isOpen ? 1 : 0,
                            transform: isOpen ? 'translateY(0)' : 'translateY(6px)',
                            transition: `opacity 0.22s ease ${i * 0.028}s, transform 0.22s ease ${i * 0.028}s`,
                          }}
                        >
                          <div className="w-full aspect-square overflow-hidden rounded-xl bg-muted">
                            <img
                              src={item.image}
                              alt={item.label}
                              className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Extra links */}
          <div className="px-4 py-2">
            {extraLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between py-3 border-b border-border/50 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
                <ChevronRight size={15} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
          <div className="h-4" />
        </div>
      </div>
    </>
  );
}

// ── Bottom nav ────────────────────────────────────────────────────────────────

const navItems = [
  { label: 'Home',       href: '/',           icon: Home       },
  { label: 'Brands',     href: '/brands',     icon: Tag        },
  { label: 'Categories', href: '#categories', icon: LayoutGrid },
  { label: 'Stores',     href: '/stores',     icon: Sparkles   },
  { label: 'Account',    href: '/account',    icon: User       },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen]);

  return (
    <>
      {/* Sheet still uses fixed positioning — that's fine for overlays */}
      <CategorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {/* Nav is now a natural flex child in the layout — NOT fixed */}
      <nav
        className="bg-background border-t border-border shrink-0 w-full"
        style={{ height: `${NAV_HEIGHT}px` }}
      >
        <div className="flex items-center justify-around px-1 py-2 h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCategories = item.label === 'Categories';
            const isActive = !isCategories && pathname === item.href;

            if (isCategories) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSheetOpen((v) => !v)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1"
                >
                  <Icon
                    size={22}
                    strokeWidth={sheetOpen ? 2.2 : 1.6}
                    style={{
                      color: sheetOpen ? 'var(--foreground)' : 'var(--muted-foreground)',
                      transition: 'color 0.2s ease',
                    }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: sheetOpen ? 'var(--foreground)' : 'var(--muted-foreground)',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={isActive ? 'text-foreground' : 'text-muted-foreground'}
                />
                <span className={`text-[10px] font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}