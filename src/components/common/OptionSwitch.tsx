import { Switch } from "@headlessui/react";

interface OptionSwitchProps {
  name: string;
  description: string;
  condition: boolean;
  stateSetter: (value: boolean) => void;
}

const OptionSwitch: React.FC<OptionSwitchProps> = ({
  name,
  description,
  condition,
  stateSetter,
}) => {
  return (
    <Switch.Group>
      <div className="flex items-center">
        <Switch
          checked={condition}
          onChange={stateSetter}
          className={`${
            condition ? "bg-blurple" : "bg-gray-700"
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              condition ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        <Switch.Label className="ml-2 flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs font-light text-gray-300">
            {description}
          </span>
        </Switch.Label>
      </div>
    </Switch.Group>
  );
};

export default OptionSwitch;
