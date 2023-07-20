import { cls } from "@/utilities/cls";
import { AnchorHTMLAttributes } from "react";

export const Anchor = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { className, children, ...rest } = props;
  return (
    <a
      className={cls(
        "dark:text-blue-400 text-blue-800 relative group",
        className
      )}
      {...rest}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-blue-800 transition-all duration-200 group-hover:w-full"></span>
    </a>
  );
};
