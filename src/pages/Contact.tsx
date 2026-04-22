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

      <section className="container mb-16 md:mb-24 py-20 grid md:grid-cols-2 gap-px bg-border rounded-sm overflow-hidden shadow-soft">
        <div className="bg-card p-8 md:p-10 space-y-6">
          <div className="flex items-start gap-4">
            <MapPin className="h-5 w-5 mt-1 text-primary" />
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Office</div>
              <a
                href="https://www.google.com/maps?q=Rañola+Surveying+Office"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary underline-offset-4 transition-colors"
              >
                {ADDRESS}
              </a>
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
              <div className="text-foreground">Mon – Sat · 9:00 AM – 4:00 PM</div>
            </div>
          </div>
        </div>
        <div className="bg-card min-h-[320px] relative">
          <iframe
            title="Office location"
            className="absolute inset-0 h-full w-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3897.698644738569!2d123.65621037544109!3d12.336058987923915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a6dd13327c3b5d%3A0x330ba42e6d450687!2sRa%C3%B1ola%20Surveying%20Office!5e0!3m2!1sen!2sph!4v1776817015433!5m2!1sen!2sph"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
};

export default Contact;
