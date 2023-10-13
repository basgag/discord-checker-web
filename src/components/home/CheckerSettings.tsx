import { useSettingsStore, useTokenStore } from "~/lib/store";
import { TOKEN_REGEX } from "~/lib/utils";
import SwitchCategory from "~/components/common/SwitchCategory";

const CheckerSettings: React.FC = () => {
  const { setValue, settings } = useSettingsStore();
  const { filterByRegex, removeDuplicates } = useTokenStore();

  const handleIncludeLegacyChange = () => {
    const newValue = !settings.includeLegacy;
    setValue("includeLegacy", newValue);

    if (!newValue) {
      filterByRegex(TOKEN_REGEX);
    }
  };

  const handleRemoveDuplicatesChange = () => {
    const newValue = !settings.removeDuplicates;
    setValue("removeDuplicates", newValue);

    if (newValue) {
      removeDuplicates();
    }
  };

  return (
    <div className="mt-12">
      <div className="mb-4 leading-[15px]">
        <h2 className="text-xl font-bold">Checker Settings</h2>
        <span className="text-base text-neutral-300">
          Configure the behavior of the checker
        </span>
      </div>

      <div className="flex flex-col gap-6">
        <SwitchCategory
          name="Support Old Token Format"
          description="Tokens with a HMAC length of 27 are considered legacy tokens"
          checked={settings.includeLegacy}
          onChange={handleIncludeLegacyChange}
        />

        <SwitchCategory
          name="Enable Cache"
          description="This will cache recently checked tokens for 3h to speed up the process"
          isNew={true}
          checked={settings.enableCache}
          onChange={() => setValue("enableCache", !settings.enableCache)}
        />

        <SwitchCategory
          name="Remove Duplicate Accounts"
          description="Removes tokens with the same user id from the list"
          isNew={true}
          checked={settings.removeDuplicates}
          onChange={handleRemoveDuplicatesChange}
        />
      </div>
    </div>
  );
};

export default CheckerSettings;
