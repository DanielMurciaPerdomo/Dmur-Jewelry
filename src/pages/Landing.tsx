import { About } from "../components/landing/About";
import { CTAFinal } from "../components/landing/CTAFinal";
import { FeaturedProducts } from "../components/landing/FeaturedProducts";
import { Hero } from "../components/landing/Hero";
import { Materials } from "../components/landing/Materials";
import { useSettings } from "../hooks/useSettings";

export const Landing = () => {
  const settings = useSettings();

  return (
    <main className="flex flex-col">
      <Hero whatsappNumber={settings?.whatsapp_number} />
      <About />
      <Materials />
      <FeaturedProducts />
      <CTAFinal whatsappNumber={settings?.whatsapp_number} />
    </main>
  );
};
