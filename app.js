const lastday = require("./lastday");
const daysDifference = require("./daysDifference");
const round = require("./round");
const getThisPayment = require("./getThisPayment");

const monthsInAYear = 12;
const daysInAYear = 365

const CalculateInstallmentPlan = (
  DISBURSEMENTDATE,
  PAYMENTFIRSTDATE,
  PAYMENTDUEDAY,
  Principal,
  PaymentAmount
) => {
  const retArr = [];
  const TERM = PaymentAmount.at(-1).to
  let date = PAYMENTFIRSTDATE;
  let RemainingPrincipal = Principal;
  let month = date.getMonth();
  let year = date.getFullYear();

  let countInstallment = 0;
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
    PaymentAmount.at(0).installment - InterestDueAmount
  );
  RemainingPrincipal = RemainingPrincipal - DeductPrincipal;

  retArr.push({
    c: 1,
    prevmonthpaymentdate: null,
    thismonthpaymentdate: PAYMENTFIRSTDATE.toLocaleDateString(),
    DD: daysDifferences,
    PA: PaymentAmount.at(0).installment,
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
    DeductPrincipal = round(thispayment.installment - (InterestDueAmount+AccrueInterest));
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
      RemainingPrincipal = round(RemainingPrincipal - DeductPrincipal);
      retArr.push({
        c: countInstallment + 1,
        prevmonthpaymentdate: prevmonthpaymentdate.toLocaleDateString(),
        thismonthpaymentdate: thismonthpaymentdate.toLocaleDateString(),
        DD: daysDifferences,
        PA: thispayment.installment,
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
      new Date(`${new Date().getFullYear()}/${new Date().getMonth()+1}/
      ${1}
    `),
    PAYMENTFIRSTDATE =
      new Date(`${new Date().getFullYear()}/${new Date().getMonth()+1}/
      ${lastday(new Date().getFullYear(), new Date().getMonth())}
    `),
    PAYMENTDUEDAY = 25,
    Principal,
    PaymentAmount,
  );
}

module.exports = {
  CalculateInstallmentPlan,
  CalculateInstallmentPlan_DE,
};