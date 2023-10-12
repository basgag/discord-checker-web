import clsx from "clsx";

type TBackgroundGridProps = React.HTMLAttributes<HTMLDivElement>;

const BackgroundGrid: React.FC<TBackgroundGridProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "background-grid pointer-events-none absolute inset-0 select-none opacity-[7.5%]",
        className,
      )}
      {...props}
    />
  );
};

export default BackgroundGrid;
