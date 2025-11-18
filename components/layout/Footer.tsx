import Link from 'next/link';

/** Footer mit Projekt-Kurzinfos und Kontakt-Links. */
export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Island Massage Delivery – Ko Phangan.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/faq" className="hover:text-slate-900">
            FAQ
          </Link>
          <Link href="/legal" className="hover:text-slate-900">
            Legal
          </Link>
          <Link href="/contact" className="hover:text-slate-900">
            Kontakt
          </Link>
        </div>
      </div>
    </footer>
  );
}
