const DISBURSEMENTDATE = new Date(2023, 10 - 1, 30);
const PAYMENTFIRSTDATE = new Date(2023, 11 - 1, 1);
const PAYMENTDUEDAY = 25;
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
  PaymentAmount,
  50000,
  1,
);

for (let r of res) {
  setTimeout(() => {
    console.log(r)
  }, 1000 * r.c);
}
