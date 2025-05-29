const lastday = require("./lastday");
const daysDifference = require("./daysDifference");
const round = require("./round");
const getThisPayment = require("./getThisPayment");
const monthsInAYear = require("./monthsInAYear");
const daysInAYear = require("./daysInAYear");

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
  const firstPayment = PaymentAmount[0];
  const lastPayment = PaymentAmount[PaymentAmount.length - 1];
  const TERM = lastPayment.to;
  let date = PAYMENTFIRSTDATE;
  let RemainingPrincipal = Principal;
  let month = date.getMonth();
  let year = date.getFullYear();
  let AccrueInterest = 0;
  let lastPaymentAmount = 0;
  let DeductInterests = 0;
  let AccrueInterestLastPayment = 0;
  let prevmonthpaymentdate = PAYMENTFIRSTDATE;
  let daysDifferences = daysDifference(DISBURSEMENTDATE, PAYMENTFIRSTDATE);

  if (daysDifferences >= 45) return [`Error daysDifference: ${daysDifferences} >= ${45}`];
  if (daysDifferences < 0) return [`Error daysDifference: ${daysDifferences} < ${0}`];

  const firstIntRate = firstPayment.IntRate;
  const firstInstallment = firstPayment.installment;
  const isTopupFirst = TopupStart <= 1;
  let InterestDueAmount = round(
    ((RemainingPrincipal * daysDifferences) / daysInAYear) * firstIntRate
  );
  let InterestThisPayment = InterestDueAmount;
  let DeductPrincipal = round(
    firstInstallment + (isTopupFirst ? TopupAmt : 0) - InterestDueAmount
  );
  RemainingPrincipal = round(RemainingPrincipal - DeductPrincipal, 2);

  retArr.push({
    c: countInstallment + 1,
    prevmonthpaymentdate: null,
    thismonthpaymentdate: PAYMENTFIRSTDATE.toLocaleDateString(),
    DD: daysDifferences,
    PA: firstInstallment + (TopupStart == 1 ? TopupAmt : 0),
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
      countInstallment !== 1 ||
      PAYMENTDUEDAY < 25 ||
      new Date(PAYMENTFIRSTDATE).getDate() > 5
    ) {
      month++;
      if (month >= monthsInAYear) {
        month -= monthsInAYear;
        year++;
      }
    }
    AccrueInterestLastPayment = AccrueInterest;
    let EOMONTH = lastday(year, month);
    let thismonthpaymentdate =
      PAYMENTDUEDAY <= EOMONTH
        ? new Date(year, month, PAYMENTDUEDAY)
        : new Date(year, month, EOMONTH);

    daysDifferences = daysDifference(prevmonthpaymentdate, thismonthpaymentdate);

    let thispayment = getThisPayment(PaymentAmount, countInstallment + 1);
    let thisIntRate = thispayment.IntRate;
    let thisInstallment = thispayment.installment;
    let isTopup = TopupStart <= countInstallment + 1;

    InterestDueAmount = round(
      ((RemainingPrincipal * daysDifferences) / daysInAYear) * thisIntRate
    );
    DeductPrincipal = round(
      thisInstallment + (isTopup ? TopupAmt : 0) - (InterestDueAmount + AccrueInterest)
    );
    InterestThisPayment = InterestDueAmount;

    if (DeductPrincipal < 0) {
      AccrueInterest = -DeductPrincipal;
      DeductPrincipal = 0;
      InterestDueAmount = thisInstallment;
    } else {
      AccrueInterest = 0;
    }

    if (DeductPrincipal >= RemainingPrincipal || countInstallment + 1 >= TERM) {
      DeductPrincipal = RemainingPrincipal;
      DeductInterests = InterestThisPayment + AccrueInterestLastPayment;
      InterestDueAmount = round(InterestDueAmount + AccrueInterest);
      lastPaymentAmount = round(RemainingPrincipal + InterestDueAmount);
      AccrueInterest = 0;
      RemainingPrincipal = 0;
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
        PA: thisInstallment + (isTopup ? TopupAmt : 0),
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

module.exports = CalculateInstallmentPlan;