import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import {
  Star, Quote, ArrowRight, Check, Menu, X, Loader2,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Github, Globe, ExternalLink,
  Mail, Phone, MapPin, ChevronDown, ChevronRight, ZoomIn, icons, type LucideIcon
} from 'lucide-react';
import { cn } from './lib/utils';

// ===== Inline Accordion (matches shadcn/ui) =====
const Accordion = AccordionPrimitive.Root;
const AccordionItem = ({ className, ...props }: any) => (
  <AccordionPrimitive.Item className={cn("border-b", className)} {...props} />
);
const AccordionTrigger = ({ className, children, ...props }: any) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)} {...props}>
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
const AccordionContent = ({ className, children, ...props }: any) => (
  <AccordionPrimitive.Content className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down" {...props}>
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
);

// ===== Inline Button =====
function Button({ className, variant, size, style, children, disabled, onClick, type, asChild, ...props }: any) {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants: any = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  const sizes: any = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button className={cn(base, variants[variant || 'default'], sizes[size || 'default'], className)} style={style} disabled={disabled} onClick={onClick} type={type || 'button'} {...props}>
      {children}
    </button>
  );
}

// ===== DynamicIcon =====
function DynamicIcon({ name, className, size = 16 }: { name: string; className?: string; size?: number }) {
  const formatted = name.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  const Icon = (icons as Record<string, LucideIcon>)[formatted];
  if (!Icon) { const C = icons.Circle; return <C className={cn('text-muted-foreground', className)} size={size} />; }
  return <Icon className={className} size={size} />;
}

// ===== ScrollReveal =====
function ScrollReveal({ children, className = '', animation = 'fade-up', delay = 0, duration = 700 }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsVisible(true); ob.unobserve(el); } }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
  const baseStyles: React.CSSProperties = { transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}, filter ${duration}ms ${easing}`, transitionDelay: `${delay}ms`, willChange: 'opacity, transform' };
  const anims: any = {
    'fade-up': { hidden: { opacity: 0, transform: 'translateY(40px)' }, visible: { opacity: 1, transform: 'translateY(0)' } },
    'fade-in': { hidden: { opacity: 0 }, visible: { opacity: 1 } },
    'slide-left': { hidden: { opacity: 0, transform: 'translateX(-60px)' }, visible: { opacity: 1, transform: 'translateX(0)' } },
    'slide-right': { hidden: { opacity: 0, transform: 'translateX(60px)' }, visible: { opacity: 1, transform: 'translateX(0)' } },
    'blur-in': { hidden: { opacity: 0, transform: 'translateY(20px) scale(0.98)', filter: 'blur(10px)' }, visible: { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' } },
    'scale': { hidden: { opacity: 0, transform: 'scale(0.9)' }, visible: { opacity: 1, transform: 'scale(1)' } },
    'zoom-in': { hidden: { opacity: 0, transform: 'scale(0.75)' }, visible: { opacity: 1, transform: 'scale(1)' } },
    'bounce-in': { hidden: { opacity: 0, transform: 'translateY(50px) scale(0.95)' }, visible: { opacity: 1, transform: 'translateY(0) scale(1)' } },
    'flip-up': { hidden: { opacity: 0, transform: 'perspective(1000px) rotateX(15deg) translateY(30px)' }, visible: { opacity: 1, transform: 'perspective(1000px) rotateX(0) translateY(0)' } },
  };
  const cur = anims[animation] || anims['fade-up'];
  const s = isVisible ? cur.visible : cur.hidden;
  return <div ref={ref} className={className} style={{ ...baseStyles, ...s }}>{children}</div>;
}

// ===== SimpleDropdown with recursive nested submenus =====
const defaultSubmenuStyle = { animation: 'fade', background: 'solid', borderRadius: 'md', shadow: 'lg', showIcons: true, showDescriptions: true };

function getAnimationClasses(animation: string) {
  switch (animation) {
    case 'fade': return 'animate-in fade-in-0 duration-200';
    case 'slide-down': return 'animate-in slide-in-from-top-2 fade-in-0 duration-200';
    case 'scale': return 'animate-in zoom-in-95 fade-in-0 duration-200';
    case 'slide-up': return 'animate-in slide-in-from-bottom-2 fade-in-0 duration-200';
    default: return '';
  }
}
function getBackgroundClasses(bg: string) {
  switch (bg) {
    case 'blur': return 'backdrop-blur-md bg-background/80';
    case 'gradient': return 'bg-gradient-to-b from-background to-muted';
    default: return 'bg-popover';
  }
}
function getBorderRadiusClasses(r: string) {
  switch (r) { case 'none': return 'rounded-none'; case 'sm': return 'rounded-sm'; case 'lg': return 'rounded-lg'; case 'xl': return 'rounded-xl'; default: return 'rounded-md'; }
}
function getShadowClasses(s: string) {
  switch (s) { case 'none': return 'shadow-none'; case 'sm': return 'shadow-sm'; case 'md': return 'shadow-md'; case 'xl': return 'shadow-xl'; default: return 'shadow-lg'; }
}

const fontSizeMap: Record<string, string> = { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem' };

function NestedSubmenu({ item, submenuStyle, onNavigate, depth, fontSize }: { item: any; submenuStyle: any; onNavigate: (href: string) => void; depth: number; fontSize?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className={cn('w-full px-4 py-2.5 text-left hover:bg-muted/80 flex items-center gap-3 transition-colors text-popover-foreground')}
        onClick={(e: any) => { e.preventDefault(); if (item.href) onNavigate(item.href); }}
      >
        {submenuStyle.showIcons && item.icon && <DynamicIcon name={item.icon} className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="font-medium" style={{ fontSize: fontSize || undefined }}>{item.label}</div>
          {submenuStyle.showDescriptions && item.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</div>}
        </div>
        <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      </button>
      {item.children && item.children.length > 0 && (
        <div className={cn('absolute left-full top-0 pl-1 z-50 transition-all duration-200', isOpen ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-1 pointer-events-none')}>
          <div className={cn('min-w-44 py-2 border border-border', getBackgroundClasses(submenuStyle.background), getBorderRadiusClasses(submenuStyle.borderRadius), getShadowClasses(submenuStyle.shadow))}>
            {item.children.map((child: any, idx: number) => (
              child.children && child.children.length > 0 && depth < 3 ? (
                <NestedSubmenu key={idx} item={child} submenuStyle={submenuStyle} onNavigate={onNavigate} depth={depth + 1} fontSize={fontSize} />
              ) : (
                <button key={idx} onClick={() => onNavigate(child.href)}
                  className="w-full px-4 py-2.5 text-left hover:bg-muted/80 flex items-center gap-3 transition-colors text-popover-foreground">
                  {submenuStyle.showIcons && child.icon && <DynamicIcon name={child.icon} className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" style={{ fontSize: fontSize || undefined }}>{child.label}</div>
                    {submenuStyle.showDescriptions && child.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{child.description}</div>}
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SimpleDropdown({ item, headerSettings, onNavigate, linkClasses, textColor = 'inherit' }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const submenuStyle = headerSettings?.submenuStyle || defaultSubmenuStyle;
  const resolvedFontSize = fontSizeMap[headerSettings?.fontSize || 'base'] || fontSizeMap['base'];
  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button className={cn('flex items-center gap-1.5 transition-colors', linkClasses)} style={{ color: textColor }}
        onClick={(e: any) => { e.preventDefault(); if (item.href) onNavigate(item.href); }}>
        {submenuStyle.showIcons && item.icon && <DynamicIcon name={item.icon} className="w-4 h-4" />}
        <span style={{ fontSize: resolvedFontSize }}>{item.label}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {item.children && item.children.length > 0 && (
        <div className={cn('absolute top-full left-0 pt-2 z-50 transition-all duration-200', isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-1 pointer-events-none')}>
          <div className={cn('min-w-48 py-2 border border-border',
            getBackgroundClasses(submenuStyle.background || 'solid'),
            getBorderRadiusClasses(submenuStyle.borderRadius || 'md'),
            getShadowClasses(submenuStyle.shadow || 'lg')
          )}
            style={{ backgroundColor: submenuStyle.backgroundColor, borderColor: submenuStyle.borderColor }}
          >
            {item.children.map((child: any, idx: number) => (
              child.children && child.children.length > 0 ? (
                <NestedSubmenu key={idx} item={child} submenuStyle={submenuStyle} onNavigate={onNavigate} depth={1} fontSize={resolvedFontSize} />
              ) : (
                <button key={idx} onClick={() => { onNavigate(child.href); setIsOpen(false); }}
                  className="w-full px-4 py-2.5 text-left hover:bg-muted/80 flex items-center gap-3 transition-colors text-popover-foreground">
                  {submenuStyle.showIcons && child.icon && <DynamicIcon name={child.icon} className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" style={{ fontSize: resolvedFontSize }}>{child.label}</div>
                    {submenuStyle.showDescriptions && child.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{child.description}</div>}
                  </div>
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MultiSlideHero =====
function MultiSlideHero({ heroData }: { heroData: any }) {
  const config = useMemo(() => {
    if (heroData.config) return heroData.config;
    // Migrate legacy hero data
    const images = heroData.heroImages?.length ? heroData.heroImages : heroData.heroImage ? [heroData.heroImage] : [''];
    const slides = images.map((image: string, index: number) => ({
      id: 'slide-' + index,
      title: index === 0 ? heroData.heading : '',
      subtitle: index === 0 ? heroData.subheading : '',
      primaryButton: index === 0 && heroData.primaryCTA ? { text: heroData.primaryCTA, link: '#contact' } : undefined,
      secondaryButton: index === 0 && heroData.secondaryCTA ? { text: heroData.secondaryCTA, link: '#about' } : undefined,
      backgroundImage: image,
      overlayColor: '#000000',
      overlayOpacity: heroData.imageOverlay ?? 50,
    }));
    return {
      slides,
      slider: { enabled: images.length > 1, autoplay: true, autoplaySpeed: heroData.sliderInterval || 5000, transitionSpeed: 600, loop: true, pauseOnHover: true },
      layout: { fullWidth: true, height: 'custom', contentAlign: 'center', verticalAlign: 'middle', maxWidth: 1200 },
      navigation: { showArrows: true, showDots: true, arrowPosition: 'inside', dotPosition: 'bottom-center' },
      animation: { transitionType: 'fade', textAnimation: 'fade', textAnimationDelay: 200 },
      responsive: { heights: { desktop: 600, tablet: 500, mobile: 400 }, hideTextOnMobile: false, fontSizes: { desktop: { title: '4rem', subtitle: '1.5rem', description: '1.125rem' } } },
    };
  }, [heroData]);

  const slides = config.slides || [];
  const slider = config.slider || {};
  const layout = config.layout || {};
  const navigation = config.navigation || {};
  const animation = config.animation || {};
  const responsive = config.responsive || {};
  const isSingle = slides.length <= 1 || !slider.enabled;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isSingle || !slider.autoplay) return;
    const t = setInterval(() => { if (!isPaused) setCurrentIndex(c => (c + 1) % slides.length); }, slider.autoplaySpeed || 5000);
    return () => clearInterval(t);
  }, [isSingle, slider.autoplay, slider.autoplaySpeed, isPaused, slides.length]);

  const next = () => setCurrentIndex(c => (c + 1) % slides.length);
  const prev = () => setCurrentIndex(c => (c - 1 + slides.length) % slides.length);

  if (!config || slides.length === 0) return <div className="relative h-[600px] bg-muted flex items-center justify-center"><p className="text-muted-foreground">No hero content configured</p></div>;

  const heightStyle = layout.height === 'fullscreen' ? { height: '100vh' } : { height: responsive.heights?.desktop || 600 };

  return (
    <section className={cn('relative overflow-hidden', layout.fullWidth ? 'w-full' : 'container mx-auto')} style={heightStyle}
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="relative h-full">
        {slides.map((slide: any, index: number) => {
          const isActive = index === currentIndex;
          const overlayStyle = { backgroundColor: slide.overlayColor || '#000000', opacity: (slide.overlayOpacity ?? 50) / 100 };
          const transitionClass = animation.transitionType === 'zoom' ? (isActive ? 'scale-100 opacity-100' : 'scale-110 opacity-0') : (isActive ? 'opacity-100' : 'opacity-0');
          const alignH = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' }[layout.contentAlign || 'center'];
          const alignV = { top: 'justify-start pt-24', middle: 'justify-center', bottom: 'justify-end pb-24' }[layout.verticalAlign || 'middle'];

          return (
            <div key={slide.id || index} className={cn('absolute inset-0 will-change-transform transition-all', transitionClass, isActive ? 'z-10' : 'z-0')} style={{ transitionDuration: (slider.transitionSpeed || 600) + 'ms' }}>
              {slide.backgroundImage && (
                <div className="absolute inset-0 bg-cover bg-no-repeat" style={{ backgroundImage: 'url(' + slide.backgroundImage + ')', backgroundPosition: slide.backgroundPosition ? slide.backgroundPosition.x + '% ' + slide.backgroundPosition.y + '%' : 'center center' }} />
              )}
              <div className="absolute inset-0" style={overlayStyle} />
              <div className={cn('relative z-10 flex flex-col h-full px-4 sm:px-6 lg:px-8', alignH, alignV)} style={{ maxWidth: layout.maxWidth ? layout.maxWidth + 'px' : undefined, margin: '0 auto' }}>
                <div className={cn('max-w-4xl', isActive ? 'animate-fade-in' : 'opacity-0 translate-y-4')} style={{ animationDelay: (animation.textAnimationDelay || 200) + 'ms', animationFillMode: 'both' }}>
                  {slide.title && <h1 className="font-bold text-white mb-4 leading-tight" style={{ fontSize: responsive.fontSizes?.desktop?.title || '4rem', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{slide.title}</h1>}
                  {slide.subtitle && <p className="text-white/90 mb-6" style={{ fontSize: responsive.fontSizes?.desktop?.subtitle || '1.5rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{slide.subtitle}</p>}
                  {slide.description && <p className="text-white/80 mb-8 max-w-2xl" style={{ fontSize: responsive.fontSizes?.desktop?.description || '1.125rem' }}>{slide.description}</p>}
                  {(slide.primaryButton || slide.secondaryButton) && (
                    <div className={cn('flex flex-wrap gap-4', layout.contentAlign === 'center' && 'justify-center', layout.contentAlign === 'right' && 'justify-end')}>
                      {slide.primaryButton && <a href={slide.primaryButton.link || '#'} className="inline-flex items-center justify-center h-11 rounded-md px-8 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90">{slide.primaryButton.text}</a>}
                      {slide.secondaryButton && <a href={slide.secondaryButton.link || '#'} className="inline-flex items-center justify-center h-11 rounded-md px-8 text-sm font-semibold border-2 border-white text-white hover:bg-white/10">{slide.secondaryButton.text}</a>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {navigation.showArrows && !isSingle && (
        <>
          <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 left-0 mx-4 z-20 bg-black/20 hover:bg-black/40 text-white h-12 w-12 rounded-full flex items-center justify-center"><ChevronDown className="h-8 w-8 -rotate-90" /></button>
          <button onClick={next} className="absolute top-1/2 -translate-y-1/2 right-0 mx-4 z-20 bg-black/20 hover:bg-black/40 text-white h-12 w-12 rounded-full flex items-center justify-center"><ChevronDown className="h-8 w-8 rotate-90" /></button>
        </>
      )}
      {navigation.showDots && !isSingle && (
        <div className="absolute bottom-8 z-20 flex gap-2 left-1/2 -translate-x-1/2">
          {slides.map((_: any, index: number) => (
            <button key={index} onClick={() => setCurrentIndex(index)} className={cn('w-2 h-2 rounded-full transition-all duration-300', index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70')} />
          ))}
        </div>
      )}
    </section>
  );
}

// ===== Gallery with lightbox =====
function GalleryGrid({ images, columnLayout = '4' }: { images: string[]; columnLayout?: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <>
      <div className={cn('grid gap-4', columnLayout === '2' && 'grid-cols-2', columnLayout === '3' && 'grid-cols-2 md:grid-cols-3', (columnLayout === '4' || !columnLayout) && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4')}>
        {images.map((img: string, index: number) => (
          <div key={index} className="rounded-lg overflow-hidden group cursor-pointer relative aspect-square" onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }}>
            <img src={img} alt={'Gallery image ' + (index + 1)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white" />
            </div>
          </div>
        ))}
      </div>
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 p-2 rounded" onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}><X className="h-6 w-6" /></button>
          <div className="absolute top-4 left-4 z-50 text-white/80 text-sm">{lightboxIndex + 1} / {images.length}</div>
          {lightboxIndex > 0 && <button className="absolute left-4 z-50 text-white hover:bg-white/20 p-2 rounded" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i - 1); }}><ChevronDown className="h-8 w-8 -rotate-90" /></button>}
          {lightboxIndex < images.length - 1 && <button className="absolute right-4 z-50 text-white hover:bg-white/20 p-2 rounded" onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => i + 1); }}><ChevronDown className="h-8 w-8 rotate-90" /></button>}
          <img src={images[lightboxIndex]} alt="" className="max-w-full max-h-[80vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

// ===== Helper functions =====
const hexToHsl = (hex: string): string => {
  if (!hex || !hex.startsWith('#')) return hex;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; } }
  return Math.round(h * 360) + ' ' + Math.round(s * 100) + '% ' + Math.round(l * 100) + '%';
};
const isColorDark = (color: string): boolean => { if (!color || !color.startsWith('#')) return false; const hex = color.replace('#', ''); const r = parseInt(hex.substr(0, 2), 16); const g = parseInt(hex.substr(2, 2), 16); const b = parseInt(hex.substr(4, 2), 16); return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5; };
const hexToRgba = (hex: string, alpha: number) => { if (!hex?.startsWith('#') || hex.length !== 7) return hex; const r = parseInt(hex.slice(1, 3), 16); const g = parseInt(hex.slice(3, 5), 16); const b = parseInt(hex.slice(5, 7), 16); return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'; };
const slugify = (text?: string): string => { if (!text) return ''; return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); };

// ===== MAIN SiteRenderer =====
export function SiteRenderer({ content, businessName }: { content: any; businessName: string }) {
  const { header, footer, hero, sections: rawSections, pages, globalStyles } = content;
  const defaultHeaderSettings = { isSticky: true, stickyStyle: 'always', height: 'normal', background: { type: 'solid', color: '#1F2937', opacity: 95 }, scrolledBackground: { type: 'blur', color: '#1F2937', blurAmount: 12, opacity: 95 }, borderBottom: true, shadow: 'lg', scrollTransition: true, animationDuration: 300, mobileBreakpoint: 'lg', hoverEffect: 'color', linkWeight: 'medium', linkStyle: 'normal' };
  const headerSettings = { ...defaultHeaderSettings, ...header?.headerSettings, ...header?.settings };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState('');

  // Multi-page support
  useEffect(() => { if (pages?.length > 0 && !currentPage) { const h = pages.find((p: any) => p.isHome); setCurrentPage(h?.slug || pages[0]?.slug || ''); } }, [pages]);

  const { activeSections, showHero, activePage } = useMemo(() => {
    if (pages && pages.length > 0) {
      const page = pages.find((p: any) => p.slug === currentPage) || pages.find((p: any) => p.isHome);
      if (page) return { activePage: page, activeSections: page.sections || [], showHero: page.isHome };
    }
    return { activePage: null, activeSections: rawSections || [], showHero: true };
  }, [pages, rawSections, currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);
      setScrollDirection(y > lastScrollY ? 'down' : 'up');
      setLastScrollY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scopedThemeStyles = useMemo(() => {
    const colors = globalStyles?.colors;
    if (!colors) return {} as React.CSSProperties;
    return {
      '--site-primary': colors.primary ? hexToHsl(colors.primary) : undefined,
      '--site-secondary': colors.secondary ? hexToHsl(colors.secondary) : undefined,
      '--site-accent': colors.accent ? hexToHsl(colors.accent) : undefined,
      '--site-background': colors.background ? hexToHsl(colors.background) : undefined,
      '--site-foreground': colors.text ? hexToHsl(colors.text) : undefined,
      '--site-muted': colors.muted ? hexToHsl(colors.muted) : undefined,
    } as React.CSSProperties;
  }, [globalStyles?.colors]);

  const customColors = globalStyles?.colors;
  const isDarkTheme = customColors && (isColorDark(customColors.background || '') || isColorDark(customColors.secondary || ''));
  const primaryBtnStyle = customColors ? { backgroundColor: customColors.primary, color: '#FFFFFF', borderColor: customColors.primary } : undefined;
  const accentBgStyle = customColors ? { backgroundColor: (customColors.accent || customColors.primary) + '15' } : undefined;

  const handleNavClick = (e: any, href: string) => {
    if (href.startsWith('/')) { e.preventDefault(); setCurrentPage(href.slice(1)); setMobileMenuOpen(false); window.scrollTo(0,0); return; }
    if (href.startsWith('#')) { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); return; }
    setMobileMenuOpen(false);
  };

  const onNavigate = (slug: string) => { setCurrentPage(slug); window.scrollTo(0, 0); setMobileMenuOpen(false); };

  // Header helpers
  const getStickyClass = () => { if (!headerSettings.isSticky) return 'relative'; if (headerSettings.stickyStyle === 'scroll-up') return scrollDirection === 'up' ? 'sticky top-0' : 'relative -translate-y-full'; if (headerSettings.stickyStyle === 'after-hero') return isScrolled ? 'fixed top-0 w-full' : 'absolute top-0 w-full'; return 'sticky top-0'; };
  const getHeightClass = () => ({ compact: 'py-2', tall: 'py-6', normal: 'py-4' }[headerSettings.height] || 'py-4');
  const getHeaderLogoHeight = () => { if (header?.logoDimensions?.height) return header.logoDimensions.height; return ({ compact: 56, tall: 96, normal: 80 }[headerSettings.height] || 80); };
  const getShadowClass = () => { if (isScrolled) return 'shadow-lg'; return ''; };
  const getActiveBackground = () => { const defaultBg = { type: 'solid', color: '#1F2937', opacity: 100 }; return isScrolled && headerSettings.scrollTransition && headerSettings.scrolledBackground ? (headerSettings.scrolledBackground || defaultBg) : (headerSettings.background || defaultBg); };
  const getHeaderBackgroundStyle = () => { const bg = getActiveBackground(); const opacity = (bg.opacity ?? 100) / 100; if (bg.type === 'transparent') return { backgroundColor: 'transparent' }; if (bg.type === 'gradient') { const angle = bg.gradientDirection === 'vertical' ? '180deg' : bg.gradientDirection === 'diagonal' ? '135deg' : '90deg'; return { background: 'linear-gradient(' + angle + ', ' + hexToRgba(bg.gradientFrom || '#1F2937', opacity) + ', ' + hexToRgba(bg.gradientTo || '#374151', opacity) + ')' }; } if (bg.type === 'blur') return { backgroundColor: hexToRgba(bg.color || '#1F2937', opacity), backdropFilter: 'blur(' + (bg.blurAmount || 12) + 'px)', WebkitBackdropFilter: 'blur(' + (bg.blurAmount || 12) + 'px)' }; return { backgroundColor: hexToRgba(bg.color || '#1F2937', opacity) }; };
  const getHeaderTextColor = () => { const bg = getActiveBackground(); if (bg.type === 'transparent') return '#0F172A'; let c = '#1F2937'; if (bg.type === 'solid' || bg.type === 'blur') c = bg.color || '#1F2937'; else if (bg.type === 'gradient') c = bg.gradientFrom || '#1F2937'; return isColorDark(c) ? '#FFFFFF' : '#0F172A'; };
  const bpClasses = (() => { switch (headerSettings.mobileBreakpoint) { case 'sm': return { show: 'hidden sm:flex', hide: 'sm:hidden' }; case 'md': return { show: 'hidden md:flex', hide: 'md:hidden' }; default: return { show: 'hidden lg:flex', hide: 'lg:hidden' }; } })();
  const getLinkClasses = () => { const c: string[] = []; switch (headerSettings.hoverEffect) { case 'underline': c.push('nav-link-hover-underline'); break; case 'color': c.push('nav-link-hover-color'); break; case 'background': c.push('nav-link-hover-background'); break; case 'scale': c.push('nav-link-hover-scale'); break; } switch (headerSettings.linkStyle) { case 'uppercase': c.push('nav-link-uppercase'); break; case 'small-caps': c.push('nav-link-small-caps'); break; } switch (headerSettings.linkWeight) { case 'medium': c.push('font-medium'); break; case 'semibold': c.push('font-semibold'); break; case 'bold': c.push('font-bold'); break; } return c.join(' '); };
  const resolvedFontSize = fontSizeMap[headerSettings.fontSize || 'base'] || fontSizeMap['base'];
  const navFontFamily = headerSettings.fontFamily || undefined;
  const navLinkStyle = { fontSize: resolvedFontSize, fontFamily: navFontFamily } as React.CSSProperties;
  const isCenteredLayout = headerSettings.alignment === 'center' || headerSettings.layout === 'centered';

  return (
    <div className="min-h-screen site-theme-scope" style={scopedThemeStyles}>
      {/* Header */}
      {header && (
        <header className={cn('z-50 transition-all', getStickyClass(), getShadowClass(), headerSettings.borderBottom && 'border-b border-border')}
          style={{ ...getHeaderBackgroundStyle(), color: getHeaderTextColor(), transitionDuration: (headerSettings.animationDuration || 300) + 'ms' }}>
          <div className="container mx-auto" style={{ padding: (headerSettings.paddingY ?? 8) + 'px ' + (headerSettings.paddingX ?? 24) + 'px' }}>
          <div className={cn('flex items-center',
              ({ compact: 'h-14', tall: 'h-24', normal: 'h-20' }[headerSettings.height] || 'h-20'),
              headerSettings.layout === 'centered' ? 'justify-center gap-8' :
              headerSettings.alignment === 'left' ? 'justify-start gap-8' :
              headerSettings.alignment === 'center' ? 'justify-center gap-8' :
              headerSettings.alignment === 'right' ? 'justify-end gap-8' :
              'justify-between'
            )}>
            <div className={cn(
              "flex-shrink-0",
              headerSettings.layout === 'centered' && 'order-[3] mx-auto',
              headerSettings.showLogo === false && 'hidden',
              (headerSettings.logoPosition || 'left') === 'left' && 'order-2',
              headerSettings.logoPosition === 'center' && 'order-[3] mx-auto',
              headerSettings.logoPosition === 'right' && 'order-[5]',
            )}>
              {header.logo ? (
                <div style={{ height: getHeaderLogoHeight() + 'px' }}>
                  <img src={header.logo} alt={businessName} style={{ height: '100%', width: 'auto', objectFit: 'contain', objectPosition: 'left center', transform: 'scale(1.18)', transformOrigin: 'left center', display: 'block' }} />
                </div>
              ) : (
                <span className="text-xl sm:text-2xl font-bold truncate max-w-[180px] sm:max-w-none" style={{ color: 'inherit' }}>{header.logoText || businessName}</span>
              )}
            </div>
            <div className={cn(bpClasses.show, 'items-center gap-6 order-3', isCenteredLayout && 'flex-1 justify-center')}>
              {header.megaMenuItems && header.megaMenuItems.length > 0 ? (
              <nav className="flex items-center" style={{ gap: (headerSettings.itemSpacing ?? 24) + 'px' }}>
                  {header.megaMenuItems.map((item: any) =>
                    item.type === 'simple-dropdown' && item.children?.length > 0 ? (
                      <SimpleDropdown key={item.id} item={item} headerSettings={headerSettings} onNavigate={(href: string) => { if (href.startsWith('/')) onNavigate(href.slice(1)); else if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); else window.location.href = href; }} linkClasses={getLinkClasses()} textColor={getHeaderTextColor()} />
                    ) : (
                      <a key={item.id} href={item.href || '#'} onClick={(e: any) => handleNavClick(e, item.href || '#')}
                        className={cn('rounded-md transition-colors', getLinkClasses())} style={navLinkStyle}>
                        {item.icon && <DynamicIcon name={item.icon} className="w-4 h-4 mr-1 inline" />}
                        {item.label}
                      </a>
                    )
                  )}
                </nav>
              ) : header.navItems ? (
                <nav className="flex items-center" style={{ gap: (headerSettings.itemSpacing ?? 24) + 'px' }}>
                  {header.navItems.map((item: any, i: number) => (
                    item.children?.length > 0 ? (
                      <SimpleDropdown key={i} item={item} headerSettings={headerSettings} onNavigate={(href: string) => { if (href.startsWith('/')) onNavigate(href.slice(1)); else if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); else window.location.href = href; }} linkClasses={getLinkClasses()} textColor={getHeaderTextColor()} />
                    ) : (
                      <a key={i} href={item.href || '#'} onClick={(e: any) => handleNavClick(e, item.href || '#')}
                        className={cn('rounded-md transition-colors', getLinkClasses())} style={navLinkStyle}>
                        {item.label}
                      </a>
                    )
                  ))}
                </nav>
              ) : null}
            </div>
            {header.ctaButton && headerSettings?.showCtaButton !== false && (header.ctaButton.href ? <a href={header.ctaButton.href} target={header.ctaButton.href.startsWith('http') ? '_blank' : undefined} rel={header.ctaButton.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="order-4"><Button size="sm" style={primaryBtnStyle} className="font-semibold min-h-[40px]">{header.ctaButton.text}</Button></a> : <Button size="sm" style={primaryBtnStyle} className="font-semibold min-h-[40px] order-4">{header.ctaButton.text}</Button>)}
            <button className={cn('p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md transition-colors', bpClasses.hide)} style={{ color: 'inherit' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              <Menu className="w-6 h-6" style={{ color: 'inherit' }} />
            </button>
          </div>
          </div>
        </header>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] z-[70] text-white flex flex-col shadow-2xl animate-slide-in-right" style={getHeaderBackgroundStyle()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center">
                {header?.logo ? <img src={header.logo} alt={businessName} style={{ height: getHeaderLogoHeight() + 'px', width: 'auto', objectFit: 'contain', transform: 'scale(1.18)', transformOrigin: 'left center', display: 'block' }} /> : <span className="text-lg font-bold">{header?.logoText || businessName}</span>}
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:opacity-70 transition-opacity" aria-label="Close menu"><X className="w-6 h-6" /></button>
            </div>
            <nav className="flex flex-col px-6 flex-1 overflow-y-auto">
              {header?.megaMenuItems?.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {header.megaMenuItems.map((item: any) =>
                    item.children?.length > 0 ? (
                      <AccordionItem key={item.id} value={item.id} className="border-b border-white/10">
                        <AccordionTrigger className="py-4 text-base sm:text-lg font-medium hover:no-underline opacity-90 hover:opacity-100">
                          <span className="flex items-center gap-2">{item.icon && <DynamicIcon name={item.icon} className="w-5 h-5" />}{item.label}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-1 pl-4">
                            {item.children.map((child: any, ci: number) => (
                              <a key={ci} href={child.href} onClick={(e: any) => handleNavClick(e, child.href)} className="block py-2.5 text-sm opacity-80 hover:opacity-100 transition-opacity">
                                {child.icon && <DynamicIcon name={child.icon} className="w-4 h-4 mr-2 inline" />}{child.label}
                              </a>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <a key={item.id} href={item.href || '#'} onClick={(e: any) => handleNavClick(e, item.href || '#')}
                        className="py-4 text-base sm:text-lg font-medium border-b border-white/10 flex items-center transition-opacity opacity-90 hover:opacity-100">
                        {item.icon && <DynamicIcon name={item.icon} className="w-5 h-5 mr-2" />}{item.label}
                      </a>
                    )
                  )}
                </Accordion>
              ) : header?.navItems ? (
                <Accordion type="single" collapsible className="w-full">
                  {header.navItems.map((item: any, i: number) =>
                    item.children?.length > 0 ? (
                      <AccordionItem key={i} value={'nav-' + i} className="border-b border-white/10">
                        <AccordionTrigger className="py-4 text-base sm:text-lg font-medium hover:no-underline opacity-90 hover:opacity-100">
                          <span className="flex items-center gap-2">{item.label}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="space-y-1 pl-4">
                            {item.children.map((child: any, ci: number) => (
                              <a key={ci} href={child.href} onClick={(e: any) => handleNavClick(e, child.href)} className="block py-2.5 text-sm opacity-80 hover:opacity-100 transition-opacity">
                                {child.label}
                              </a>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <a key={i} href={item.href || '#'} onClick={(e: any) => handleNavClick(e, item.href || '#')}
                        className="py-4 text-base sm:text-lg font-medium border-b border-white/10 flex items-center transition-opacity opacity-90 hover:opacity-100">{item.label}</a>
                    )
                  )}
                </Accordion>
              ) : null}
            </nav>
            {header?.ctaButton && (
              <div className="p-6 border-t border-white/10">{header.ctaButton.href ? <a href={header.ctaButton.href} target={header.ctaButton.href.startsWith('http') ? '_blank' : undefined} rel={header.ctaButton.href.startsWith('http') ? 'noopener noreferrer' : undefined}><Button size="lg" style={primaryBtnStyle} className="font-semibold w-full min-h-[52px]">{header.ctaButton.text}</Button></a> : <Button size="lg" style={primaryBtnStyle} className="font-semibold w-full min-h-[52px]">{header.ctaButton.text}</Button>}</div>
            )}
          </div>
        </>
      )}

      {/* Hero */}
      {showHero && hero && <MultiSlideHero heroData={hero} />}

      {/* Page Title for non-home pages */}
      {!showHero && activePage && (
        <section className="py-10 sm:py-12 px-4 sm:px-6 bg-muted/30" style={accentBgStyle}>
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">{activePage.title}</h1>
          </div>
        </section>
      )}

      {/* Dynamic Sections */}
      {activeSections.map((section: any, index: number) => {
        const bgStyle = section.settings?.background?.type === 'color' ? { backgroundColor: section.settings.background.value } : section.settings?.background?.type === 'gradient' ? { background: section.settings.background.value } : undefined;
        const isImageBg = section.settings?.background?.type === 'image';
        const textClass = isImageBg ? 'text-white' : '';
        const sectionId = section.settings?.anchorId || section.anchorId || slugify(section.title) || (section.type + '-' + index);

        switch (section.type) {
          case 'about': {
            const variant = section.settings?.layoutVariant || 'about-image-left';
            const isRight = variant === 'about-image-right';
            const isCentered = variant === 'about-centered' || variant === 'hero-centered';
            const isSplit = variant === 'hero-split';
            const isSplitCards = variant === 'about-split-cards';

            if (isCentered) {
              return (
                <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-background" style={bgStyle}>
                  <div className="container mx-auto max-w-4xl text-center">
                    {section.image && <ScrollReveal animation="blur-in" delay={100}><img src={section.image} alt={section.title} className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-video mb-8" /></ScrollReveal>}
                    <ScrollReveal animation="fade-up" delay={200}>
                      {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 ' + textClass}>{section.title}</h2>}
                      <div className={'text-base sm:text-lg lg:text-xl leading-relaxed whitespace-pre-line ' + (isImageBg ? 'text-white/90' : 'text-muted-foreground')} dangerouslySetInnerHTML={{ __html: section.body || '' }} />
                    </ScrollReveal>
                  </div>
                </section>
              );
            }

            if (isSplit) {
              return (
                <section key={index} id={sectionId} className="min-h-[60vh] flex items-center bg-background" style={bgStyle}>
                  <div className="container mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                      <ScrollReveal animation="fade-up" delay={100}>
                        <div>
                          {!section.settings?.hideTitle && <h2 className={'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 ' + textClass}>{section.title}</h2>}
                          <div className={'text-base sm:text-lg lg:text-xl leading-relaxed whitespace-pre-line ' + (isImageBg ? 'text-white/90' : 'text-muted-foreground')} dangerouslySetInnerHTML={{ __html: section.body || '' }} />
                        </div>
                      </ScrollReveal>
                      {section.image && <ScrollReveal animation="blur-in" delay={200}><img src={section.image} alt={section.title} className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-[4/3]" /></ScrollReveal>}
                    </div>
                  </div>
                </section>
              );
            }

            if (isSplitCards) {
              return (
                <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-background" style={bgStyle}>
                  <div className="container mx-auto max-w-6xl">
                    {!section.settings?.hideTitle && <ScrollReveal animation="blur-in"><h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-14 ' + textClass}>{section.title}</h2></ScrollReveal>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      {section.image && <ScrollReveal animation="blur-in" delay={100}><div className="bg-card border border-border rounded-2xl overflow-hidden"><img src={section.image} alt={section.title} className="w-full h-full object-cover aspect-[4/3]" /></div></ScrollReveal>}
                      <ScrollReveal animation="fade-up" delay={200}>
                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-center h-full">
                          <div className={'text-base sm:text-lg leading-relaxed whitespace-pre-line ' + (isImageBg ? 'text-white/90' : 'text-muted-foreground')} dangerouslySetInnerHTML={{ __html: section.body || '' }} />
                        </div>
                      </ScrollReveal>
                    </div>
                  </div>
                </section>
              );
            }

            return (
              <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-6xl">
                  <div className={'grid grid-cols-1 ' + (section.image ? 'lg:grid-cols-2 gap-8 lg:gap-12 items-center' : '')}>
                    {section.image && !isRight && (
                      <ScrollReveal animation="blur-in" delay={100}>
                        <div className="relative"><img src={section.image} alt={section.title} className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-[4/3]" /></div>
                      </ScrollReveal>
                    )}
                    <ScrollReveal animation="fade-up" delay={200}>
                      <div className={section.image ? 'text-center lg:text-left' : 'max-w-4xl mx-auto text-center'}>
                        {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 ' + textClass}>{section.title}</h2>}
                        <div className={'text-base sm:text-lg lg:text-xl leading-relaxed whitespace-pre-line ' + (isImageBg ? 'text-white/90' : 'text-muted-foreground')} dangerouslySetInnerHTML={{ __html: section.body || '' }} />
                      </div>
                    </ScrollReveal>
                    {section.image && isRight && (
                      <ScrollReveal animation="blur-in" delay={200}>
                        <div className="relative"><img src={section.image} alt={section.title} className="rounded-2xl shadow-xl w-full h-auto object-cover aspect-[4/3]" /></div>
                      </ScrollReveal>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          case 'services':
          case 'features':
            return (
              <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-muted/30" style={bgStyle || accentBgStyle}>
                <div className="container mx-auto max-w-6xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 ' + textClass}>{section.title}</h2>}
                    {section.body && <div className={'text-center mb-10 sm:mb-14 max-w-2xl mx-auto text-base sm:text-lg ' + (isImageBg ? 'text-white/80' : 'text-muted-foreground')} dangerouslySetInnerHTML={{ __html: section.body }} />}
                  </ScrollReveal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                    {section.items?.map((item: any, i: number) => (
                      <ScrollReveal key={i} animation="flip-up" delay={i * 80}>
                        <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                          {item.image && <div className="aspect-[16/10] overflow-hidden bg-muted"><img src={item.image} alt={item.name || item.title || ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" /></div>}
                          <div className="p-6 sm:p-8 flex-1 flex flex-col">
                            {!item.image && (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4" style={customColors ? { backgroundColor: customColors.primary + '20' } : undefined}>
                                {item.icon ? <span className="text-2xl sm:text-3xl">{item.icon}</span> : <Check className="h-7 w-7 sm:h-8 sm:w-8 text-primary" style={customColors ? { color: customColors.primary } : undefined} />}
                              </div>
                            )}
                            <h3 className="font-semibold text-lg sm:text-xl mb-3">{item.name || item.title}</h3>
                            <div className="text-muted-foreground text-sm sm:text-base flex-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.description || item.body || '' }} />
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'testimonials':
            return (
              <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5" style={bgStyle}>
                <div className="container mx-auto max-w-6xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-14 ' + textClass}>{section.title}</h2>}
                  </ScrollReveal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {section.quotes?.map((quote: any, i: number) => (
                      <ScrollReveal key={i} animation="scale" delay={i * 100}>
                        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 relative h-full shadow-sm">
                          <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-primary/20 absolute top-4 right-4 sm:top-6 sm:right-6" />
                          <div className="flex gap-1.5 mb-4 sm:mb-5">{[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 sm:h-6 sm:w-6 fill-amber-400 text-amber-400" />)}</div>
                          <p className="text-muted-foreground mb-5 sm:mb-6 italic text-base sm:text-lg leading-relaxed">"{quote.quote}"</p>
                          <div className="flex items-center gap-3 sm:gap-4">
                            {quote.image ? <img src={quote.image} alt={quote.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover" /> : <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">{quote.name?.charAt(0) || 'A'}</div>}
                            <div><p className="font-semibold text-base sm:text-lg">{quote.name}</p><p className="text-sm sm:text-base text-muted-foreground">{quote.role}</p></div>
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'faq':
            return (
              <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-muted/30" style={bgStyle || accentBgStyle}>
                <div className="container mx-auto max-w-3xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-14 ' + textClass}>{section.title}</h2>}
                  </ScrollReveal>
                  <ScrollReveal animation="fade-up" delay={150}>
                    <div className="divide-y divide-border bg-card rounded-2xl border border-border overflow-hidden">
                      <Accordion type="single" collapsible className="divide-y divide-border">
                        {section.items?.map((item: any, i: number) => (
                          <ScrollReveal key={i} animation="slide-right" delay={i * 60}>
                            <AccordionItem value={'faq-' + i} className="border-0 px-6 sm:px-8">
                              <AccordionTrigger className="text-left font-semibold text-base sm:text-lg py-6 min-h-[64px] hover:no-underline">{item.question}</AccordionTrigger>
                              <AccordionContent className="text-muted-foreground text-base pb-6">{item.answer}</AccordionContent>
                            </AccordionItem>
                          </ScrollReveal>
                        ))}
                      </Accordion>
                    </div>
                  </ScrollReveal>
                </div>
              </section>
            );

          case 'gallery':
            return (
              <section key={index} id={sectionId} className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-6xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-10 sm:mb-14 ' + textClass}>{section.title}</h2>}
                  </ScrollReveal>
                  <GalleryGrid images={section.images || []} columnLayout={section.settings?.columnLayout} />
                </div>
              </section>
            );

          case 'team':
            return (
              <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-muted/30" style={bgStyle || accentBgStyle}>
                <div className="container mx-auto max-w-6xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 ' + textClass}>{section.title}</h2>}
                    {section.body && <div className={'text-center mb-10 sm:mb-14 max-w-2xl mx-auto text-sm sm:text-base ' + (isImageBg ? 'text-white/80' : 'text-muted-foreground')} dangerouslySetInnerHTML={{ __html: section.body }} />}
                  </ScrollReveal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                    {section.teamMembers?.map((member: any, i: number) => (
                      <ScrollReveal key={i} animation="zoom-in" delay={i * 100}>
                        <div className="bg-card border border-border rounded-2xl overflow-hidden text-center h-full flex flex-col">
                          <div className="aspect-square overflow-hidden">
                            {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary/30">{member.name?.charAt(0)}</span></div>}
                          </div>
                          <div className="p-6 sm:p-8 flex-1">
                            <h3 className="font-semibold text-xl sm:text-2xl mb-2">{member.name}</h3>
                            <p className="text-primary mb-3 text-base sm:text-lg" style={customColors ? { color: customColors.primary } : undefined}>{member.role}</p>
                            {member.bio && <p className="text-muted-foreground text-sm sm:text-base">{member.bio}</p>}
                          </div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'cta':
            return (
              <section key={index} id={sectionId} className="py-20 sm:py-24 lg:py-32 px-4 sm:px-6 relative overflow-hidden"
                style={bgStyle || { background: 'linear-gradient(135deg, ' + (customColors?.primary || '#8B5CF6') + ', ' + (customColors?.secondary || customColors?.primary || '#7C3AED') + ')' }}>
                <ScrollReveal animation="scale">
                  <div className="container mx-auto max-w-4xl text-center relative z-10">
                    {!section.settings?.hideTitle && <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">{section.title}</h2>}
                    {section.body && <div className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: section.body }} />}
                    <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 gap-2 w-full sm:w-auto min-h-[56px] px-10 text-lg font-bold rounded-xl shadow-2xl">
                      {section.buttonText || 'Get Started'} <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                </ScrollReveal>
              </section>
            );

          case 'contact':
            return (
              <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-muted/30" style={accentBgStyle}>
                <div className="container mx-auto max-w-5xl">
                  {!section.settings?.hideTitle && <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4">{section.title || "Contact Us"}</h2>}
                  {section.body && <div className="text-center text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: section.body }} />}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                    <div className="space-y-5 sm:space-y-6 order-1 lg:order-2">
                      <div className="flex items-start gap-4"><div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div><div><h4 className="font-semibold text-base sm:text-lg">Email</h4><p className="text-muted-foreground text-sm sm:text-base">{footer?.contactInfo?.email || 'contact@example.com'}</p></div></div>
                      <div className="flex items-start gap-4"><div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div><div><h4 className="font-semibold text-base sm:text-lg">Phone</h4><p className="text-muted-foreground text-sm sm:text-base">{footer?.contactInfo?.phone || ''}</p></div></div>
                      <div className="flex items-start gap-4"><div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /></div><div><h4 className="font-semibold text-base sm:text-lg">Location</h4><p className="text-muted-foreground text-sm sm:text-base">{[footer?.contactInfo?.address, footer?.contactInfo?.city].filter(Boolean).join(', ') || ''}</p></div></div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm order-2 lg:order-1">
                      <form className="space-y-5" onSubmit={(e: any) => e.preventDefault()}>
                        <input placeholder="Your Name *" className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                        <input placeholder="Email Address *" type="email" className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                        <input placeholder="Subject" className="flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
                        <textarea placeholder="Your Message *" className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" />
                        <Button type="submit" className="w-full h-14 text-lg font-semibold rounded-xl" size="lg" style={primaryBtnStyle}>{section.buttonText || 'Send Message'}</Button>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            );

          case 'stats':
            return (
              <section key={index} id={sectionId} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-6xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 ' + textClass}>{section.title}</h2>}
                  </ScrollReveal>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {section.items?.map((item: any, i: number) => (
                      <ScrollReveal key={i} animation="bounce-in" delay={i * 100}>
                        <div className="text-center p-6 bg-muted/50 rounded-xl">
                          <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{item.name || item.title || item.value}</div>
                          <div className="text-sm text-muted-foreground">{item.description || item.label}</div>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'columns':
            return (
              <section key={index} id={sectionId} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-6xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4 ' + textClass}>{section.title}</h2>}
                    {section.body && <div className={'text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base ' + (isImageBg ? 'text-white/80' : 'text-muted-foreground')} dangerouslySetInnerHTML={{ __html: section.body }} />}
                  </ScrollReveal>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {section.items?.map((item: any, i: number) => (
                      <ScrollReveal key={i} animation="bounce-in" delay={i * 80}>
                        <div className="text-center">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl lg:text-2xl font-bold text-white" style={{ backgroundColor: customColors?.primary || '#8B5CF6' }}>{item.icon || (i + 1)}</div>
                          <h3 className={'font-semibold text-sm sm:text-base lg:text-lg mb-1 sm:mb-2 ' + textClass}>{item.name}</h3>
                          <p className={'text-xs sm:text-sm whitespace-pre-line ' + (isImageBg ? 'text-white/80' : 'text-muted-foreground')}>{item.description || ''}</p>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'pricing':
            return (
              <section key={index} id={sectionId} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-5xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 ' + textClass}>{section.title}</h2>}
                  </ScrollReveal>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {section.items?.map((item: any, i: number) => (
                      <ScrollReveal key={i} animation="flip-up" delay={i * 100}>
                        <div className={'bg-card border rounded-xl p-4 sm:p-6 text-center h-full ' + (i === 1 ? 'border-primary shadow-lg sm:scale-105' : 'border-border')}>
                          <h3 className="font-semibold text-lg sm:text-xl mb-2">{item.name}</h3>
                          <p className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4" style={customColors ? { color: customColors.primary } : undefined}>{item.price}</p>
                          <ul className="space-y-2 mb-4 sm:mb-6 text-left">
                            {item.features?.map((f: string, j: number) => <li key={j} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground"><Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" style={customColors ? { color: customColors.primary } : undefined} /><span>{f}</span></li>)}
                          </ul>
                          <Button className="w-full min-h-[48px]" variant={i === 1 ? 'default' : 'outline'} style={i === 1 ? primaryBtnStyle : undefined}>Get Started</Button>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </section>
            );

          case 'blank':
          case 'welcome':
            return (
              <section key={index} id={sectionId} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className={'container mx-auto max-w-4xl ' + (section.settings?.fullWidth ? 'max-w-none' : '')}>
                  {section.image && (
                    <ScrollReveal animation="fade-up" delay={100}><div className="mb-8"><img src={section.image} alt={section.title || 'Section image'} className="rounded-xl shadow-lg w-full h-auto object-cover" /></div></ScrollReveal>
                  )}
                  {(section.title || section.body) && (
                    <ScrollReveal animation="fade-up" delay={200}>
                      <div className="text-center">
                        {section.title && !section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 ' + textClass}>{section.title}</h2>}
                        {section.body && <div className={'text-base sm:text-lg leading-relaxed ' + (isImageBg ? 'text-white/90' : 'text-muted-foreground') + ' prose prose-lg max-w-none'} dangerouslySetInnerHTML={{ __html: section.body }} />}
                      </div>
                    </ScrollReveal>
                  )}
                </div>
              </section>
            );

          case 'map': {
            const mapAddress = section.mapAddress || '';
            const encodedMapAddress = encodeURIComponent(mapAddress);
            const hasMapAddress = !!mapAddress.trim();
            return (
              <section key={index} id={sectionId} className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-5xl">
                  <ScrollReveal animation="blur-in" duration={800}>
                    {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 ' + textClass}>{section.title}</h2>}
                  </ScrollReveal>
                  <ScrollReveal animation="fade-up" delay={150}>
                    {hasMapAddress ? (
                      <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                        <iframe src={'https://maps.google.com/maps?q=' + encodedMapAddress + '&t=m&z=15&ie=UTF8&iwloc=&output=embed'} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Location Map" />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl bg-muted flex items-center justify-center"><div className="text-center"><MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Location not set</p></div></div>
                    )}
                  </ScrollReveal>
                </div>
              </section>
            );
          }

          case 'tab-layout': {
            const tabs = section.tabs || section.items || [];
            const orientation = section.orientation || 'horizontal';
            const [activeTab, setActiveTab] = useState(0);
            return (
              <section key={index} id={sectionId} className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-5xl">
                  {!section.settings?.hideTitle && <h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 ' + textClass}>{section.title}</h2>}
                  <div className={cn('flex gap-6', orientation === 'vertical' ? 'flex-row' : 'flex-col')}>
                    <div className={cn('flex gap-1 p-1 bg-muted rounded-lg', orientation === 'vertical' ? 'flex-col min-w-[200px]' : 'flex-row overflow-x-auto')}>
                      {tabs.map((tab: any, ti: number) => (
                        <button key={ti} onClick={() => setActiveTab(ti)}
                          className={cn('px-4 py-2.5 text-sm font-medium rounded-md whitespace-nowrap transition-all',
                            activeTab === ti ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                          )}>
                          {tab.icon && <DynamicIcon name={tab.icon} className="w-4 h-4 inline mr-2" />}
                          {tab.label || tab.name || tab.title}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 mt-2">
                      {tabs[activeTab] && (
                        <div className="p-4 sm:p-6 bg-card border border-border rounded-xl">
                          {tabs[activeTab].title && <h3 className="text-xl font-semibold mb-3">{tabs[activeTab].title}</h3>}
                          {tabs[activeTab].body && <div className="text-muted-foreground prose max-w-none" dangerouslySetInnerHTML={{ __html: tabs[activeTab].body }} />}
                          {tabs[activeTab].image && <img src={tabs[activeTab].image} alt={tabs[activeTab].title || ''} className="rounded-lg mt-4 w-full object-cover" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case 'video': {
            const videoUrl = section.videoUrl || section.body || '';
            const getEmbedUrl = (url: string) => { if (!url) return ''; const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/); if (ytMatch) return 'https://www.youtube.com/embed/' + ytMatch[1]; const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/); if (vimeoMatch) return 'https://player.vimeo.com/video/' + vimeoMatch[1]; return url; };
            return (
              <section key={index} id={sectionId} className="py-12 sm:py-16 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-4xl">
                  {!section.settings?.hideTitle && section.title && <ScrollReveal animation="blur-in"><h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 ' + textClass}>{section.title}</h2></ScrollReveal>}
                  {videoUrl && <ScrollReveal animation="fade-up" delay={150}><div className="aspect-video rounded-2xl overflow-hidden shadow-xl"><iframe src={getEmbedUrl(videoUrl)} width="100%" height="100%" allowFullScreen style={{ border: 0 }} loading="lazy" /></div></ScrollReveal>}
                </div>
              </section>
            );
          }

          default: {
            if (!section.title && !section.body && !section.image) return null;
            return (
              <section key={index} id={sectionId} className="py-12 sm:py-16 px-4 sm:px-6 bg-background" style={bgStyle}>
                <div className="container mx-auto max-w-4xl">
                  {section.title && !section.settings?.hideTitle && <ScrollReveal animation="blur-in"><h2 className={'text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-4 sm:mb-6 ' + textClass}>{section.title}</h2></ScrollReveal>}
                  {section.body && <ScrollReveal animation="fade-up" delay={100}><div className={'text-base sm:text-lg leading-relaxed text-center max-w-2xl mx-auto ' + (isImageBg ? 'text-white/90' : 'text-muted-foreground') + ' prose prose-lg max-w-none'} dangerouslySetInnerHTML={{ __html: section.body }} /></ScrollReveal>}
                  {section.image && <ScrollReveal animation="fade-up" delay={200}><div className="mt-8"><img src={section.image} alt={section.title || ''} className="rounded-xl shadow-lg w-full h-auto object-cover" /></div></ScrollReveal>}
                </div>
              </section>
            );
          }
        }
      })}

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 text-white overflow-hidden">
        <div className="h-1 w-full" style={{ background: customColors?.primary ? 'linear-gradient(90deg, ' + customColors.primary + ', ' + (customColors.accent || customColors.primary) + '80)' : 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.5))' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-4 space-y-5">
                {header?.logo ? <div className="mb-4"><img src={header.logo} alt={businessName} className="h-12 sm:h-14 w-auto object-contain brightness-0 invert" /></div> : <h3 className="text-xl sm:text-2xl font-bold">{footer?.companyName || businessName}</h3>}
                {footer?.description && <p className="text-gray-400 leading-relaxed text-sm sm:text-base max-w-sm">{footer.description}</p>}
                {footer?.socialLinks && footer.socialLinks.length > 0 && (
                  <div className="flex gap-3 pt-2">
                    {footer.socialLinks.map((social: any, i: number) => {
                      const IconComponent = (() => { switch (social.platform?.toLowerCase()) { case 'facebook': return Facebook; case 'instagram': return Instagram; case 'twitter': return Twitter; case 'linkedin': return Linkedin; case 'youtube': return Youtube; case 'github': return Github; default: return Globe; } })();
                      return <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 transition-all duration-200" style={{ backgroundColor: customColors?.primary ? customColors.primary + '20' : undefined }}><IconComponent className="w-5 h-5" /></a>;
                    })}
                  </div>
                )}
              </div>
              {footer?.linkGroups?.length > 0 ? footer.linkGroups.map((group: any, gi: number) => (
                <div key={gi} className="lg:col-span-2">
                  <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{group.title}</h4>
                  <ul className="space-y-3">{group.links.map((link: any, i: number) => <li key={i}><a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />{link.label}</a></li>)}</ul>
                </div>
              )) : footer?.links?.length > 0 ? (
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
                  <ul className="space-y-3">{footer.links.map((link: any, i: number) => <li key={i}><a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm inline-flex items-center gap-1 group"><ArrowRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />{link.label}</a></li>)}</ul>
                </div>
              ) : null}
              <div className="lg:col-span-4">
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Get In Touch</h4>
                <div className="space-y-4">
                  <a href={'mailto:' + (footer?.contactInfo?.email || 'contact@example.com')} className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors" style={{ backgroundColor: customColors?.primary ? customColors.primary + '20' : 'rgba(255,255,255,0.1)' }}><Mail className="w-4 h-4" /></div>
                    <div><p className="text-xs text-gray-500 mb-0.5">Email Us</p><p className="text-sm group-hover:text-white transition-colors">{footer?.contactInfo?.email || 'contact@example.com'}</p></div>
                  </a>
                  <a href={'tel:' + (footer?.contactInfo?.phone || '(555) 123-4567').replace(/[^0-9+]/g, '')} className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors" style={{ backgroundColor: customColors?.primary ? customColors.primary + '20' : 'rgba(255,255,255,0.1)' }}><Phone className="w-4 h-4" /></div>
                    <div><p className="text-xs text-gray-500 mb-0.5">Call Us</p><p className="text-sm group-hover:text-white transition-colors">{footer?.contactInfo?.phone || '(555) 123-4567'}</p></div>
                  </a>
                  {(footer?.contactInfo?.address || footer?.contactInfo?.city) && (
                    <div className="flex items-start gap-3 text-gray-400">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: customColors?.primary ? customColors.primary + '20' : 'rgba(255,255,255,0.1)' }}><MapPin className="w-4 h-4" /></div>
                      <div><p className="text-xs text-gray-500 mb-0.5">Visit Us</p><p className="text-sm">{footer?.contactInfo?.address && <span className="block">{footer.contactInfo.address}</span>}{footer?.contactInfo?.city && <span>{footer.contactInfo.city}</span>}</p></div>
                    </div>
                  )}
                  {footer?.businessHours && (footer.businessHours.weekdays || footer.businessHours.weekend) && (
                    <div className="pt-4 mt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 mb-2">Business Hours</p>
                      {footer.businessHours.weekdays && <p className="text-sm text-gray-400">{footer.businessHours.weekdays}</p>}
                      {footer.businessHours.weekend && <p className="text-sm text-gray-400">{footer.businessHours.weekend}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {footer?.newsletter?.enabled && (
              <div className="mt-12 pt-10 border-t border-gray-800">
                <div className="max-w-xl mx-auto text-center">
                  <h4 className="text-lg sm:text-xl font-semibold mb-2">{footer.newsletter.title || 'Stay Updated'}</h4>
                  <p className="text-gray-400 text-sm mb-5">Subscribe to our newsletter for the latest updates and exclusive offers.</p>
                  <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e: any) => e.preventDefault()}>
                    <input type="email" placeholder={footer.newsletter.placeholder || "Enter your email"} className="flex-1 h-12 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 rounded-md px-4" />
                    <button type="submit" className="h-12 px-8 font-semibold rounded-md text-white" style={{ backgroundColor: customColors?.primary }}>{footer.newsletter.buttonText || 'Subscribe'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-800 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 text-center sm:text-left">{footer?.copyright || ('© ' + new Date().getFullYear() + ' ' + businessName + '. All rights reserved.')}</p>
              <div className="flex items-center gap-6 text-xs text-gray-500">
                <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
