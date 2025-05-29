const { CalculateDisbursementPlan } = require("..");
const PAYMENTFIRSTDATE = new Date(2025, 5 - 1, 6);
const PAYMENTDUEDAY = 6;
const PA = [
    { from: 1, to: 3, installment: 11040, IntRate: 0.0888 },
    { from: 3, to: 60, installment: 11040, IntRate: 0.1199 },
];
const DISB = [
    { date: new Date(2025, 4 - 1, 25), amount: 230_000 },
    { date: new Date(2025, 4 - 1, 25), amount: 160_000 },
    { date: new Date(2025, 4 - 1, 28), amount: 100_000 },
    { date: new Date(2025, 4 - 1, 28), amount: 10_000 },
];
const res = CalculateDisbursementPlan(
    DISB,
    PA,
    PAYMENTFIRSTDATE,
    PAYMENTDUEDAY
);

for (let r of res) {
    console.log(`${r.thismonthpaymentdate},${r.PA},${r.IDA},${r.DP},${r.RP}`);
}