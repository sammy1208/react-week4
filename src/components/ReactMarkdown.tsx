import ReactMarkdown from "react-markdown";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1
              style={{
                textAlign: "center",
                fontSize: "28px",
                margin: "38px 0 16px",
              }}
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              style={{
                fontSize: "16px",
                // color: "var(--color-secondary)",
                margin: "1.5rem 0 1rem",
              }}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </>
  );
}
