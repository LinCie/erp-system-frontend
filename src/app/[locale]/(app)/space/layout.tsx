type Props = {
  children: React.ReactNode;
};

/**
 * Layout for space routes.
 * Provides consistent padding for all nested space pages.
 */
export default function SpaceLayout({ children }: Props) {
  return <div className="flex flex-1 flex-col gap-4">{children}</div>;
}
