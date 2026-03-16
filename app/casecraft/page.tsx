'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, Upload, ZoomIn, ZoomOut, RotateCw, ShoppingBag, Check, X, Move } from 'lucide-react';

// ── All models mapped exactly to your /public/phoneCases/ filenames ───────────

const BRANDS = [
  {
    id: 'iphone', label: 'iPhone',
    models: [
      { label: 'iPhone 5 & 5s & 5se',  file: 'Tough Phone Cases iPhone 5 & 5s & 5se.png'  },
      { label: 'iPhone 6 & 6s',        file: 'Tough Phone Cases iPhone 6 & 6s.png'         },
      { label: 'iPhone 6 & 6s Plus',   file: 'Tough Phone Cases iPhone 6 & 6s Plus.png'    },
      { label: 'iPhone 7 & 8',         file: 'Tough Phone Cases iPhone 7 & 8.png'          },
      { label: 'iPhone 7 & 8 Plus',    file: 'Tough Phone Cases iPhone 7 & 8 Plus.png'     },
      { label: 'iPhone 8',             file: 'ToughCases iPhone 8.png'                     },
      { label: 'iPhone 8 Plus',        file: 'ToughCases iPhone 8 Plus.png'                },
      { label: 'iPhone X',             file: 'Tough Phone Cases iPhone X.png'              },
      { label: 'iPhone XR',            file: 'Tough Phone Cases iPhone XR.png'             },
      { label: 'iPhone XS',            file: 'Tough Phone Cases iPhone XS.png'             },
      { label: 'iPhone XS Max',        file: 'ToughCases iPhone XS Max.png'                },
      { label: 'iPhone X MAX',         file: 'Tough Phone Cases iPhone X MAX.png'          },
      { label: 'iPhone 11',            file: 'Tough Phone Cases iPhone 11.png'             },
      { label: 'iPhone 11 Pro',        file: 'Tough Phone Cases iPhone 11 Pro.png'         },
      { label: 'iPhone 11 Pro Max',    file: 'Tough Phone Cases iPhone 11 Pro Max.png'     },
      { label: 'iPhone 12 Mini',       file: 'Tough Phone Cases iPhone 12 Mini.png'        },
      { label: 'iPhone 12 & 12 Pro',   file: 'Tough Phone Cases iPhone 12 & 12 Pro.png'   },
      { label: 'iPhone 12 Pro Max',    file: 'Tough Phone Cases iPhone 12 Pro Max.png'     },
      { label: 'iPhone 13 Mini',       file: 'Tough Phone Cases iPhone 13 Mini.png'        },
      { label: 'iPhone 13',            file: 'Tough Phone Cases iPhone 13.png'             },
      { label: 'iPhone 13 Pro',        file: 'Tough Phone Cases iPhone 13 Pro.png'         },
      { label: 'iPhone 13 Pro Max',    file: 'Tough Phone Cases iPhone 13 Pro Max.png'     },
      { label: 'iPhone 14',            file: 'Tough Phone Cases iPhone 14.png'             },
      { label: 'iPhone 14 Plus',       file: 'Tough Phone Cases iPhone 14 Plus.png'        },
      { label: 'iPhone 14 Pro',        file: 'Tough Phone Cases iPhone 14 Pro.png'         },
      { label: 'iPhone 14 Pro Max',    file: 'Tough Phone Cases iPhone 14 Pro Max.png'     },
      { label: 'iPhone 15',            file: 'Tough Phone Cases iPhone 15.png'             },
      { label: 'iPhone 15 Plus',       file: 'Tough Phone Cases iPhone 15 Plus.png'        },
      { label: 'iPhone 15 Pro',        file: 'Tough Phone Cases iPhone 15 Pro.png'         },
      { label: 'iPhone 15 Pro Max',    file: 'Tough Phone Cases iPhone 15 Pro Max.png'     },
    ],
  },
  {
    id: 'samsung', label: 'Samsung',
    models: [
      { label: 'Galaxy S6',            file: 'Tough Phone Cases Samsung S6.png'            },
      { label: 'Galaxy S10',           file: 'ToughCases Samsung S10.png'                  },
      { label: 'Galaxy S10 Plus',      file: 'ToughCases Samsung S10 Plus.png'             },
      { label: 'Galaxy S10 Edge',      file: 'ToughCases Samsung S10 Edge.png'             },
      { label: 'Galaxy S20',           file: 'ToughCases Samsung S20.png'                  },
      { label: 'Galaxy S20 FE',        file: 'ToughCases Samsung S20 FE.png'               },
      { label: 'Galaxy S20 Plus',      file: 'ToughCases Samsung S20 Plus.png'             },
      { label: 'Galaxy S20 Ultra',     file: 'ToughCases Samsung S20 Ultra.png'            },
      { label: 'Galaxy S21',           file: 'Tough Phone Cases Samsung S21.png'           },
      { label: 'Galaxy S21 FE',        file: 'ToughCases Samsung S21 FE.png'               },
      { label: 'Galaxy S21 Plus',      file: 'ToughCases Samsung S21 Plus.png'             },
      { label: 'Galaxy S21 Ultra',     file: 'ToughCases Samsung S21 Ultra.png'            },
      { label: 'Galaxy S22',           file: 'Tough Phone Cases Samsung S22.png'           },
      { label: 'Galaxy S22 Plus',      file: 'ToughCases Samsung S22 Plus.png'             },
      { label: 'Galaxy S22 Ultra',     file: 'ToughCases Samsung S22 Ultra.png'            },
      { label: 'Galaxy S23',           file: 'Tough Phone Cases Samsung S23.png'           },
      { label: 'Galaxy S23 Plus',      file: 'ToughCases Samsung S23 Plus.png'             },
      { label: 'Galaxy S23 Ultra',     file: 'ToughCases Samsung S23 Ultra.png'            },
      { label: 'Galaxy S24',           file: 'Tough Phone Cases Samsung S24.png'           },
      { label: 'Galaxy S24 Plus',      file: 'ToughCases Samsung S24 Plus.png'             },
      { label: 'Galaxy S24 Ultra',     file: 'ToughCases Samsung S24 Ultra.png'            },
    ],
  },
  {
    id: 'google', label: 'Google',
    models: [
      { label: 'Pixel 5',              file: 'ToughCases Google Pixel 5.png'               },
      { label: 'Pixel 6',              file: 'ToughCases Google Pixel 6.png'               },
      { label: 'Pixel 6 Pro',          file: 'ToughCases Google Pixel 6 Pro.png'           },
      { label: 'Pixel 7',              file: 'ToughCases Google Pixel 7.png'               },
      { label: 'Pixel 8',              file: 'ToughCases Google Pixel 8.png'               },
      { label: 'Pixel 8 Pro',          file: 'ToughCases Google Pixel 8 Pro.png'           },
    ],
  },
];

const TEMPLATES = [
  { id: 'full',     label: 'Full cover', desc: 'Fills entire back'        },
  { id: 'centered', label: 'Centered',   desc: 'Photo with border'        },
  { id: 'top',      label: 'Top half',   desc: 'Photo top half only'      },
];

function getPrice(label: string) {
  if (label.includes('Pro Max') || label.includes('Ultra') || label.includes('Plus')) return 3200;
  if (label.includes('Pro') || label.includes('Max')) return 2800;
  return 2400;
}

type Model = { label: string; file: string };

export default function CustomCasePage() {
  const [step, setStep]               = useState<1|2|3|4>(1);
  const [brandId, setBrandId]         = useState('iphone');
  const [model, setModel]             = useState<Model | null>(null);
  const [template, setTemplate]       = useState('full');
  const [photoUrl, setPhotoUrl]       = useState<string | null>(null);
  const [zoom, setZoom]               = useState(1);
  const [offset, setOffset]           = useState({ x: 0, y: 0 });
  const [dragging, setDragging]       = useState(false);
  const [dragStart, setDragStart]     = useState({ x: 0, y: 0 });
  const [addedToCart, setAddedToCart] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedBrand = BRANDS.find(b => b.id === brandId)!;
  const price = model ? getPrice(model.label) : 2400;

  // FIX 1: handleAddToCart was called but never defined
  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setPhotoUrl(URL.createObjectURL(file));
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const onMouseDown  = (e: React.MouseEvent) => { if (!photoUrl) return; setDragging(true); setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y }); };
  const onMouseMove  = (e: React.MouseEvent) => { if (!dragging) return; setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp    = () => setDragging(false);
  const onTouchStart = (e: React.TouchEvent) => { if (!photoUrl) return; const t = e.touches[0]; setDragging(true); setDragStart({ x: t.clientX - offset.x, y: t.clientY - offset.y }); };
  const onTouchMove  = (e: React.TouchEvent) => { if (!dragging) return; const t = e.touches[0]; setOffset({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }); };

  const photoStyle = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: dragging ? 'none' : 'transform 0.1s',
    ...(template === 'centered' ? { padding: '12%' }               : {}),
    ...(template === 'top'      ? { clipPath: 'inset(0 0 50% 0)' } : {}),
  };

  // FIX 3: Step 4 "done" now reflects addedToCart instead of hardcoded false
  const STEPS = [
    { n: 1 as const, label: 'Model', done: !!model       },
    { n: 2 as const, label: 'Style', done: step > 2      },
    { n: 3 as const, label: 'Photo', done: !!photoUrl    },
    { n: 4 as const, label: 'Order', done: addedToCart   },
  ];

  return (
    <div className="w-full min-w-0 overflow-x-hidden max-w-7xl sm:px-6 lg:px-40 px-4">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 min-w-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-medium">Custom Case</span>
        </div>

        {/* Header */}
        <section className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-1">Design your case</h1>
          <p className="text-sm text-muted-foreground">Upload your photo, preview live, and order. We print and deliver island-wide.</p>
        </section>

        {/* Step pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2 px-3 sm:px-0">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 shrink-0">
              <button type="button"
                onClick={() => {
                  if (s.n === 1) setStep(1);
                  if (s.n === 2 && model) setStep(2);
                  if (s.n === 3 && model) setStep(3);
                  if (s.n === 4 && model && photoUrl) setStep(4);
                }}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
                  ${step === s.n
                    ? 'border-foreground bg-foreground text-background'
                    : s.done
                      ? 'border-border bg-background text-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                  ${s.done ? 'bg-green-500 text-white' : step === s.n ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {s.done ? '✓' : s.n}
                </span>
                {s.label}
              </button>
              {i < 3 && <ChevronRight size={12} className="text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">

          {/* Left: preview */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative w-full max-w-[280px] mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-secondary select-none"
              style={{ cursor: photoUrl ? (dragging ? 'grabbing' : 'grab') : 'default' }}
              onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
              onDragOver={(e) => e.preventDefault()}
            >
              {photoUrl && (
                <div className="absolute inset-0 overflow-hidden">
                  <img src={photoUrl} alt="Your photo"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    style={photoStyle} draggable={false} />
                </div>
              )}

              {/* Case overlay on top */}
              {model && (
                <img src={`/phoneCases/${model.file}`} alt="Case"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                  draggable={false} />
              )}

              {photoUrl && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none">
                  <Move size={9} /> drag to reposition
                </div>
              )}
            </div>

            {/* Zoom controls */}
            {photoUrl && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setZoom(z => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))))}
                  className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"><ZoomOut size={15} /></button>
                <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom(z => Math.min(3, parseFloat((z + 0.1).toFixed(1))))}
                  className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"><ZoomIn size={15} /></button>
                <button type="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
                  className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"><RotateCw size={15} /></button>
                <button type="button" onClick={() => { setPhotoUrl(null); setZoom(1); setOffset({ x: 0, y: 0 }); }}
                  className="p-2 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"><X size={15} /></button>
              </div>
            )}

            {model && (
              <p className="text-xs text-muted-foreground text-center">{model.label} · LKR {price.toLocaleString()}</p>
            )}
          </div>

          {/* Right: steps */}
          <div className="flex flex-col gap-4">

            {/* Step 1: model */}
            <div className={`rounded-2xl border overflow-hidden transition-all ${step === 1 ? 'border-foreground/20' : 'border-border'}`}>
              <button type="button" onClick={() => setStep(1)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${model ? 'bg-green-500 text-white' : 'bg-foreground text-background'}`}>{model ? '✓' : '1'}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Select model</p>
                    {model && <p className="text-xs text-muted-foreground">{model.label}</p>}
                  </div>
                </div>
                <ChevronRight size={15} className={`text-muted-foreground transition-transform ${step === 1 ? 'rotate-90' : ''}`} />
              </button>

              {step === 1 && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="flex gap-2 pt-4 mb-4 overflow-x-auto scrollbar-hide pb-1">
                    {BRANDS.map(b => (
                      <button key={b.id} type="button"
                        onClick={() => { setBrandId(b.id); setModel(null); }}
                        className={`shrink-0 px-4 py-1.5 rounded-full border text-xs font-medium transition-all
                          ${brandId === b.id
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-background text-foreground border-border hover:border-foreground/30 hover:text-foreground'
                          }`}>
                        {b.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto scrollbar-hide">
                    {selectedBrand.models.map(m => (
                      <button key={m.file} type="button"
                        onClick={() => { setModel(m); setStep(2); }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all
                          ${model?.file === m.file
                            ? 'bg-foreground text-background border-foreground'
                            : 'bg-background text-foreground border-border hover:border-foreground/30'
                          }`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: style */}
            <div className={`rounded-2xl border overflow-hidden transition-all ${step === 2 ? 'border-foreground/20' : 'border-border'}`}>
              <button type="button" onClick={() => model && setStep(2)} disabled={!model}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors disabled:opacity-40">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${step > 2 ? 'bg-green-500 text-white' : 'bg-foreground text-background'}`}>{step > 2 ? '✓' : '2'}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Choose style</p>
                    {step > 2 && <p className="text-xs text-muted-foreground">{TEMPLATES.find(t => t.id === template)?.label}</p>}
                  </div>
                </div>
                <ChevronRight size={15} className={`text-muted-foreground transition-transform ${step === 2 ? 'rotate-90' : ''}`} />
              </button>

              {step === 2 && (
                <div className="px-5 pb-5 border-t border-border pt-4 grid grid-cols-3 gap-2">
                  {TEMPLATES.map(t => (
                    <button key={t.id} type="button"
                      onClick={() => { setTemplate(t.id); setStep(3); }}
                      className={`p-3 rounded-xl border text-left transition-all
                        ${template === t.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'}`}>
                      <p className="text-xs font-semibold text-foreground">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: upload */}
            <div className={`rounded-2xl border overflow-hidden transition-all ${step === 3 ? 'border-foreground/20' : 'border-border'}`}>
              <button type="button" onClick={() => model && setStep(3)} disabled={!model}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors disabled:opacity-40">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    ${photoUrl ? 'bg-green-500 text-white' : 'bg-foreground text-background'}`}>{photoUrl ? '✓' : '3'}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">Upload photo</p>
                    {photoUrl && <p className="text-xs text-muted-foreground">Photo ready</p>}
                  </div>
                </div>
                <ChevronRight size={15} className={`text-muted-foreground transition-transform ${step === 3 ? 'rotate-90' : ''}`} />
              </button>

              {step === 3 && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                  {!photoUrl ? (
                    <div
                      className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-foreground/30 hover:bg-secondary/20 transition-all"
                      onClick={() => fileRef.current?.click()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                        <Upload size={20} className="text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Tap to upload</p>
                        <p className="text-xs text-muted-foreground mt-0.5">or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, HEIC · up to 20MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
                      <img src={photoUrl} alt="uploaded" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">Photo uploaded</p>
                        <p className="text-xs text-muted-foreground">Drag on the preview to reposition</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => fileRef.current?.click()}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">
                          Change
                        </button>
                        <button type="button" onClick={() => setStep(4)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors">
                          Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 4 — order */}
            {step === 4 && photoUrl && (
              <div className="rounded-2xl border border-foreground/20 bg-background p-5">
                <p className="text-sm font-semibold text-foreground mb-1">Ready to order</p>
                <p className="text-xs text-muted-foreground mb-4">
                  We will print your design and deliver island-wide within 5–7 days.
                </p>

                {/* Summary */}
                <div className="rounded-xl bg-secondary/40 p-3 mb-4 text-sm">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-muted-foreground">Model</span>
                    {/* FIX 2: was {model} which renders [object Object] */}
                    <span className="font-medium text-foreground text-right max-w-[60%]">{model?.label}</span>
                  </div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-muted-foreground">Style</span>
                    <span className="font-medium text-foreground">{TEMPLATES.find(t => t.id === template)?.label}</span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-border">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-foreground">LKR {price.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all
                    ${addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]'
                    }`}
                >
                  {addedToCart
                    ? <><Check size={16} /> Added to cart</>
                    : <><ShoppingBag size={16} /> Add to cart — LKR {price.toLocaleString()}</>
                  }
                </button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  COD available · Island-wide delivery · 7-day guarantee
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Sticky mobile CTA */}
      {photoUrl && step !== 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background border-t border-border px-4 py-3 flex items-center gap-3">
          <div>
            {/* FIX 2 (also applies here): was {model} which renders [object Object] */}
            <p className="text-xs text-muted-foreground">{model?.label}</p>
            <p className="text-base font-bold text-foreground">LKR {price.toLocaleString()}</p>
          </div>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="flex-1 py-3 rounded-xl bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            Preview & order
          </button>
        </div>
      )}
      {photoUrl && <div className="h-20 sm:hidden" />}
    </div>
  );
}