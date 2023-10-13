import * as Avatar from "@radix-ui/react-avatar";
import { useSession } from "next-auth/react";
import { type AvatarProps } from "@radix-ui/react-avatar";

interface UserAvatarProps extends AvatarProps {
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ size, ...props }) => {
  const { data: session } = useSession();

  return (
    <Avatar.Root {...props}>
      <Avatar.Image
        src={session?.user?.image ?? undefined}
        className="h-full w-full flex-shrink-0 rounded-full"
        alt="User Avatar"
        width={size ?? 48}
        height={size ?? 48}
      />
      <Avatar.Fallback className="grid h-full w-full flex-shrink-0 place-items-center rounded-full bg-blueish-grey-500 font-light">
        {(session?.user?.name ?? "Unknown")
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </Avatar.Fallback>
    </Avatar.Root>
  );
};

export default UserAvatar;
