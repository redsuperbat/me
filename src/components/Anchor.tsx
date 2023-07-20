import { cls } from "@/utilities/cls";
import { AnchorHTMLAttributes } from "react";

export const Anchor = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { className, children, ...rest } = props;
  return (
    <a
      className={cls(
        "dark:text-blue-400 text-blue-600 relative group",
        className
      )}
      {...rest}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] dark:bg-blue-400 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
    </a>
  );
};
