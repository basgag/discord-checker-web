import clsx from "clsx";

type TBoxProps = React.HTMLAttributes<HTMLDivElement>;

const Box: React.FC<TBoxProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={clsx(
        className,
        "rounded-lg border border-blueish-grey-600/80 bg-blueish-grey-700 p-8 sm:p-12",
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Box;
