import { api } from "~/utils/api";
import BoxWithHeader from "~/components/admin/common/BoxWithHeader";

interface IPaymentMethodsOverviewProps {
  userId: string;
}

const PaymentMethodsOverview: React.FC<IPaymentMethodsOverviewProps> = ({
  userId,
}) => {
  const { data: paymentMethods } = api.accounts.getPaymentMethodsById.useQuery(
    userId,
    {
      enabled: !!userId,
    },
  );

  if (!paymentMethods) {
    return null;
  }

  return (
    <BoxWithHeader headline="Payment Methods">
      {JSON.stringify(paymentMethods, null, 2)}
    </BoxWithHeader>
  );
};

export default PaymentMethodsOverview;
