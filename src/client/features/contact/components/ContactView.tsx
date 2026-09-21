import { usePageTitle } from '../../core/hooks/usePageTitle';
import { useContactForm } from '../hooks/useContactForm';
import ContactIntro from './ContactIntro';
import ContactInfoColumn from './ContactInfoColumn';
import ContactFormSection from './ContactFormSection';
import StudioMapSection from './StudioMapSection';
import HelpGuideBanner from './HelpGuideBanner';

export default function ContactView() {
  usePageTitle("Contact");
  const contactForm = useContactForm();

  return (
    <div className="space-y-24 pb-16">
      <ContactIntro />

      {/* Main Grid: Form, Info & map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <ContactInfoColumn />
          <ContactFormSection form={contactForm} />
        </div>
      </section>

      {/* Google Maps Studio Location Embed Section */}
      <StudioMapSection />

      {/* FAQ Banner Link */}
      <HelpGuideBanner />
    </div>
  );
}