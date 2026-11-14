type CapabilityListProps = {
  items: string[];
};

export function CapabilityList({ items }: CapabilityListProps) {
  return (
    <ul className="capability-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
