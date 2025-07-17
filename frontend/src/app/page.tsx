// src/app/page.tsx
import Link from 'next/link';
import AdSlot from './components/AdSlot';

import business   from './data/business.json';
import hr         from './data/hr.json';
import admin      from './data/admin.json';
import marketing  from './data/marketing.json';
import sales      from './data/sales.json';
import account    from './data/account.json';
import operations from './data/operations.json';
import projects   from './data/projects.json';
import strategy   from './data/strategy.json';
import logistics  from './data/logistics.json';
import legal      from './data/legal.json';
import it         from './data/it.json';

interface Category {
  slug: string;
  label: string;
  count: number;
}

const categories: Category[] = [
  { slug: 'business',  label: 'Business Jobs',           count: business.length },
  { slug: 'hr',        label: 'HR & Recruitment',         count: hr.length },
  { slug: 'admin',     label: 'Administrative Jobs',      count: admin.length },
  { slug: 'marketing', label: 'Marketing & Brand',        count: marketing.length },
  { slug: 'sales',     label: 'Sales & Biz-Dev',          count: sales.length },
  { slug: 'account',   label: 'Account & Client',         count: account.length },
  { slug: 'operations',label: 'Operations',               count: operations.length },
  { slug: 'projects',  label: 'Project Management',       count: projects.length },
  { slug: 'strategy',  label: 'Strategy & Policy',        count: strategy.length },
  { slug: 'logistics', label: 'Logistics & Supply Chain', count: logistics.length },
  { slug: 'legal',     label: 'Legal & Compliance',       count: legal.length },
  { slug: 'it',        label: 'IT & Tech',                count: it.length },
];

export default function HomePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* HERO */}
      <div
        className="w-full h-64 bg-cover bg-center mb-6 rounded-lg overflow-hidden"
        style={{ backgroundImage: "url('/images/placeholder.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="relative z-10 flex h-full items-center justify-center text-white text-2xl font-bold">
          Browse Jobs by Category
        </div>
      </div>

      {/* TOP AD */}
      <div className="mb-4">
        <AdSlot slot="1234567890" />
      </div>

      {/* CATEGORY GRID */}
      <h2 className="text-2xl font-semibold mb-4">Job Categories</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/categories/${cat.slug}`}
              className="block p-4 border rounded-lg hover:shadow transition"
            >
              <div className="flex justify-between">
                <span className="font-semibold">{cat.label}</span>
                <span className="text-gray-500">({cat.count})</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* BOTTOM AD */}
      <div className="mt-6">
        <AdSlot slot="0987654321" />
      </div>
    </div>
  );
}
