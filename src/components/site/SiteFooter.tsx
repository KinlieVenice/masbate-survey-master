import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook } from "lucide-react";
import { ADDRESS, EMAIL, FACEBOOK_URL, PHONE, SERVICES } from "@/lib/services";
import logo from "@/assets/ranola-logo.jpg";

export const SiteFooter = () => {
  return (
    <footer className="bg-gradient-forest text-primary-foreground">
      <div className="container py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-background/5 rounded-sm overflow-hidden">
              <img src={logo} alt="Rañola Surveying" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-serif text-xl">Rañola</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-primary-foreground/60">
                Surveying Services
              </div>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/70 max-w-xs leading-relaxed">
            Licensed Geodetic Engineering services for landowners across Masbate and beyond.
          </p>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50 mb-4">Services</h4>
          <ul className="space-y-2.5">
            {SERVICES.slice(0, 5).map((s) => (
              <li key={s.slug}>
                <Link
                  to={`/services/${s.slug}`}
                  className="text-sm text-primary-foreground/85 hover:text-primary-foreground transition-colors"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-5 space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50 mb-4">Contact</h4>
          <div className="space-y-3 text-sm">
            <a href={`tel:${PHONE}`} className="flex items-start gap-3 text-primary-foreground/85 hover:text-primary-foreground">
              <Phone className="h-4 w-4 mt-0.5 shrink-0" /> {PHONE}
            </a>
            <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 text-primary-foreground/85 hover:text-primary-foreground">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" /> {EMAIL}
            </a>
            <a
              href="https://www.google.com/maps/place/Ra%C3%B1ola+Surveying+Office/@12.336059,123.658385,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-primary-foreground/85 hover:text-primary-foreground transition-colors"
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              {ADDRESS}
            </a>

            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-sm bg-primary-foreground/10 hover:bg-primary-foreground/15 border border-primary-foreground/15 text-sm transition-colors"
            >
              <Facebook className="h-4 w-4" /> Message on Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container py-6 flex flex-col md:flex-row gap-2 items-center justify-between text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Rañola Surveying Services. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/faq" className="hover:text-primary-foreground transition-colors">FAQ</Link>
            <Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms</Link>
            <span>Mobo, Masbate · Philippines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
