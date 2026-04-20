import { FileText, AlertCircle, CheckCircle, Shield, Wallet } from "lucide-react";

const Terms = () => {
  return (
    <>
      <section className="container pt-16 md:pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-6">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Legal</div>
            <h1 className="font-serif text-3xl md:text-5xl text-foreground leading-tight text-balance">
              Terms & Conditions
            </h1>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-sm p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Important Notice</p>
                <p className="text-muted-foreground">By engaging Rañola Surveying Services for any surveying work, you agree to the following terms and conditions. Please read carefully before proceeding with your booking.</p>
              </div>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground">
            <h2 className="font-serif text-xl text-foreground mt-8 mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Booking & Down Payment
            </h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li><strong className="text-foreground">Down Payment Required:</strong> A non-refundable down payment is required to secure your booking and begin the survey process. The amount varies depending on the service type and project scope.</li>
              <li>Your slot is only confirmed upon receipt of the down payment.</li>
              <li>Contact us for a detailed quotation based on your specific requirements.</li>
            </ul>

            <h2 className="font-serif text-xl text-foreground mt-8 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Client Responsibilities
            </h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li><strong className="text-foreground">Document Accuracy:</strong> Clients are responsible for providing accurate land titles, tax declarations, and other required documents. Delays caused by incomplete or incorrect documents are not our responsibility.</li>
              <li>Clients must ensure access to the property for our survey team.</li>
              <li>Any disputes with adjoining landowners must be disclosed before work begins.</li>
            </ul>

            <h2 className="font-serif text-xl text-foreground mt-8 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Service & Liability
            </h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li><strong className="text-foreground">Third-Party Delays:</strong> We are not liable for delays caused by government agencies (DENR, LRA, LGU), adjoining landowners, or other third parties.</li>
              <li>Survey results are based on available documents and field measurements. Hidden encumbrances not disclosed in official records are beyond our control.</li>
              <li>All plans leaving our office are signed and sealed by a licensed Geodetic Engineer.</li>
            </ul>

            <h2 className="font-serif text-xl text-foreground mt-8 mb-4">Payment Terms</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Full payment is due upon delivery of signed plans, unless otherwise agreed in writing.</li>
              <li>We accept cash, bank transfers, and GCash.</li>
              <li>Late payments may incur additional fees and delay document release.</li>
            </ul>

            <h2 className="font-serif text-xl text-foreground mt-8 mb-4">Revisions Policy</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>Minor revisions due to our error are included at no additional cost.</li>
              <li>Major changes requested by the client after plan completion may incur additional charges based on the scope of changes.</li>
              <li>Revision requests must be submitted within 30 days of plan delivery.</li>
            </ul>

            <div className="border-t border-border pt-8 mt-8 text-sm text-muted-foreground">
              <p>Last updated: January 2025</p>
              <p className="mt-2">For questions about these terms, please contact us before proceeding with your survey booking.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Terms;