import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { generateId } from "../utils/generateId";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ node, ...props }) => {
          const text = String(props.children);
          const id = generateId(text);

          return (
            <h1
              id={id}
              style={{
                textAlign: "center",
                fontSize: "28px",
                margin: "38px 0 16px",
              }}
              {...props}
            />
          );
        },

        blockquote: ({ node, ...props }) => (
          <blockquote
            style={{
              fontSize: "16px",
              margin: "1.5rem 0 1rem",
            }}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// import ReactMarkdown from "react-markdown";

// export default function MarkdownRenderer({ content }: { content: string }) {
//   return (
//     <>
//       <ReactMarkdown
//         components={{
//           h1: ({ node, ...props }) => (
//             <h1
//               style={{
//                 textAlign: "center",
//                 fontSize: "28px",
//                 margin: "38px 0 16px",
//               }}
//               {...props}
//             />
//           ),
//           blockquote: ({ node, ...props }) => (
//             <blockquote
//               style={{
//                 fontSize: "16px",
//                 // color: "var(--color-secondary)",
//                 margin: "1.5rem 0 1rem",
//               }}
//               {...props}
//             />
//           ),
//         }}
//       >
//         {content}
//       </ReactMarkdown>
//     </>
//   );
// }
