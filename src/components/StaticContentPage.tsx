import Link from 'next/link';

type Section = {
  title: string;
  content: string[];
};

interface StaticContentPageProps {
  title: string;
  description: string;
  sections: Section[];
}

export default function StaticContentPage({ title, description, sections }: StaticContentPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-primary via-[#1f7dd6] to-accent px-4 py-14 text-white">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-3 max-w-2xl text-white/90">{description}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="card border border-white/90 shadow-lg">
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-gray-600">
                  {section.content.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
            <Link href="/" className="btn btn-primary text-center">
              返回首页
            </Link>
            <Link href="/find-companion" className="btn btn-secondary text-center">
              去找陪玩
            </Link>
            <Link href="/contact" className="btn btn-secondary text-center">
              联系平台
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
