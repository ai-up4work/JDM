'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Tag, Sparkles, User, X, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

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
          { label: 'Shop All', image: '/categories/men.jpg',    href: '/category/men/western' },
          { label: 'Shirts',   image: '/categories/west.jpg',   href: '/category/men/shirts'  },
          { label: 'Trousers', image: '/categories/retail.jpg', href: '/category/men/trousers'},
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
  { label: 'All',           href: '/'                       },
  { label: 'New Arrivals',  href: '/new-arrivals'           },
  { label: 'West',          href: '/category/west'          },
  { label: 'Top Curations', href: '/category/top-curations' },
  { label: 'Orders',        href: '/orders'                 },
  { label: 'Rewards',       href: '/rewards'                },
  { label: 'Wishlist',      href: '/wishlist'               },
];

// ── Category sheet ───────────────────────────────────────────────────────────

function CategorySheet({ onClose }: { onClose: () => void }) {
  const allTabs = ['Women', 'Men', 'Kids', 'Beauty'];
  const [activeTab, setActiveTab] = useState('Women');
  const [openSections, setOpenSections] = useState<string[]>([
    categoryData['Women'].sections[0].title,
  ]);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setOpenSections([categoryData[tab].sections[0].title]);
  };

  const toggleSection = (title: string) =>
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <span className="text-base font-semibold text-foreground">Categories</span>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border shrink-0">
        {allTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => switchTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors
              ${activeTab === tab
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {categoryData[activeTab].sections.map((section) => {
          const isOpen = openSections.includes(section.title);
          return (
            <div key={section.title} className="border-b border-border">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-secondary transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{section.title}</span>
                {isOpen
                  ? <ChevronUp   size={16} className="text-muted-foreground shrink-0" />
                  : <ChevronDown size={16} className="text-muted-foreground shrink-0" />
                }
              </button>
              {isOpen && (
                <div className="px-4 pb-5 grid grid-cols-3 gap-3">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="group flex flex-col items-center gap-1.5"
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
              )}
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
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Bottom nav ───────────────────────────────────────────────────────────────

const navItems = [
  { label: 'Home',         href: '/',            icon: Home       },
  { label: 'Categories',   href: '#categories',  icon: LayoutGrid },
  { label: 'Brands',       href: '/brands',      icon: Tag        },
  { label: 'New Arrivals', href: '/new-arrivals', icon: Sparkles  },
  { label: 'Account',      href: '/account',     icon: User       },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Lock scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen]);

  return (
    <>
      {/* Bottom bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border">
        <div className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCategories = item.label === 'Categories';
            const isActive = !isCategories && pathname === item.href;

            if (isCategories) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-3 py-1"
                >
                  <Icon size={22} strokeWidth={1.6} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">{item.label}</span>
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

      {/* Category sheet */}
      {sheetOpen && <CategorySheet onClose={() => setSheetOpen(false)} />}
    </>
  );
}