import clsx from "clsx";

type TContainerProps = React.HTMLAttributes<HTMLDivElement>;

const Container: React.FC<TContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
};
export default Container;
