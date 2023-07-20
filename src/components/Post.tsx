import { languageColors } from "@/static/language-colors";
import moment from "moment";

type Props = {
  date: Date;
  title: string;
  languages: string[];
  body?: string;
};

export const Post = (props: Props) => {
  return (
    <div className="border flex flex-col p-2 transition-colors cursor-pointer">
      <div className="flex flex-col">
        <div className="flex">
          {props.languages.map((it, index) => (
            <div key={it}>
              {index > 0 && "  ,"}
              <span
                key={it}
                style={{ color: languageColors[it.toLowerCase()] }}
              >
                {it}
              </span>
            </div>
          ))}
        </div>
        <span>{moment(props.date).format("yyyy-MM-DD")}</span>
      </div>
      <div className="grid place-items-center p-10 text-center">
        <h1 className="text-2xl">{props.title}</h1>
        <p className="text-sm h-16 overflow-y-scroll">{props.body ?? ""}</p>
      </div>
    </div>
  );
};
