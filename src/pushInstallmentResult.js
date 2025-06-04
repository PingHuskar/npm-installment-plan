function pushInstallmentResult(
    arr,
    c,
    prevmonthpaymentdate,
    thismonthpaymentdate,
    daysDifferences,
    PA,
    IDA,
    DP,
    DI,
    RP,
    AI,
    AILP,
    ITP
) {
    arr.push({
        c,
        prevmonthpaymentdate: prevmonthpaymentdate ? prevmonthpaymentdate.toLocaleDateString() : null,
        thismonthpaymentdate: thismonthpaymentdate.toLocaleDateString(),
        DD: daysDifferences,
        PA,
        IDA,
        DP,
        DI,
        RP,
        AI,
        AILP,
        ITP,
    });
}

export default pushInstallmentResult;