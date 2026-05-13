import { Login } from "@/components/blocks/Login";

export default function Home() {
  return (
    <Login
      heading="Welcome to RFI Platform"
      logo={{
        url: "/",
        src: "https://sobharealty.com/sites/default/files/sobha-logo.png", // Fallback logo URL if local not available
        alt: "SOBHA Realty",
      }}
    />
  );
}
