import * as Avatar from "@radix-ui/react-avatar";
import { type AvatarProps } from "@radix-ui/react-avatar";
interface IGuildIconProps extends AvatarProps {
  guild: {
    name: string;
    id: string;
    icon?: string | null;
  };
  size?: number;
}

const GuildIcon: React.FC<IGuildIconProps> = ({ size, guild, ...props }) => {
  const isAnimated = guild.icon?.startsWith("a_") ?? false;
  const src = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${
    isAnimated ? "gif" : "png"
  }?size=${size}`;

  return (
    <Avatar.Root {...props}>
      <Avatar.Image
        src={guild.icon ? src : undefined}
        className="h-full w-full flex-shrink-0 rounded-full"
        alt="User Avatar"
        width={size ?? 48}
        height={size ?? 48}
      />
      <Avatar.Fallback className="grid h-full w-full flex-shrink-0 place-items-center rounded-full bg-blueish-grey-500 font-light">
        {guild.name
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </Avatar.Fallback>
    </Avatar.Root>
  );
};

export default GuildIcon;
