import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ADDRESS, EMAIL, PHONE } from "@/lib/services";
import { FacebookCTA } from "@/components/site/FacebookCTA";

const Contact = () => {
  return (
    <>
      <section className="container pt-16 md:pt-24 pb-16">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Contact</div>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground leading-[1.05] mb-6 text-balance">
            Send a message —<br />
            <span className="italic font-light text-primary">we reply same day.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            The fastest way to reach us is on Facebook. Send your documents, photos, and questions
            in one message and we'll get back with next steps.
          </p>
          <FacebookCTA />
        </div>
      </section>

      <section className="container pb-20 grid md:grid-cols-2 gap-px bg-border rounded-sm overflow-hidden shadow-soft">
        <div className="bg-card p-8 md:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 mt-1 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Office</div>
              <div className="text-foreground">{ADDRESS}</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Phone className="h-5 w-5 mt-1 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Phone</div>
              <a href={`tel:${PHONE}`} className="text-foreground hover:text-primary">{PHONE}</a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Mail className="h-5 w-5 mt-1 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</div>
              <a href={`mailto:${EMAIL}`} className="text-foreground hover:text-primary break-all">{EMAIL}</a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="h-5 w-5 mt-1 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Office hours</div>
              <div className="text-foreground">Mon – Sat · 8:00 AM – 5:00 PM</div>
            </div>
          </div>
        </div>
        <div className="bg-card min-h-[320px] relative">
          <iframe
            title="Office location"
            className="absolute inset-0 h-full w-full"
            src="https://www.google.com/maps?q=Mobo,+Masbate&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
};

export default Contact;
