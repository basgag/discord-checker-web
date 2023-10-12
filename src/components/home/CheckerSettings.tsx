import { useSettingsStore, useTokenStore } from "~/lib/store";
import { TOKEN_REGEX } from "~/lib/utils";
import SwitchCategory from "~/components/common/SwitchCategory";

const CheckerSettings: React.FC = () => {
  const { settings, setValue } = useSettingsStore();
  const { filterByRegex } = useTokenStore();

  const handleIncludeLegacyChange = () => {
    const newValue = !settings.includeLegacy;
    setValue("includeLegacy", newValue);

    if (!newValue) {
      filterByRegex(TOKEN_REGEX);
    }
  };

  return (
    <>
      <hr className="my-10 border-neutral-100/10" />

      <div className="mt-12">
        <div className="mb-4 leading-[15px]">
          <h2 className="text-xl font-bold">Checker Settings</h2>
          <span className="text-base text-neutral-300">
            Configure the behavior of the checker
          </span>
        </div>

        <SwitchCategory
          name="Support Old Token Format"
          description="Tokens with a HMAC length of 27 are considered legacy tokens"
          checked={settings.includeLegacy}
          onChange={handleIncludeLegacyChange}
        />
      </div>
    </>
  );
};

export default CheckerSettings;
