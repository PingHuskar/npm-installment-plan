const DISBURSEMENTDATE = new Date(2023, 10 - 1, 25);
const PAYMENTFIRSTDATE = new Date(2023, 11 - 1, 24);
const PAYMENTDUEDAY = 24;
const Principal = 500000;

const PaymentAmount = [
  { from: 1, to: 12, installment: 2300, IntRate: 0.0239 },
  { from: 3, to: 24, installment: 2300, IntRate: 0.0414 },
  { from: 25, to: 36, installment: 2300, IntRate: 0.0414 },
  { from: 37, to: 120, installment: 2300, IntRate: 0.0594 },
];

const { CalculateInstallmentPlan} = require("./app");

const res = CalculateInstallmentPlan(
  DISBURSEMENTDATE,
  PAYMENTFIRSTDATE,
  PAYMENTDUEDAY,
  Principal,
  PaymentAmount
);

console.log(res[0]);
