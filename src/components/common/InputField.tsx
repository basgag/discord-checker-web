import { type FieldProps } from "formik";
import clsx from "clsx";

interface InputFieldProps extends FieldProps {
  className?: string;
  isTextArea?: boolean;
}

export const styles = {
  input:
    "disabled:opacity-50 w-full rounded-lg border border-blueish-grey-600/80 bg-blueish-grey-800/50 px-5 py-3 text-sm text-neutral-100 transition-colors duration-200 focus:border-blueish-grey-500/80 focus:outline-none",
  error: "border-red-600/60 focus:border-red-600/80",
};

const InputField: React.FC<InputFieldProps> = ({
  className,
  isTextArea,
  field,
  form: { errors },
  ...props
}) => {
  return (
    <>
      {!isTextArea ? (
        <input
          {...field}
          {...props}
          className={clsx(
            styles.input,
            errors[field.name] && styles.error,
            className,
          )}
        />
      ) : (
        <textarea
          {...field}
          {...props}
          className={clsx(
            styles.input,
            errors[field.name] && styles.error,
            className,
          )}
        />
      )}
    </>
  );
};

export default InputField;
