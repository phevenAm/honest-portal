type WIPProps = {
  children: React.ReactNode;
};

export default function WIP({ children }: WIPProps) {
  if (!import.meta.env.DEV) return null;
  return <>{children}</>;
}
