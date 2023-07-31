import clsx from "clsx";
import { FiAlertTriangle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { AiFillInfoCircle } from "react-icons/ai";

interface ComponentProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
}

const AlertMessage: React.FC<ComponentProps> = ({
  type,
  message,
  className,
}) => {
  const styles = {
    success: "bg-green-500 border-green-400",
    error: "bg-red-500 border-red-400",
    warning: "bg-yellow-500 border-yellow-400",
    info: "bg-blue-500 border-blue-400",
  };

  const icons = {
    success: <FiCheckCircle />,
    error: <FiXCircle />,
    warning: <FiAlertTriangle />,
    info: <AiFillInfoCircle />,
  };

  return (
    <div
      className={clsx(
        "mt-2 inline-flex w-full items-center rounded border px-3 py-2",
        styles[type],
        className,
      )}
    >
      {icons[type]}
      <span className="ml-2 text-sm font-medium">{message}</span>
    </div>
  );
};

export default AlertMessage;
