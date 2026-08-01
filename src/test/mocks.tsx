import React from "react";
import { vi } from "vitest";

vi.mock("next/link", () => {
  const Link = ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  Link.displayName = "MockLink";
  return { default: Link };
});

vi.mock("next/image", () => {
  const Image = ({
    src,
    alt,
    fill,
    sizes,
    placeholder,
    blurDataURL,
    className,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
    placeholder?: string;
    blurDataURL?: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-fill={fill ? "true" : undefined}
      data-sizes={sizes}
      data-placeholder={placeholder}
      data-blur-url={blurDataURL}
      className={className}
      {...props}
    />
  );
  Image.displayName = "MockImage";
  return { default: Image };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

vi.mock("framer-motion", async () => {
  const React = (await import("react")).default;
  return {
    motion: new Proxy(
      {},
      {
        get: (_target, prop: string) => {
          const tag = typeof prop === "string" ? prop : "div";
          const Component = React.forwardRef<HTMLUnknownElement, Record<string, unknown>>(
            (props, ref) => React.createElement(tag, { ...props, ref })
          );
          Component.displayName = `motion.${tag}`;
          return Component;
        },
      }
    ),
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false,
  };
});

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn().mockReturnValue(vi.fn()),
  useAction: vi.fn().mockReturnValue(vi.fn()),
  useConvex: vi.fn(),
  useConvexClient: vi.fn(),
  ConvexProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signIn: vi.fn(), signOut: vi.fn() }),
  ConvexProviderWithAuth: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("convex/_generated/api", () => ({
  api: {
    auth: { getMe: "convex.auth.getMe" },
    reviews: { createReview: "convex.reviews.createReview" },
    vehicles: {
      list: "convex.vehicles.list",
      get: "convex.vehicles.get",
      create: "convex.vehicles.create",
    },
    bookings: {
      listByUser: "convex.bookings.listByUser",
      create: "convex.bookings.create",
    },
    messages: {
      listConversations: "convex.messages.listConversations",
      listMessages: "convex.messages.listMessages",
      send: "convex.messages.send",
    },
  },
}));

vi.mock("@/lib/convex", () => ({
  ConvexClientProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/script", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));
