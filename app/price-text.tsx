export function PriceText({ value }: { value: string }) {
  const amount = /\$[\d,]+|\d[\d\s]*\sГРН/.exec(value);

  if (!amount) return <>{value}</>;

  return (
    <>
      {value.slice(0, amount.index)}
      <span className="price-amount">{amount[0]}</span>
      {value.slice(amount.index + amount[0].length)}
    </>
  );
}
