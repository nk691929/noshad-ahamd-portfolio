/**
 * Purpose: renders a JSON-LD <script>. "<" is escaped so content can never close the script tag. Server component.
 * Used by: src/app/page.tsx.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
