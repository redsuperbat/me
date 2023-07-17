import ReactMarkdown from "react-markdown";

export type Props = {
  content: string;
};

export const Markdown = (props: Props) => {
  return <ReactMarkdown className="prose">{props.content}</ReactMarkdown>;
};
