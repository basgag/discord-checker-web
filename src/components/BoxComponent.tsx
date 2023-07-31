import clsx from "clsx";
import { type PropsWithChildren } from "react";

interface BoxComponentProps {
  className?: string;
}

const BoxComponent: React.FC<PropsWithChildren<BoxComponentProps>> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx(
        "rounded border border-gray-700 bg-gray-800 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default BoxComponent;
