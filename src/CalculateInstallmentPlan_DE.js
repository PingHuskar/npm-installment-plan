import CalculateInstallmentPlan from "./CalculateInstallmentPlan"
import lastday from "./lastday"

const CalculateInstallmentPlan_DE = (
    Principal,
    PaymentAmount
) => {
    return CalculateInstallmentPlan(
        new Date(`${new Date().getFullYear()}/${new Date().getMonth() + 1}/
        ${1}
      `),
        new Date(`${new Date().getFullYear()}/${new Date().getMonth() + 1}/
        ${lastday(new Date().getFullYear(), new Date().getMonth())}
      `),
        25,
        Principal,
        PaymentAmount,
    );
}

export default CalculateInstallmentPlan_DE;