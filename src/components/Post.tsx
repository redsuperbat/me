import { languageColors } from "@/static/language-colors";
import { cls } from "@/utilities/cls";
import moment from "moment";
import Link from "next/link";

type Props = {
  date: Date;
  title: string;
  languages: string[];
  body?: string;
  href: string;
  edited: string;
};

export const Post = (props: Props) => {
  console.log(props);
  return (
    <Link href={props.href} className="border flex flex-col p-2 group">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <div className="flex">
            {props.languages.map((it, index) => (
              <div key={it}>
                {index > 0 && ","}
                <span
                  key={it}
                  style={{ color: languageColors[it.toLowerCase()] }}
                  className={cls(index > 0 && "ml-2")}
                >
                  {it}
                </span>
              </div>
            ))}
          </div>
          <span>{moment(props.date).format("yyyy-MM-DD")}</span>
        </div>
        <div className="group-hover:opacity-100 opacity-0 transition-opacity">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="42"
            height="42"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M12 19v-9H3V8h11v11h-2Zm5-5V5H8V3h11v11h-2Z"
            />
          </svg>
        </div>
      </div>
      <div
        className="grid px-5 sm:px-10 py-2 text-center gap-4 grid-rows-4"
        style={{
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        <h1 className="text-2xl">{props.title}</h1>
        <p className="text-sm  ">{props.body ?? ""}</p>
        <p className="text-xs text-gray-400 ">edited: {props.edited}</p>
      </div>
    </Link>
  );
};
