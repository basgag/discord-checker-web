import { Switch, type SwitchProps } from "@headlessui/react";
import clsx from "clsx";
import { type ElementType } from "react";

interface ISwitchCategoryProps extends SwitchProps<ElementType> {
  name: string;
  description: string;
}

const SwitchCategory: React.FC<ISwitchCategoryProps> = ({
  name,
  description,
  checked,
  ...props
}) => {
  return (
    <Switch.Group>
      <div className="flex items-center">
        <Switch
          checked={checked}
          className={clsx(
            "relative inline-flex h-6 w-11 items-center rounded-full",
            checked ? "bg-blurple" : "bg-blueish-grey-600",
          )}
          {...props}
        >
          <span
            className={clsx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition",
              checked ? "translate-x-6" : "translate-x-1",
            )}
          />
        </Switch>
        <Switch.Label className="ml-4 flex flex-col space-y-1">
          <span className="text-base font-medium">{name}</span>
          <span className="text-sm font-light text-neutral-300">
            {description}
          </span>
        </Switch.Label>
      </div>
    </Switch.Group>
  );
};

export default SwitchCategory;
