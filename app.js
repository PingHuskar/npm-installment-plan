const lastday = require("./lastday");
const daysDifference = require("./daysDifference");
const round = require("./round");
const getThisPayment = require("./getThisPayment");

const monthsInAYear = require("./monthsInAYear");
const daysInAYear = require("./daysInAYear")

const CalculateInstallmentPlan = (
  DISBURSEMENTDATE,
  PAYMENTFIRSTDATE,
  PAYMENTDUEDAY,
  Principal,
  PaymentAmount,
  TopupAmt = 0,
  TopupStart = 1,
  countInstallment = 0
) => {
  const retArr = [];
  const TERM = PaymentAmount.at(-1).to
  let date = PAYMENTFIRSTDATE;
  let RemainingPrincipal = Principal;
  let month = date.getMonth();
  let year = date.getFullYear();
  let AccrueInterest = 0
  let lastPaymentAmount = 0;
  let DeductInterests = 0;
  let AccrueInterestLastPayment = 0;
  let prevmonthpaymentdate = PAYMENTFIRSTDATE;
  let daysDifferences = daysDifference(DISBURSEMENTDATE, PAYMENTFIRSTDATE);
  if (daysDifferences >= 45) return [`Error daysDifference: ${daysDifferences} >= ${45}`];
  if (daysDifferences < 0) return [`Error daysDifference: ${daysDifferences} < ${0}`];
  let InterestDueAmount = round(
    ((RemainingPrincipal * daysDifferences) / daysInAYear) *
    PaymentAmount.at(0).IntRate
  );
  let InterestThisPayment = InterestDueAmount;
  let DeductPrincipal = round(
    PaymentAmount.at(0).installment + (TopupStart <= 1 ? TopupAmt : 0) - InterestDueAmount
  );
  RemainingPrincipal = round(RemainingPrincipal - DeductPrincipal, 2);
  retArr.push({
    c: countInstallment + 1,
    prevmonthpaymentdate: null,
    thismonthpaymentdate: PAYMENTFIRSTDATE.toLocaleDateString(),
    DD: daysDifferences,
    PA: PaymentAmount.at(0).installment + (TopupStart == 1 ? TopupAmt : 0),
    IDA: InterestDueAmount,
    DP: DeductPrincipal,
    RP: RemainingPrincipal,
    AI: AccrueInterest,
    AILP: 0,
    ITP: InterestThisPayment,
  });
  countInstallment++;

  while (true) {
    if (countInstallment + 1 > TERM) break;
    if (
      countInstallment == 1 &&
      PAYMENTDUEDAY >= 25 &&
      new Date(PAYMENTFIRSTDATE).getDate() <= 5
    ) {
    } else {
      month++;
    }
    AccrueInterestLastPayment = AccrueInterest;
    if (month >= monthsInAYear) {
      month -= monthsInAYear;
      year++;
    }
    let EOMONTH = lastday(year, month);
    let thismonthpaymentdate;
    if (PAYMENTDUEDAY <= EOMONTH) {
      thismonthpaymentdate = new Date(year, month, PAYMENTDUEDAY);
    } else {
      thismonthpaymentdate = new Date(year, month, EOMONTH);
    }
    daysDifferences = daysDifference(
      prevmonthpaymentdate,
      thismonthpaymentdate
    );
    let thispayment = getThisPayment(PaymentAmount, countInstallment + 1);
    InterestDueAmount = round(
      ((RemainingPrincipal * daysDifferences) / daysInAYear) * thispayment.IntRate
    );
    DeductPrincipal = round(
      thispayment.installment +
      (TopupStart <= countInstallment + 1 ? TopupAmt : 0) -
      (InterestDueAmount + AccrueInterest)
    );
    InterestThisPayment = InterestDueAmount;
    if (DeductPrincipal < 0) {
      AccrueInterest = -DeductPrincipal
      DeductPrincipal = 0
      InterestDueAmount = thispayment.installment
    } else {
      AccrueInterest = 0
    }

    if ((DeductPrincipal >= RemainingPrincipal) || (countInstallment + 1 >= TERM)) {
      DeductPrincipal = RemainingPrincipal;
      DeductInterests = InterestThisPayment + AccrueInterestLastPayment;
      InterestDueAmount = round(InterestDueAmount + AccrueInterest);
      lastPaymentAmount = round(RemainingPrincipal + InterestDueAmount);
      AccrueInterest = 0
      RemainingPrincipal = 0
      retArr.push({
        c: countInstallment + 1,
        prevmonthpaymentdate: prevmonthpaymentdate.toLocaleDateString(),
        thismonthpaymentdate: thismonthpaymentdate.toLocaleDateString(),
        DD: daysDifferences,
        PA: lastPaymentAmount,
        IDA: InterestDueAmount,
        DP: DeductPrincipal,
        DI: DeductInterests,
        RP: RemainingPrincipal,
        AI: AccrueInterest,
        AILP: AccrueInterestLastPayment,
        ITP: InterestThisPayment,
      });
      break;
    } else {
      RemainingPrincipal = round(RemainingPrincipal - DeductPrincipal, 2);
      retArr.push({
        c: countInstallment + 1,
        prevmonthpaymentdate: prevmonthpaymentdate.toLocaleDateString(),
        thismonthpaymentdate: thismonthpaymentdate.toLocaleDateString(),
        DD: daysDifferences,
        PA:
          (thispayment.installment +
            (TopupStart <= countInstallment + 1 ? TopupAmt : 0)),
        IDA: InterestDueAmount,
        DP: DeductPrincipal,
        DI: DeductInterests,
        RP: RemainingPrincipal,
        AI: AccrueInterest,
        AILP: AccrueInterestLastPayment,
        ITP: InterestThisPayment,
      });
    }
    prevmonthpaymentdate = thismonthpaymentdate;
    countInstallment++;
  }
  return retArr;
};

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

const CalculateDisbursementPlan = (DISB,
  PA,
  PAYMENTFIRSTDATE,
  PAYMENTDUEDAY
) => {
  const retArr = []
  let installment = PA[0].installment
  let intrate = PA[0].IntRate
  let interestdue1s = []
  for (let disburse of DISB) {
    let daysDifferences = daysDifference(disburse.date, PAYMENTFIRSTDATE);
    if (daysDifferences >= 45) return [`Error daysDifference: ${daysDifferences} >= ${45}`];
    if (daysDifferences < 0) return [`Error daysDifference: ${daysDifferences} < ${0}`];
    let InterestDueAmount = round(
      ((disburse.amount * daysDifferences) / daysInAYear) * intrate
      , 2);
    interestdue1s.push(InterestDueAmount)
  }
  let totalinterestdue1 = round(interestdue1s.reduce((a, b) => a + b, 0), 2)
  let Principal = DISB.reduce((a, b) => a + b.amount, 0)
  let DeductPrincipal = installment - totalinterestdue1
  let RemainingPrincipal = round(Principal - DeductPrincipal, 2)
  let countInstallment = 0
  retArr.push({
    c: countInstallment + 1,
    prevmonthpaymentdate: null,
    thismonthpaymentdate: PAYMENTFIRSTDATE.toLocaleDateString(),
    PA: installment,
    IDA: totalinterestdue1,
    DP: DeductPrincipal,
    DI: totalinterestdue1,
    RP: RemainingPrincipal,
    AI: 0,
    AILP: 0,
    ITP: totalinterestdue1,
  });
  countInstallment++;
  let thismonthpaymentdate;
  (function () {
    let date = PAYMENTFIRSTDATE;
    let month = date.getMonth()
    let year = date.getFullYear()
    if (
      countInstallment == 1 &&
      PAYMENTDUEDAY >= 25 &&
      new Date(PAYMENTFIRSTDATE).getDate() <= 5
    ) {
    } else {
      month++;
    }
    if (month >= monthsInAYear) {
      month -= monthsInAYear;
      year++;
    }
    let EOMONTH = lastday(year, month);
    if (PAYMENTDUEDAY <= EOMONTH) {
      thismonthpaymentdate = new Date(year, month, PAYMENTDUEDAY);
    } else {
      thismonthpaymentdate = new Date(year, month, EOMONTH);
    }
  })()
  const ex = CalculateInstallmentPlan(
    DISBURSEMENTDATE = PAYMENTFIRSTDATE,
    PAYMENTFIRSTDATE = thismonthpaymentdate,
    PAYMENTDUEDAY,
    Principal = RemainingPrincipal,
    PA,
    0,
    0,
    countInstallment = 1,
  );
  return [...retArr, ...ex]
}
module.exports = {
  CalculateInstallmentPlan,
  CalculateInstallmentPlan_DE,
  CalculateDisbursementPlan,
};