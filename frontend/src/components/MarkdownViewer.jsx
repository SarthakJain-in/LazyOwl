import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownViewer({ content }) {
  return (
    <div className="prose prose-slate max-w-none text-forge-textSecondary leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Style standard text
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
          // Style links
          a: ({ node, ...props }) => (
            <a
              className="text-forge-accent hover:underline font-medium"
              {...props}
            />
          ),
          // Style lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />
          ),
          // Style headings
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold text-forge-textPrimary mt-6 mb-4"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold text-forge-textPrimary mt-5 mb-3"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-bold text-forge-textPrimary mt-4 mb-2"
              {...props}
            />
          ),

          // The magic: Custom code block styling
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="rounded-xl overflow-hidden my-4 border border-forge-border shadow-sm">
                <div className="bg-[#1E1E1E] px-4 py-1.5 flex items-center justify-between text-xs text-gray-400 border-b border-gray-700">
                  <span className="uppercase font-semibold tracking-wider">
                    {match[1]}
                  </span>
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    background: "#1E1E1E",
                    fontSize: "0.875rem",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              // Inline code snippets (e.g., `const x = 5`)
              <code
                {...props}
                className="bg-indigo-50 text-forge-accent px-1.5 py-0.5 rounded-md text-sm font-mono border border-indigo-100"
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
