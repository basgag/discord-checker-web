import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import clsx from "clsx";
import Button from "~/components/common/Button";

interface IPaginationButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

const PaginationButtons: React.FC<IPaginationButtonsProps> = ({
  className,
  onPrevious,
  onNext,
  isPreviousDisabled,
  isNextDisabled,
  ...props
}) => {
  return (
    <div className={clsx("flex space-x-1", className)} {...props}>
      <Button
        className="!p-2"
        onClick={onPrevious}
        disabled={isPreviousDisabled}
      >
        <FiArrowLeft className="h-5 w-5" />
      </Button>
      <Button className="!p-2" onClick={onNext} disabled={isNextDisabled}>
        <FiArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default PaginationButtons;
