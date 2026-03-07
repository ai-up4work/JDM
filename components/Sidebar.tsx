'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

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
          { label: 'Shop All',   image: '/categories/women.jpg',         href: '/category/women'               },
          { label: 'Kurta Set',  image: '/categories/eastern.jpg',       href: '/category/women/kurta-set'     },
          { label: 'Maxi',       image: '/categories/luxury-wear.jpg',   href: '/category/women/maxi'          },
          { label: 'Pishwas',    image: '/categories/women-western.jpg', href: '/category/women/pishwas'       },
          { label: 'Gharara',    image: '/categories/western.jpg',       href: '/category/women/gharara'       },
          { label: 'Sharara',    image: '/categories/girl-newborn.jpg',  href: '/category/women/sharara'       },
          { label: 'Lehenga',    image: '/categories/jewelry.jpg',       href: '/category/women/lehenga'       },
          { label: 'Co Ord Sets',image: '/categories/retail.jpg',        href: '/category/women/co-ord-sets'   },
          { label: 'Kaftan',     image: '/categories/eastern.jpg',       href: '/category/women/kaftan'        },
        ],
      },
      {
        title: 'Eastern Unstitched',
        items: [
          { label: 'Shop All',   image: '/categories/women.jpg',         href: '/category/women/unstitched'    },
          { label: 'Lawn',       image: '/categories/luxury-wear.jpg',   href: '/category/women/lawn'          },
          { label: 'Chiffon',    image: '/categories/western.jpg',       href: '/category/women/chiffon'       },
        ],
      },
      {
        title: 'Modest Wear',
        items: [
          { label: 'Shop All',   image: '/categories/women.jpg',         href: '/category/women/modest'        },
          { label: 'Abaya',      image: '/categories/eastern.jpg',       href: '/category/women/abaya'         },
          { label: 'Chaddar',    image: '/categories/luxury-wear.jpg',   href: '/category/women/chaddar'       },
          { label: 'Jilbab',     image: '/categories/women-western.jpg', href: '/category/women/jilbab'        },
          { label: 'Hijab',      image: '/categories/western.jpg',       href: '/category/women/hijab'         },
          { label: 'Veil',       image: '/categories/jewelry.jpg',       href: '/category/women/veil'          },
        ],
      },
      {
        title: 'Fusion',
        items: [
          { label: 'Shop All',   image: '/categories/women.jpg',         href: '/category/women/fusion'        },
          { label: 'Kaftans',    image: '/categories/luxury-wear.jpg',   href: '/category/women/kaftans'       },
          { label: 'Coord Sets', image: '/categories/eastern.jpg',       href: '/category/women/coord-sets'    },
        ],
      },
      {
        title: 'Western',
        items: [
          { label: 'Shop All',   image: '/categories/women-western.jpg', href: '/category/women/western'       },
          { label: 'Tops',       image: '/categories/western.jpg',       href: '/category/women/tops'          },
          { label: 'Jeans',      image: '/categories/jewelry.jpg',       href: '/category/women/jeans'         },
          { label: 'Dresses',    image: '/categories/retail.jpg',        href: '/category/women/dresses'       },
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
          { label: 'Shop All', image: '/categories/men.jpg',     href: '/category/men/western' },
          { label: 'Shirts',   image: '/categories/west.jpg',    href: '/category/men/shirts'  },
          { label: 'Trousers', image: '/categories/retail.jpg',  href: '/category/men/trousers'},
        ],
      },
    ],
  },
  Kids: {
    sections: [
      {
        title: 'Girls',
        items: [
          { label: 'Shop All',  image: '/categories/kids.jpg',         href: '/category/kids'             },
          { label: 'Eastern',   image: '/categories/eastern.jpg',      href: '/category/kids/girl-eastern'},
          { label: 'Western',   image: '/categories/western.jpg',      href: '/category/kids/girl-western'},
          { label: 'Newborn',   image: '/categories/girl-newborn.jpg', href: '/category/girl-newborn'     },
        ],
      },
      {
        title: 'Boys',
        items: [
          { label: 'Shop All', image: '/categories/kids.jpg',        href: '/category/kids'            },
          { label: 'Eastern',  image: '/categories/eastern.jpg',     href: '/category/kids/boy-eastern'},
          { label: 'Western',  image: '/categories/western.jpg',     href: '/category/kids/boy-western'},
          { label: 'Newborn',  image: '/categories/boy-newborn.jpg', href: '/category/boy-newborn'     },
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

// Subcategory text links shown inline in sidebar when that drawer is open
const sidebarSubItems: Record<string, { label: string; href: string }[]> = {
  Women: [
    { label: 'Eastern Ready To Wear', href: '/category/women/eastern'   },
    { label: 'Eastern Unstitched',    href: '/category/women/unstitched' },
    { label: 'Modest Wear',           href: '/category/women/modest'     },
    { label: 'Fusion',                href: '/category/women/fusion'     },
    { label: 'Western',               href: '/category/women/western'    },
  ],
  Men: [
    { label: 'Eastern', href: '/category/men/eastern' },
    { label: 'Western', href: '/category/men/western' },
  ],
  Kids: [
    { label: 'Girls', href: '/category/kids/girls' },
    { label: 'Boys',  href: '/category/kids/boys'  },
  ],
  Beauty: [
    { label: 'Beauty', href: '/category/beauty' },
  ],
};

const sidebarItems = [
  { label: 'All',           href: '/'                       },
  { label: 'New Arrivals',  href: '/category/new-arrivals'  },
  { label: 'West',          href: '/category/west'          },
  { label: 'Women',         href: '/category/women',  hasDrawer: true },
  { label: 'Men',           href: '/category/men',    hasDrawer: true },
  { label: 'Beauty',        href: '/category/beauty', hasDrawer: true },
  { label: 'Kids',          href: '/category/kids',   hasDrawer: true },
  { label: 'Brands',        href: '/category/brands'        },
  { label: 'Top Curations', href: '/category/top-curations' },
  { label: 'Orders',        href: '/orders'                 },
  { label: 'Rewards',       href: '/rewards'                },
  { label: 'Wishlist',      href: '/wishlist'               },
];

export function Sidebar() {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  // Track which sections are expanded inside the drawer — all collapsed by default
  const [openSections, setOpenSections] = useState<string[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // When drawer opens, default the first section to expanded
  useEffect(() => {
    if (openDrawer && categoryData[openDrawer]) {
      setOpenSections([categoryData[openDrawer].sections[0].title]);
    } else {
      setOpenSections([]);
    }
  }, [openDrawer]);

  // Close drawer when clicking outside both sidebar and drawer
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const insideSidebar = sidebarRef.current?.contains(target);
      const insideDrawer  = drawerRef.current?.contains(target);
      if (!insideSidebar && !insideDrawer) setOpenDrawer(null);
    }
    if (openDrawer) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openDrawer]);

  const toggleDrawer = (label: string) =>
    setOpenDrawer((prev) => (prev === label ? null : label));

  const toggleSection = (title: string) =>
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );

  return (
    <>
      {/* ── Sidebar ── */}
      <aside
        ref={sidebarRef}
        className="hidden lg:block w-60 bg-background border-r border-border sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto shrink-0"
      >
        <nav className="px-4 py-6">
          {sidebarItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center">
                <Link
                  href={item.href}
                  onClick={() => setOpenDrawer(null)}
                  className="flex-1 px-6 py-3 text-lg font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {item.label}
                </Link>
                {item.hasDrawer && (
                  <button
                    type="button"
                    onClick={() => toggleDrawer(item.label)}
                    className="px-2 py-3 hover:bg-secondary transition-colors outline-none"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        openDrawer === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Inline subcategory links — shown when this category's drawer is open */}
              {item.hasDrawer && openDrawer === item.label && sidebarSubItems[item.label] && (
                <div className="bg-muted/30">
                  {sidebarSubItems[item.label].map((sub) => (
                    <button
                      key={sub.label}
                      type="button"
                      onClick={() => {
                        const match = categoryData[item.label]?.sections.find(
                          (s) => s.title === sub.label
                        );
                        if (match) setOpenSections([match.title]);
                      }}
                      className={`w-full text-left block px-10 py-2 text-sm font-medium transition-colors ${
                        openSections.includes(sub.label)
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Image-card Drawer ── */}
      {openDrawer && categoryData[openDrawer] && (
        <div
          ref={drawerRef}
          className="fixed top-20 left-60 z-40 w-[480px] h-[calc(100vh-5rem)] overflow-y-auto bg-card border-r border-border shadow-xl"
        >
          {/* Sticky drawer header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
            <span className="text-md font-medium text-foreground">{openDrawer}</span>
            <button
              type="button"
              onClick={() => setOpenDrawer(null)}
              className="p-1 rounded-md hover:bg-secondary transition-colors outline-none"
            >
              <X size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Collapsible sections */}
          <div className="flex flex-col">
            {categoryData[openDrawer].sections.map((section) => {
              const isOpen = openSections.includes(section.title);
              return (
                <div key={section.title} className="border-b border-border">
                  {/* Section header — click to expand/collapse */}
                  <button
                    type="button"
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-secondary transition-colors outline-none"
                  >
                    <span className="text-md font-medium text-foreground">{section.title}</span>
                    {isOpen
                      ? <ChevronUp   size={16} strokeWidth={1.8} className="text-muted-foreground shrink-0" />
                      : <ChevronDown size={16} strokeWidth={1.8} className="text-muted-foreground shrink-0" />
                    }
                  </button>

                  {/* Image card grid — only shown when section is open */}
                  {isOpen && (
                    <div className="px-6 pb-6 grid grid-cols-3 gap-3">
                      {section.items.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setOpenDrawer(null)}
                          className="group flex flex-col items-center gap-1.5"
                        >
                          <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-muted">
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
          </div>
        </div>
      )}
    </>
  );
}