interface GlassCardProps {
  title: string;
  children?: React.ReactNode;
}

export default function GlassCard({ title, children }: GlassCardProps) {
  return (
    <div className="glass-card">
      {title && (
        <div className="title-h2">
          <h2 className="h2">{title}</h2>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
