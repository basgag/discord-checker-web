import { type PropsWithChildren } from "react";

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<PropsWithChildren<TooltipProps>> = ({
  children,
  text,
}) => {
  return (
    <div className="group hover:cursor-pointer">
      <span className="invisible absolute -mt-8 rounded-lg bg-black p-1.5 text-xs font-semibold shadow-lg transition duration-150 group-hover:visible group-hover:z-50">
        {text}
      </span>
      {children}
    </div>
  );
};

export default Tooltip;
