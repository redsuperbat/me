import { cls } from "@/utilities/cls";
import type { AnchorHTMLAttributes } from "react";

export const Anchor = (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { className, children, ...rest } = props;
  return (
    <a
      className={cls("text-blue-400 relative group no-underline", className)}
      {...rest}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-blue-400 transition-all duration-200 group-hover:w-full" />
    </a>
  );
};
