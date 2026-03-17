import { About } from "../components/landing/About";
import { CTAFinal } from "../components/landing/CTAFinal";
import { FeaturedProducts } from "../components/landing/FeaturedProducts";
import { Hero } from "../components/landing/Hero";
import { Materials } from "../components/landing/Materials";
import { useSettingsContext } from "../context/SettingsContext";

export const Landing = () => {
  const { settings } = useSettingsContext();

  return (
    <main className="flex flex-col">
      <Hero whatsappNumber={settings?.whatsapp_number} businessName={settings?.business_name} />
      <FeaturedProducts />
      <Materials />
      <About />
      <CTAFinal whatsappNumber={settings?.whatsapp_number} businessName={settings?.business_name} />
    </main>
  );
};
