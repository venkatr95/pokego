import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `https://pokeuu.com${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-sm text-foreground/60">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
              {index < items.length - 1 && (
                <span className="mx-2 opacity-50">/</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
