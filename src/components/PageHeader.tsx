interface PageHeaderProps {
  title: string;
  description?: string;
  gradient?: string;
}

export default function PageHeader({ title, description, gradient = 'from-primary via-[#1f7dd6] to-accent' }: PageHeaderProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} text-white py-14 px-4`}>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold font-display">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-white/90">{description}</p>}
      </div>
    </div>
  );
}
