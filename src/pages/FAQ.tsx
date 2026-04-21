import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      q: "How long does a typical survey take?",
      a: "Most residential surveys are completed within 1 to 2 days, depending on lot size and complexity. Subdivision and consolidation surveys may take 1 to 2 days due to additional documentation and agency coordination requirements."
    },
    {
      q: "What documents do I need to provide?",
      a: "Typically we need a copy of your land title (TCT/OCT), tax declaration, and any existing survey plans. For inheritance-related surveys, we may also require extra judicial settlement documents or court orders."
    },
    {
      q: "Do you handle government filing?",
      a: "Yes, we prepare all necessary plans and documents for DENR, LRA, and local government submissions. We also coordinate with adjoining landowners and barangay offices as required by the process."
    },
    {
      q: "What areas do you service?",
      a: "All municipality in Masbate."
    },
    {
      q: "Is a down payment required?",
      a: "Yes, a down payment is required to secure your booking and begin the survey process. The amount varies depending on the service type and project scope. Contact us for a detailed quotation. 50% downpayment for schedule and remaining 50% for full payment if you want to claim your plan."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept cash, bank transfers, Maya wallet, Palawan Pay, Land bank and GCash. Payment terms and schedules will be outlined in your quotation. Full payment is typically due upon delivery of signed plans."
    },
    {
      q: "Can you help with boundary disputes?",
      a: "Yes, our relocation surveys are specifically designed to help resolve boundary disputes. We recover original lot corners and provide legally defensible documentation that can be used in court if necessary."
    }
  ];

  return (
    <>
      <section className="container pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Help Center</div>
            <h1 className="font-serif text-3xl md:text-5xl text-foreground leading-tight text-balance">
              Frequently asked questions.
            </h1>
          </div>

          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border last:border-b-0">
                <details className="group py-5">
                  <summary className="flex items-start justify-between cursor-pointer list-none">
                    <span className="font-medium text-foreground pr-4">{faq.q}</span>
                    <span className="shrink-0 text-muted-foreground group-open:rotate-180 transition-transform">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <p className="text-muted-foreground leading-relaxed mt-3 pr-8">
                    {faq.a}
                  </p>
                </details>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wide text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              Contact us
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;