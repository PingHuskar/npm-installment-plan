const CalculateInstallmentPlan = require("./CalculateInstallmentPlan");
const lastday = require("./lastday");

const CalculateInstallmentPlan_DE = (
    Principal,
    PaymentAmount
) => {
    return CalculateInstallmentPlan(
        DISBURSEMENTDATE =
        new Date(`${new Date().getFullYear()}/${new Date().getMonth() + 1}/
        ${1}
      `),
        PAYMENTFIRSTDATE =
        new Date(`${new Date().getFullYear()}/${new Date().getMonth() + 1}/
        ${lastday(new Date().getFullYear(), new Date().getMonth())}
      `),
        PAYMENTDUEDAY = 25,
        Principal,
        PaymentAmount,
    );
}

module.exports = CalculateInstallmentPlan_DE;