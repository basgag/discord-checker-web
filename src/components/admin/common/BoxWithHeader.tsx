import Box from "~/components/common/BoxComponent";

interface IBoxWithHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  headline: string;
}

const BoxWithHeader: React.FC<IBoxWithHeaderProps> = ({
  headline,
  children,
}) => {
  return (
    <Box className="!p-0">
      <h2 className="p-4 text-lg font-semibold">{headline}</h2>
      <div className="border-t border-blueish-grey-600/80 p-4">{children}</div>
    </Box>
  );
};

export default BoxWithHeader;
