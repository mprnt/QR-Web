import type { LegalBlock, LegalDocument as Doc } from '@/lib/legal';

// Turns "Email: x" / "Customer Support: +91 …" lines into tappable links.
function ContactLine({ line }: { line: string }) {
  const [label, ...rest] = line.split(':');
  const value = rest.join(':').trim();
  if (!value) return <>{line}</>;
  const href = /^email$/i.test(label.trim())
    ? `mailto:${value}`
    : /support|phone/i.test(label)
      ? `tel:${value.replace(/[^\d+]/g, '')}`
      : null;
  return (
    <>
      <span className="text-text font-medium">{label}:</span>{' '}
      {href ? (
        <a href={href} className="text-primary underline-offset-2 hover:underline">{value}</a>
      ) : (
        value
      )}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case 'h3':
      return <h3 className="font-semibold text-text pt-2">{block.text}</h3>;
    case 'ul':
      return (
        <ul className="list-disc pl-5 space-y-1 text-text-muted leading-relaxed">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'lines':
      return (
        <div className="bg-surface-secondary rounded-xl p-4 space-y-1 text-sm text-text-muted">
          {block.lines.map((line, i) => (
            <p key={line} className={i === 0 && !line.includes(':') ? 'text-text font-medium' : ''}>
              <ContactLine line={line} />
            </p>
          ))}
        </div>
      );
    default:
      return (
        <p className={`leading-relaxed ${block.strong ? 'text-text font-medium' : 'text-text-muted'}`}>{block.text}</p>
      );
  }
}

export function LegalDocument({ doc }: { doc: Doc }) {
  return (
    <div className="space-y-8">
      <div className="bg-surface-secondary rounded-xl p-4 space-y-1 text-sm text-text-muted">
        <p>
          <span className="text-text font-medium">Effective Date:</span> {doc.effectiveDate}
        </p>
        {doc.meta.map((line) => (
          <p key={line}>
            <ContactLine line={line} />
          </p>
        ))}
      </div>

      {doc.sections.map((s) => (
        <section key={s.heading} className="space-y-3">
          <h2 className="text-xl font-bold text-text">{s.heading}</h2>
          {s.blocks.map((b, i) => (
            <Block key={i} block={b} />
          ))}
        </section>
      ))}

      <p className="text-sm text-text-muted">Last Updated: {doc.lastUpdated}</p>
    </div>
  );
}
