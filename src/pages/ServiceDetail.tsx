import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { SERVICES } from "@/lib/services";
import { FacebookCTA } from "@/components/site/FacebookCTA";
import topo from "@/assets/topo-map.jpg";
import NotFound from "./NotFound";

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return <NotFound />;

  const idx = SERVICES.findIndex((s) => s.slug === slug);
  const next = SERVICES[(idx + 1) % SERVICES.length];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <img src={topo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
        <div className="container relative pt-12 md:pt-20 pb-16 md:pb-24">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All services
          </Link>
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.25em] text-primary mb-4">Service</div>
            <h1 className="font-serif text-4xl md:text-6xl text-foreground leading-[1.05] mb-6 text-balance">
              {service.name}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{service.short}</p>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24 grid lg:grid-cols-3 gap-12 lg:gap-16">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl mb-5">Overview</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{service.description}</p>
          </div>

          <div>
            <h2 className="font-serif text-2xl md:text-3xl mb-5">What's included</h2>
            <ul className="space-y-3">
              {service.details.map((d) => (
                <li key={d} className="flex items-start gap-3 text-foreground/85">
                  <Check className="h-5 w-5 mt-0.5 text-primary shrink-0" strokeWidth={2} />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-serif text-2xl md:text-3xl mb-5">Common use cases</h2>
            <div className="flex flex-wrap gap-2">
              {service.uses.map((u) => (
                <span
                  key={u}
                  className="text-sm px-4 py-2 rounded-sm bg-secondary text-secondary-foreground"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-gradient-forest text-primary-foreground p-8 rounded-sm shadow-deep">
            <h3 className="font-serif text-2xl mb-3">Get a quote</h3>
            <p className="text-primary-foreground/75 text-sm leading-relaxed mb-6">
              Send your documents and lot details on Facebook. We'll review and reply with a
              timeline and quote.
            </p>
            <FacebookCTA variant="light" className="w-full justify-center" />
          </div>
        </aside>
      </section>

      <section className="border-t border-border bg-secondary/30">
        <div className="container py-10 flex items-center justify-between gap-6">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Next service</div>
          <Link
            to={`/services/${next.slug}`}
            className="group inline-flex items-center gap-3 font-serif text-lg md:text-2xl text-foreground hover:text-primary transition-colors"
          >
            {next.name}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
};

export default ServiceDetail;
