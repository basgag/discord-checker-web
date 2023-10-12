import clsx from "clsx";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const styles = {
  primary: "bg-blurple hover:bg-blurple-dark",
  secondary: "bg-blueish-grey-700 hover:bg-blueish-grey-800",
} as const;

const Button: React.FC<IButtonProps> = ({
  variant = "primary",
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center space-x-2 rounded-lg px-2 py-1.5 font-medium transition duration-200 disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
