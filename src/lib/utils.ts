import { type APIUser } from "discord-api-types/v10";

export const TOKEN_REGEX = /[A-Za-z\d]{24,28}\.[\w-]{6}\.[\w-]{38}/g;

export const TOKEN_REGEX_LEGACY = /[A-Za-z\d]{24,28}\.[\w-]{6}\.[\w-]{27,38}/g;

const LOCALES_MAP = [
  ["ar", "ARG"],
  ["bg", "BGR"],
  ["zh-CN", "CHN"],
  ["zh-TW", "TWN"],
  ["hr", "HUN"],
  ["cs", "CZE"],
  ["da", "DNK"],
  ["nl", "NLD"],
  ["en-GB", "GBR"],
  ["en-US", "USA"],
  ["fi", "FIN"],
  ["fr", "FRA"],
  ["de", "DEU"],
  ["el", "GRC"],
  ["hi", "IDN"],
  ["hu", "HUN"],
  ["id", "IDN"],
  ["it", "ITA"],
  ["ja", "JPN"],
  ["ko", "KOR"],
  ["lt", "LTU"],
  ["no", "NOR"],
  ["pl", "POL"],
  ["pt-BR", "BRA"],
  ["ro", "ROU"],
  ["ru", "RUS"],
  ["es-ES", "ESP"],
  ["sv-SE", "SWE"],
  ["th", "THA"],
  ["tr", "TUR"],
  ["uk", "UKR"],
  ["vi", "VNM"],
];

export const localeToCountry = (locale: string | null) => {
  locale ??= "en-US";

  return LOCALES_MAP.find((arr) => {
    return arr[0] === locale;
  })?.[1];
};

export const BADGE_FLAGS = Object.freeze({
  DISCORD_EMPLOYEE: 1 << 0,
  PARTNERED_SERVER_OWNER: 1 << 1,
  HYPESQUAD_EVENTS: 1 << 2,
  BUGHUNTER_LEVEL_1: 1 << 3,
  HOUSE_BRAVERY: 1 << 6,
  HOUSE_BRILLIANCE: 1 << 7,
  HOUSE_BALANCE: 1 << 8,
  EARLY_SUPPORTER: 1 << 9,
  TEAM_USER: 1 << 10,
  BUGHUNTER_LEVEL_2: 1 << 14,
  VERIFIED_BOT: 1 << 16,
  EARLY_VERIFIED_BOT_DEVELOPER: 1 << 17,
  MODERATOR_PROGRAMS_ALUMNI: 1 << 18,
  ACTIVE_DEVELOPER: 1 << 22,
  SUPPORTS_COMMANDS: 1 << 23,
  USES_AUTOMOD: 1 << 24,
}) as { [index: string]: number };

export const hasFlag = (
  user: { flags?: APIUser["flags"] | bigint | null },
  bit: string
): boolean => {
  if (!user.flags) {
    return false;
  }

  const flagForBit = BADGE_FLAGS[bit];
  if (!flagForBit) {
    return false;
  }

  return (BigInt(user.flags) & BigInt(flagForBit)) === BigInt(flagForBit);
};

export const toTitleCase = (str: string): string => {
  return str.replaceAll("_", " ").replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export const isMigratedUser = (user: {
  discriminator: APIUser["discriminator"];
}): boolean => {
  return user.discriminator === "0";
};

export const usernameOrTag = (user: {
  username: APIUser["username"];
  discriminator: APIUser["discriminator"];
}): string => {
  if (isMigratedUser(user)) {
    return `@${user.username}`;
  }

  return `${user.username}#${user.discriminator}`;
};
