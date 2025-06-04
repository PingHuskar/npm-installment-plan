export default (arr, params) => {
    arr.push({
        c: params.c,
        prevmonthpaymentdate: params.prevmonthpaymentdate ? params.prevmonthpaymentdate.toLocaleDateString() : null,
        thismonthpaymentdate: params.thismonthpaymentdate.toLocaleDateString(),
        DD: params.daysDifferences,
        PA: params.PA,
        IDA: params.InterestDueAmount,
        DP: params.DeductPrincipal,
        DI: params.DeductInterests,
        RP: params.RemainingPrincipal,
        AI: params.AccrueInterest,
        AILP: params.AccrueInterestLastPayment,
        ITP: params.InterestThisPayment,
    });
}
